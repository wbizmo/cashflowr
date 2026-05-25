import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import Notification from "../models/Notification.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ user: userId })
      .populate("category")
      .sort({ date: -1 });

    const totalIncome = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    const totalExpenses = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    const balance = totalIncome - totalExpenses;

    const savingsRate =
      totalIncome > 0
        ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
        : 0;

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const budgets = await Budget.find({
      user: userId,
      month: currentMonth,
      year: currentYear,
    }).populate("category");

    const enrichedBudgets = await Promise.all(
      budgets.map(async (budget) => {
        const monthStart = new Date(currentYear, currentMonth - 1, 1);
        const monthEnd = new Date(currentYear, currentMonth, 1);

        const spentResult = await Transaction.aggregate([
          {
            $match: {
              user: userId,
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
          budget.amount > 0
            ? Math.min(Math.round((spent / budget.amount) * 100), 100)
            : 0;

        return {
          ...budget.toObject(),
          spent,
          remaining,
          percentage,
        };
      })
    );

    const unreadNotifications = await Notification.countDocuments({
      user: userId,
      read: false,
    });

    res.json({
      success: true,
      summary: {
        balance,
        totalIncome,
        totalExpenses,
        savingsRate,
        transactionCount: transactions.length,
        budgetCount: enrichedBudgets.length,
        unreadNotifications,
        recentTransactions: transactions.slice(0, 5),
        budgets: enrichedBudgets,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};