import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";
import Notification from "../models/Notification.js";

export const createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, description, date } = req.body;

    const selectedCategory = await Category.findOne({
      _id: category,
      user: req.user._id,
    });

    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (selectedCategory.type !== type) {
      return res.status(400).json({
        success: false,
        message: "Category type does not match transaction type",
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount,
      type,
      category,
      description,
      date,
    });

    await Notification.create({
      user: req.user._id,
      type: "transaction_created",
      title: "Transaction added",
      message: `You added a new ${type}: ${title} - $${amount}.`,
      metadata: {
        transactionId: transaction._id,
      },
    });

    const populatedTransaction = await Transaction.findById(
      transaction._id
    ).populate("category");

    res.status(201).json({
      success: true,
      transaction: populatedTransaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
    })
      .populate("category")
      .sort({ date: -1 });

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    if (req.body.category) {
      const selectedCategory = await Category.findOne({
        _id: req.body.category,
        user: req.user._id,
      });

      if (!selectedCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      if (req.body.type && selectedCategory.type !== req.body.type) {
        return res.status(400).json({
          success: false,
          message: "Category type does not match transaction type",
        });
      }
    }

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      req.body,
      { new: true }
    ).populate("category");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      message: "Transaction deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};