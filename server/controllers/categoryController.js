import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import { sendError } from "../middleware/errorMiddleware.js";
import { isValidId, parseExpectedVersion, pick } from "../utils/request.js";

const mutableFields = ["name", "type", "color", "icon"];

export const createCategory = async (req, res) => {
  try {
    const payload = pick(req.body, mutableFields);
    const category = await Category.create({ user: req.user._id, ...payload });
    return res.status(201).json({ success: true, category });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "Category already exists" });
    }
    if (error?.name === "ValidationError") {
      return res.status(400).json({ success: false, message: "Invalid category data" });
    }
    return sendError(res, error, req);
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id })
      .sort({ type: 1, name: 1 })
      .lean();
    return res.json({ success: true, categories });
  } catch (error) {
    return sendError(res, error, req);
  }
};

export const updateCategory = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false, message: "Category not found" });
    const current = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!current) return res.status(404).json({ success: false, message: "Category not found" });

    const updates = pick(req.body, mutableFields);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No supported fields to update" });
    }

    const expected = parseExpectedVersion(req);
    if (Number.isNaN(expected)) return res.status(400).json({ success: false, message: "Invalid version precondition" });
    if (expected !== null && expected !== current.__v) {
      return res.status(409).json({ success: false, message: "Category changed since you opened it. Refresh and try again." });
    }

    if (updates.type && updates.type !== current.type) {
      const [hasTransactions, hasBudgets] = await Promise.all([
        Transaction.exists({ user: req.user._id, category: current._id }),
        Budget.exists({ user: req.user._id, category: current._id }),
      ]);
      if (hasTransactions || hasBudgets) {
        return res.status(409).json({
          success: false,
          message: "Category type cannot change while transactions or budgets use this category",
        });
      }
    }

    const category = await Category.findOneAndUpdate(
      { _id: current._id, user: req.user._id, __v: current.__v },
      { $set: updates, $inc: { __v: 1 } },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(409).json({ success: false, message: "Category was updated by another request" });

    return res.json({ success: true, category });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "Category already exists" });
    if (error?.name === "ValidationError") return res.status(400).json({ success: false, message: "Invalid category data" });
    return sendError(res, error, req);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false, message: "Category not found" });
    const current = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!current) return res.status(404).json({ success: false, message: "Category not found" });

    const [hasTransactions, hasBudgets] = await Promise.all([
      Transaction.exists({ user: req.user._id, category: current._id }),
      Budget.exists({ user: req.user._id, category: current._id }),
    ]);
    if (hasTransactions || hasBudgets) {
      return res.status(409).json({
        success: false,
        message: "This category is in use. Reassign or remove its transactions and budgets first.",
      });
    }

    const expected = parseExpectedVersion(req);
    if (Number.isNaN(expected)) return res.status(400).json({ success: false, message: "Invalid version precondition" });
    if (expected !== null && expected !== current.__v) {
      return res.status(409).json({ success: false, message: "Category changed since you opened it. Refresh and try again." });
    }

    const deleted = await Category.findOneAndDelete({ _id: current._id, user: req.user._id, __v: current.__v });
    if (!deleted) return res.status(409).json({ success: false, message: "Category changed before it could be deleted" });
    return res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    return sendError(res, error, req);
  }
};
