import Budget from "../models/Budget.js";
import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";

export const createBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    const selectedCategory = await Category.findOne({
      _id: category,
      user: req.user._id,
      type: "expense",
    });

    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Expense category not found",
      });
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      amount,
      month,
      year,
    });

    const populatedBudget = await Budget.findById(budget._id).populate(
      "category"
    );

    res.status(201).json({
      success: true,
      budget: populatedBudget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.code === 11000
          ? "Budget already exists for this category and month"
          : error.message,
    });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const year = Number(req.query.year) || new Date().getFullYear();

    const budgets = await Budget.find({
      user: req.user._id,
      month,
      year,
    }).populate("category");

    const enrichedBudgets = await Promise.all(
      budgets.map(async (budget) => {
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 1);

        const spentResult = await Transaction.aggregate([
          {
            $match: {
              user: req.user._id,
              category: budget.category._id,
              type: "expense",
              date: {
                $gte: monthStart,
                $lt: monthEnd,
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]);

        const spent = spentResult[0]?.total || 0;
        const remaining = budget.amount - spent;
        const percentage =
          budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;

        return {
          ...budget.toObject(),
          spent,
          remaining,
          percentage,
        };
      })
    );

    res.json({
      success: true,
      budgets: enrichedBudgets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      req.body,
      { new: true }
    ).populate("category");

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.json({
      success: true,
      budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.json({
      success: true,
      message: "Budget deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};