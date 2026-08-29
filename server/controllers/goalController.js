import Goal from "../models/Goal.js";
import Notification from "../models/Notification.js";
import { sendError } from "../middleware/errorMiddleware.js";
import { isValidId, parseExpectedVersion, pick } from "../utils/request.js";

const mutableFields = ["name", "targetAmount", "targetDate", "color", "notes"];

const withProgress = (goal) => {
  const value = goal.toObject ? goal.toObject() : goal;
  const percentage = value.targetAmount > 0
    ? Math.min(Math.round((value.currentAmount / value.targetAmount) * 100), 100)
    : 0;
  return { ...value, percentage, remaining: Math.max(value.targetAmount - value.currentAmount, 0) };
};

const sendProgressNotification = async (userId, goal) => {
  try {
    await Notification.create({
      user: userId,
      type: "goal_progress",
      title: goal.status === "completed" ? "Goal completed" : "Goal updated",
      message: goal.status === "completed"
        ? `You reached your ${goal.name} savings goal.`
        : `Your ${goal.name} savings goal is now ${withProgress(goal).percentage}% funded.`,
      metadata: { goalId: goal._id, currentAmount: goal.currentAmount, targetAmount: goal.targetAmount },
    });
  } catch (error) {
    console.error("Failed to create goal notification", error);
  }
};

export const getGoals = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (["active", "completed", "archived"].includes(req.query.status)) filter.status = req.query.status;
    else if (req.query.status !== "all") filter.status = { $ne: "archived" };

    const goals = await Goal.find(filter).sort({ status: 1, targetDate: 1, createdAt: -1 }).lean();
    return res.json({ success: true, goals: goals.map(withProgress) });
  } catch (error) {
    return sendError(res, error, req);
  }
};

export const createGoal = async (req, res) => {
  try {
    const payload = pick(req.body, [...mutableFields, "currentAmount"]);
    const currentAmount = Number(payload.currentAmount || 0);
    const targetAmount = Number(payload.targetAmount);
    if (!Number.isFinite(currentAmount) || currentAmount < 0 || !Number.isFinite(targetAmount) || targetAmount <= 0) {
      return res.status(400).json({ success: false, message: "Enter valid goal amounts" });
    }
    if (currentAmount > targetAmount) {
      return res.status(400).json({ success: false, message: "Current savings cannot exceed the goal target" });
    }

    const goal = await Goal.create({
      user: req.user._id,
      ...payload,
      status: currentAmount >= targetAmount ? "completed" : "active",
    });
    return res.status(201).json({ success: true, goal: withProgress(goal) });
  } catch (error) {
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid goal data" });
    }
    return sendError(res, error, req);
  }
};

export const updateGoal = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false, message: "Goal not found" });
    const current = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!current) return res.status(404).json({ success: false, message: "Goal not found" });

    const updates = pick(req.body, mutableFields);
    if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, message: "No supported fields to update" });

    const expected = parseExpectedVersion(req);
    if (Number.isNaN(expected)) return res.status(400).json({ success: false, message: "Invalid version precondition" });
    if (expected !== null && expected !== current.__v) {
      return res.status(409).json({ success: false, message: "Goal changed since you opened it. Refresh and try again." });
    }

    const effectiveTarget = updates.targetAmount === undefined ? current.targetAmount : Number(updates.targetAmount);
    if (!Number.isFinite(effectiveTarget) || effectiveTarget <= 0) {
      return res.status(400).json({ success: false, message: "Target amount must be greater than zero" });
    }
    updates.status = current.currentAmount >= effectiveTarget ? "completed" : "active";

    const goal = await Goal.findOneAndUpdate(
      { _id: current._id, user: req.user._id, __v: current.__v },
      { $set: updates, $inc: { __v: 1 } },
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(409).json({ success: false, message: "Goal was updated by another request" });
    return res.json({ success: true, goal: withProgress(goal) });
  } catch (error) {
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid goal data" });
    }
    return sendError(res, error, req);
  }
};

export const contributeToGoal = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false, message: "Goal not found" });
    const amount = Math.round((Number(req.body.amount) + Number.EPSILON) * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000_000) {
      return res.status(400).json({ success: false, message: "Contribution must be a positive amount" });
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: "active" },
      [
        {
          $set: {
            currentAmount: { $min: ["$targetAmount", { $add: ["$currentAmount", amount] }] },
            __v: { $add: ["$__v", 1] },
          },
        },
        {
          $set: {
            status: { $cond: [{ $gte: ["$currentAmount", "$targetAmount"] }, "completed", "active"] },
          },
        },
      ],
      { new: true }
    );

    if (!goal) {
      const exists = await Goal.exists({ _id: req.params.id, user: req.user._id });
      return res.status(exists ? 409 : 404).json({
        success: false,
        message: exists ? "Only active goals can receive contributions" : "Goal not found",
      });
    }

    await sendProgressNotification(req.user._id, goal);
    return res.json({ success: true, goal: withProgress(goal) });
  } catch (error) {
    return sendError(res, error, req);
  }
};

export const archiveGoal = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false, message: "Goal not found" });
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { status: "archived" }, $inc: { __v: 1 } },
      { new: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });
    return res.json({ success: true, goal: withProgress(goal) });
  } catch (error) {
    return sendError(res, error, req);
  }
};
