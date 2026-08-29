import Recurring from "../models/Recurring.js";
import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";
import Notification from "../models/Notification.js";
import { sendError } from "../middleware/errorMiddleware.js";
import { isValidId, parseExpectedVersion, pick } from "../utils/request.js";

const mutableFields = ["title", "amount", "type", "category", "frequency", "nextDueDate", "endDate", "description", "status"];
const frequencies = new Set(["weekly", "monthly", "quarterly", "yearly"]);

const addMonthsClamped = (date, months) => {
  const source = new Date(date);
  const day = source.getUTCDate();
  const targetMonthStart = new Date(Date.UTC(source.getUTCFullYear(), source.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(targetMonthStart.getUTCFullYear(), targetMonthStart.getUTCMonth() + 1, 0)).getUTCDate();
  targetMonthStart.setUTCDate(Math.min(day, lastDay));
  targetMonthStart.setUTCHours(source.getUTCHours(), source.getUTCMinutes(), source.getUTCSeconds(), source.getUTCMilliseconds());
  return targetMonthStart;
};

export const nextOccurrence = (date, frequency) => {
  const value = new Date(date);
  if (frequency === "weekly") return new Date(value.getTime() + 7 * 24 * 60 * 60 * 1000);
  if (frequency === "monthly") return addMonthsClamped(value, 1);
  if (frequency === "quarterly") return addMonthsClamped(value, 3);
  if (frequency === "yearly") return addMonthsClamped(value, 12);
  throw new Error("Unsupported recurring frequency");
};

const validateCategory = (categoryId, userId, type) => {
  if (!isValidId(categoryId)) return null;
  return Category.findOne({ _id: categoryId, user: userId, type });
};

const validateSchedule = (payload) => {
  if (!frequencies.has(payload.frequency)) return "Select a supported recurring frequency";
  const nextDueDate = new Date(payload.nextDueDate);
  if (Number.isNaN(nextDueDate.getTime())) return "Enter a valid next due date";
  if (payload.endDate) {
    const endDate = new Date(payload.endDate);
    if (Number.isNaN(endDate.getTime()) || endDate < nextDueDate) return "End date must be on or after the next due date";
  }
  return null;
};

export const getRecurringItems = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (["active", "paused", "completed"].includes(req.query.status)) filter.status = req.query.status;
    else if (req.query.status !== "all") filter.status = { $ne: "completed" };

    const recurring = await Recurring.find(filter)
      .populate("category")
      .sort({ nextDueDate: 1, createdAt: -1 })
      .lean();
    return res.json({ success: true, recurring });
  } catch (error) {
    return sendError(res, error, req);
  }
};

export const createRecurringItem = async (req, res) => {
  try {
    const payload = pick(req.body, mutableFields);
    payload.status = "active";
    const scheduleError = validateSchedule(payload);
    if (scheduleError) return res.status(400).json({ success: false, message: scheduleError });

    const selectedCategory = await validateCategory(payload.category, req.user._id, payload.type);
    if (!selectedCategory) {
      return res.status(400).json({ success: false, message: "Select a valid category for this recurring item type" });
    }

    const recurring = await Recurring.create({ user: req.user._id, ...payload, category: selectedCategory._id });
    const populated = await Recurring.findById(recurring._id).populate("category");
    return res.status(201).json({ success: true, recurring: populated });
  } catch (error) {
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid recurring item data" });
    }
    return sendError(res, error, req);
  }
};

export const updateRecurringItem = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false, message: "Recurring item not found" });
    const current = await Recurring.findOne({ _id: req.params.id, user: req.user._id });
    if (!current) return res.status(404).json({ success: false, message: "Recurring item not found" });

    const updates = pick(req.body, mutableFields);
    if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, message: "No supported fields to update" });

    const expected = parseExpectedVersion(req);
    if (Number.isNaN(expected)) return res.status(400).json({ success: false, message: "Invalid version precondition" });
    if (expected !== null && expected !== current.__v) {
      return res.status(409).json({ success: false, message: "Recurring item changed since you opened it. Refresh and try again." });
    }

    const effective = {
      frequency: updates.frequency ?? current.frequency,
      nextDueDate: updates.nextDueDate ?? current.nextDueDate,
      endDate: Object.prototype.hasOwnProperty.call(updates, "endDate") ? updates.endDate : current.endDate,
    };
    const scheduleError = validateSchedule(effective);
    if (scheduleError) return res.status(400).json({ success: false, message: scheduleError });

    const effectiveType = updates.type ?? current.type;
    const effectiveCategory = updates.category ?? current.category;
    const selectedCategory = await validateCategory(effectiveCategory, req.user._id, effectiveType);
    if (!selectedCategory) return res.status(400).json({ success: false, message: "Select a valid category for this recurring item type" });
    updates.category = selectedCategory._id;

    const recurring = await Recurring.findOneAndUpdate(
      { _id: current._id, user: req.user._id, __v: current.__v },
      { $set: updates, $inc: { __v: 1 } },
      { new: true, runValidators: true }
    ).populate("category");
    if (!recurring) return res.status(409).json({ success: false, message: "Recurring item was updated by another request" });
    return res.json({ success: true, recurring });
  } catch (error) {
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid recurring item data" });
    }
    return sendError(res, error, req);
  }
};

export const postRecurringItem = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false, message: "Recurring item not found" });
    const recurring = await Recurring.findOne({ _id: req.params.id, user: req.user._id, status: "active" }).populate("category");
    if (!recurring) {
      const exists = await Recurring.exists({ _id: req.params.id, user: req.user._id });
      return res.status(exists ? 409 : 404).json({
        success: false,
        message: exists ? "Only active recurring items can be posted" : "Recurring item not found",
      });
    }

    if (!recurring.category || recurring.category.type !== recurring.type) {
      return res.status(409).json({ success: false, message: "Recurring item category is no longer valid" });
    }

    const dueDate = new Date(recurring.nextDueDate);
    const idempotencyKey = `recurring:${recurring._id}:${dueDate.toISOString()}`;
    let transaction = await Transaction.findOne({ user: req.user._id, idempotencyKey }).populate("category");

    if (!transaction) {
      try {
        transaction = await Transaction.create({
          user: req.user._id,
          title: recurring.title,
          amount: recurring.amount,
          type: recurring.type,
          category: recurring.category._id,
          description: recurring.description,
          date: dueDate,
          idempotencyKey,
        });
      } catch (error) {
        if (error?.code !== 11000) throw error;
        transaction = await Transaction.findOne({ user: req.user._id, idempotencyKey });
      }
    }

    const nextDueDate = nextOccurrence(dueDate, recurring.frequency);
    const completed = recurring.endDate && nextDueDate > recurring.endDate;
    const updatedRecurring = await Recurring.findOneAndUpdate(
      { _id: recurring._id, user: req.user._id, __v: recurring.__v, nextDueDate: recurring.nextDueDate },
      {
        $set: {
          nextDueDate,
          lastPostedAt: new Date(),
          ...(completed ? { status: "completed" } : {}),
        },
        $inc: { __v: 1 },
      },
      { new: true, runValidators: true }
    ).populate("category");

    const finalRecurring = updatedRecurring || await Recurring.findOne({ _id: recurring._id, user: req.user._id }).populate("category");
    if (!transaction.category?.name) transaction = await Transaction.findById(transaction._id).populate("category");

    if (updatedRecurring) {
      try {
        await Notification.create({
          user: req.user._id,
          type: "transaction_created",
          title: "Recurring item posted",
          message: `${recurring.title} was added to your transactions.`,
          metadata: { transactionId: transaction._id, recurringId: recurring._id, amount: recurring.amount },
        });
      } catch (error) {
        console.error("Failed to create recurring notification", error);
      }
    } else {
      res.setHeader("Idempotent-Replayed", "true");
    }

    return res.status(updatedRecurring ? 201 : 200).json({ success: true, transaction, recurring: finalRecurring });
  } catch (error) {
    return sendError(res, error, req);
  }
};

export const deleteRecurringItem = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false, message: "Recurring item not found" });
    const current = await Recurring.findOne({ _id: req.params.id, user: req.user._id });
    if (!current) return res.status(404).json({ success: false, message: "Recurring item not found" });

    const expected = parseExpectedVersion(req);
    if (Number.isNaN(expected)) return res.status(400).json({ success: false, message: "Invalid version precondition" });
    if (expected !== null && expected !== current.__v) {
      return res.status(409).json({ success: false, message: "Recurring item changed since you opened it. Refresh and try again." });
    }

    const recurring = await Recurring.findOneAndDelete({ _id: current._id, user: req.user._id, __v: current.__v });
    if (!recurring) return res.status(409).json({ success: false, message: "Recurring item changed before it could be deleted" });
    return res.json({ success: true, message: "Recurring item deleted" });
  } catch (error) {
    return sendError(res, error, req);
  }
};
