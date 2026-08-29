import Budget from "../models/Budget.js";
import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";
import { sendError } from "../middleware/errorMiddleware.js";
import { isValidId, parseExpectedVersion, pick } from "../utils/request.js";

const mutableFields = ["category", "amount", "month", "year"];

const findExpenseCategory = (categoryId, userId) => {
  if (!isValidId(categoryId)) return null;
  return Category.findOne({ _id: categoryId, user: userId, type: "expense" });
};

const validatePeriod = (month, year) => {
  const parsedMonth = Number(month);
  const parsedYear = Number(year);
  if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) return null;
  if (!Number.isInteger(parsedYear) || parsedYear < 1970 || parsedYear > 2200) return null;
  return { month: parsedMonth, year: parsedYear };
};

export const createBudget = async (req, res) => {
  try {
    const payload = pick(req.body, mutableFields);
    const period = validatePeriod(payload.month, payload.year);
    if (!period) return res.status(400).json({ success: false, message: "Invalid budget month or year" });

    const selectedCategory = await findExpenseCategory(payload.category, req.user._id);
    if (!selectedCategory) {
      return res.status(400).json({ success: false, message: "Select a valid expense category" });
    }

    const budget = await Budget.create({
      user: req.user._id,
      ...payload,
      ...period,
      category: selectedCategory._id,
    });
    const populated = await Budget.findById(budget._id).populate("category");
    return res.status(201).json({ success: true, budget: populated });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "Budget already exists for this category and month" });
    }
    if (error?.name === "ValidationError") return res.status(400).json({ success: false, message: "Invalid budget data" });
    return sendError(res, error, req);
  }
};

export const getBudgets = async (req, res) => {
  try {
    const now = new Date();
    const period = validatePeriod(
      req.query.month ?? now.getUTCMonth() + 1,
      req.query.year ?? now.getUTCFullYear()
    );
    if (!period) return res.status(400).json({ success: false, message: "Invalid budget month or year" });

    const { month, year } = period;
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month, 1));
    const budgets = await Budget.find({ user: req.user._id, month, year }).populate("category").lean();
    const categoryIds = budgets.map((budget) => budget.category?._id).filter(Boolean);

    const spentRows = categoryIds.length
      ? await Transaction.aggregate([
          {
            $match: {
              user: req.user._id,
              category: { $in: categoryIds },
              type: "expense",
              date: { $gte: monthStart, $lt: monthEnd },
            },
          },
          { $group: { _id: "$category", total: { $sum: "$amount" } } },
        ])
      : [];

    const spentByCategory = new Map(spentRows.map((row) => [String(row._id), row.total]));
    const enrichedBudgets = budgets.map((budget) => {
      const spent = budget.category ? spentByCategory.get(String(budget.category._id)) || 0 : 0;
      const remaining = Math.round((budget.amount - spent + Number.EPSILON) * 100) / 100;
      const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;
      return { ...budget, spent, remaining, percentage, overBudget: spent > budget.amount };
    });

    return res.json({ success: true, budgets: enrichedBudgets });
  } catch (error) {
    return sendError(res, error, req);
  }
};

export const updateBudget = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false, message: "Budget not found" });
    const current = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!current) return res.status(404).json({ success: false, message: "Budget not found" });

    const updates = pick(req.body, mutableFields);
    if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, message: "No supported fields to update" });

    const expected = parseExpectedVersion(req);
    if (Number.isNaN(expected)) return res.status(400).json({ success: false, message: "Invalid version precondition" });
    if (expected !== null && expected !== current.__v) {
      return res.status(409).json({ success: false, message: "Budget changed since you opened it. Refresh and try again." });
    }

    const effectiveCategory = updates.category ?? current.category;
    const selectedCategory = await findExpenseCategory(effectiveCategory, req.user._id);
    if (!selectedCategory) return res.status(400).json({ success: false, message: "Select a valid expense category" });

    const period = validatePeriod(updates.month ?? current.month, updates.year ?? current.year);
    if (!period) return res.status(400).json({ success: false, message: "Invalid budget month or year" });
    updates.month = period.month;
    updates.year = period.year;
    updates.category = selectedCategory._id;

    const budget = await Budget.findOneAndUpdate(
      { _id: current._id, user: req.user._id, __v: current.__v },
      { $set: updates, $inc: { __v: 1 } },
      { new: true, runValidators: true }
    ).populate("category");

    if (!budget) return res.status(409).json({ success: false, message: "Budget was updated by another request" });
    return res.json({ success: true, budget });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "Budget already exists for this category and month" });
    if (error?.name === "ValidationError") return res.status(400).json({ success: false, message: "Invalid budget data" });
    return sendError(res, error, req);
  }
};

export const deleteBudget = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false, message: "Budget not found" });
    const current = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!current) return res.status(404).json({ success: false, message: "Budget not found" });

    const expected = parseExpectedVersion(req);
    if (Number.isNaN(expected)) return res.status(400).json({ success: false, message: "Invalid version precondition" });
    if (expected !== null && expected !== current.__v) {
      return res.status(409).json({ success: false, message: "Budget changed since you opened it. Refresh and try again." });
    }

    const deleted = await Budget.findOneAndDelete({ _id: current._id, user: req.user._id, __v: current.__v });
    if (!deleted) return res.status(409).json({ success: false, message: "Budget changed before it could be deleted" });
    return res.json({ success: true, message: "Budget deleted" });
  } catch (error) {
    return sendError(res, error, req);
  }
};
