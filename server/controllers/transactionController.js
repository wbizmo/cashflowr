import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";
import Notification from "../models/Notification.js";
import { sendError } from "../middleware/errorMiddleware.js";
import {
  isValidId,
  paginationMeta,
  parseExpectedVersion,
  parsePagination,
  pick,
} from "../utils/request.js";

const mutableFields = ["title", "amount", "type", "category", "description", "date"];
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validateCategory = async ({ categoryId, userId, type }) => {
  if (!isValidId(categoryId)) return null;
  return Category.findOne({ _id: categoryId, user: userId, type });
};

const notifyTransactionCreated = async ({ user, transaction, category }) => {
  try {
    await Notification.create({
      user: user._id,
      type: "transaction_created",
      title: "Transaction added",
      message: `You added a new ${transaction.type}: ${transaction.title}.`,
      metadata: {
        transactionId: transaction._id,
        amount: transaction.amount,
        currency: user.currency || "USD",
        transactionType: transaction.type,
        categoryId: category._id,
        categoryName: category.name,
      },
    });
  } catch (error) {
    console.error("Failed to create transaction notification", error);
  }
};

export const createTransaction = async (req, res) => {
  const idempotencyKey = req.get("Idempotency-Key")?.trim();
  if (idempotencyKey && idempotencyKey.length > 128) {
    return res.status(400).json({ success: false, message: "Invalid idempotency key" });
  }

  try {
    if (idempotencyKey) {
      const replay = await Transaction.findOne({ user: req.user._id, idempotencyKey }).populate("category");
      if (replay) {
        res.setHeader("Idempotent-Replayed", "true");
        return res.json({ success: true, transaction: replay });
      }
    }

    const payload = pick(req.body, mutableFields);
    const selectedCategory = await validateCategory({
      categoryId: payload.category,
      userId: req.user._id,
      type: payload.type,
    });

    if (!selectedCategory) {
      return res.status(400).json({
        success: false,
        message: "Select a valid category for this transaction type",
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      ...payload,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    });

    await notifyTransactionCreated({ user: req.user, transaction, category: selectedCategory });
    const populated = await Transaction.findById(transaction._id).populate("category");
    return res.status(201).json({ success: true, transaction: populated });
  } catch (error) {
    if (error?.code === 11000 && idempotencyKey) {
      const replay = await Transaction.findOne({ user: req.user._id, idempotencyKey }).populate("category");
      if (replay) {
        res.setHeader("Idempotent-Replayed", "true");
        return res.json({ success: true, transaction: replay });
      }
    }
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid transaction data" });
    }
    return sendError(res, error, req);
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { user: req.user._id };

    if (["income", "expense"].includes(req.query.type)) filter.type = req.query.type;
    if (req.query.category) {
      if (!isValidId(req.query.category)) {
        return res.status(400).json({ success: false, message: "Invalid category filter" });
      }
      filter.category = req.query.category;
    }
    if (req.query.search?.trim()) {
      filter.title = { $regex: escapeRegex(req.query.search.trim().slice(0, 80)), $options: "i" };
    }

    const from = req.query.from || req.query.dateFrom;
    const to = req.query.to || req.query.dateTo;
    if (from || to) {
      filter.date = {};
      if (from) {
        const parsed = new Date(from);
        if (Number.isNaN(parsed.getTime())) return res.status(400).json({ success: false, message: "Invalid start date" });
        filter.date.$gte = parsed;
      }
      if (to) {
        const parsed = new Date(to);
        if (Number.isNaN(parsed.getTime())) return res.status(400).json({ success: false, message: "Invalid end date" });
        parsed.setUTCHours(23, 59, 59, 999);
        filter.date.$lte = parsed;
      }
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("category")
        .sort({ date: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      transactions,
      pagination: paginationMeta({ page, limit, total }),
    });
  } catch (error) {
    return sendError(res, error, req);
  }
};

export const updateTransaction = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false, message: "Transaction not found" });

    const current = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!current) return res.status(404).json({ success: false, message: "Transaction not found" });

    const updates = pick(req.body, mutableFields);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No supported fields to update" });
    }

    const expected = parseExpectedVersion(req);
    if (Number.isNaN(expected)) return res.status(400).json({ success: false, message: "Invalid version precondition" });
    if (expected !== null && expected !== current.__v) {
      return res.status(409).json({ success: false, message: "Transaction changed since you opened it. Refresh and try again." });
    }

    const effectiveType = updates.type ?? current.type;
    const effectiveCategory = updates.category ?? current.category;
    const selectedCategory = await validateCategory({
      categoryId: effectiveCategory,
      userId: req.user._id,
      type: effectiveType,
    });
    if (!selectedCategory) {
      return res.status(400).json({ success: false, message: "Select a valid category for this transaction type" });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: current._id, user: req.user._id, __v: current.__v },
      { $set: updates, $inc: { __v: 1 } },
      { new: true, runValidators: true }
    ).populate("category");

    if (!transaction) {
      return res.status(409).json({ success: false, message: "Transaction was updated by another request. Refresh and try again." });
    }

    return res.json({ success: true, transaction });
  } catch (error) {
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid transaction data" });
    }
    return sendError(res, error, req);
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false, message: "Transaction not found" });
    const current = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!current) return res.status(404).json({ success: false, message: "Transaction not found" });

    const expected = parseExpectedVersion(req);
    if (Number.isNaN(expected)) return res.status(400).json({ success: false, message: "Invalid version precondition" });
    if (expected !== null && expected !== current.__v) {
      return res.status(409).json({ success: false, message: "Transaction changed since you opened it. Refresh and try again." });
    }

    const deleted = await Transaction.findOneAndDelete({ _id: current._id, user: req.user._id, __v: current.__v });
    if (!deleted) return res.status(409).json({ success: false, message: "Transaction changed before it could be deleted" });

    return res.json({ success: true, message: "Transaction deleted" });
  } catch (error) {
    return sendError(res, error, req);
  }
};
