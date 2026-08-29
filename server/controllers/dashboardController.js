import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import Notification from "../models/Notification.js";
import Category from "../models/Category.js";
import Goal from "../models/Goal.js";
import Recurring from "../models/Recurring.js";
import { sendError } from "../middleware/errorMiddleware.js";

const monthKey = (year, month) => `${year}-${String(month).padStart(2, "0")}`;

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonth = now.getUTCMonth() + 1;
    const currentYear = now.getUTCFullYear();
    const monthStart = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
    const monthEnd = new Date(Date.UTC(currentYear, currentMonth, 1));
    const trendStart = new Date(Date.UTC(currentYear, currentMonth - 6, 1));
    const forecastEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalsRows,
      recentTransactions,
      budgets,
      unreadNotifications,
      trendRows,
      spendRows,
      goalRows,
      goalSummaryRows,
      upcomingRecurring,
    ] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: userId } },
        { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Transaction.find({ user: userId })
        .populate("category")
        .sort({ date: -1, _id: -1 })
        .limit(5)
        .lean(),
      Budget.find({ user: userId, month: currentMonth, year: currentYear })
        .populate("category")
        .lean(),
      Notification.countDocuments({ user: userId, read: false }),
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: trendStart, $lt: monthEnd } } },
        {
          $group: {
            _id: {
              year: { $year: { date: "$date", timezone: "UTC" } },
              month: { $month: { date: "$date", timezone: "UTC" } },
              type: "$type",
            },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: "expense",
            date: { $gte: monthStart, $lt: monthEnd },
          },
        },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
      ]),
      Goal.find({ user: userId, status: { $ne: "archived" } })
        .sort({ status: 1, targetDate: 1, createdAt: -1 })
        .limit(3)
        .lean(),
      Goal.aggregate([
        { $match: { user: userId, status: { $ne: "archived" } } },
        {
          $group: {
            _id: null,
            target: { $sum: "$targetAmount" },
            saved: { $sum: "$currentAmount" },
            active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          },
        },
      ]),
      Recurring.find({
        user: userId,
        status: "active",
        nextDueDate: { $gte: now, $lte: forecastEnd },
      })
        .populate("category")
        .sort({ nextDueDate: 1 })
        .limit(5)
        .lean(),
    ]);

    const totals = Object.fromEntries(totalsRows.map((row) => [row._id, row]));
    const totalIncome = totals.income?.total || 0;
    const totalExpenses = totals.expense?.total || 0;
    const transactionCount = (totals.income?.count || 0) + (totals.expense?.count || 0);
    const balance = Math.round((totalIncome - totalExpenses + Number.EPSILON) * 100) / 100;
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

    const trendMap = new Map();
    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date(Date.UTC(currentYear, currentMonth - 1 - offset, 1));
      const key = monthKey(date.getUTCFullYear(), date.getUTCMonth() + 1);
      trendMap.set(key, { month: key, income: 0, expenses: 0, balance: 0 });
    }
    for (const row of trendRows) {
      const key = monthKey(row._id.year, row._id.month);
      const entry = trendMap.get(key);
      if (!entry) continue;
      if (row._id.type === "income") entry.income = row.total;
      if (row._id.type === "expense") entry.expenses = row.total;
      entry.balance = Math.round((entry.income - entry.expenses + Number.EPSILON) * 100) / 100;
    }
    const trend = [...trendMap.values()];
    const currentFlow = trend.at(-1) || { income: 0, expenses: 0, balance: 0 };

    const categoryIds = spendRows.map((row) => row._id).filter(Boolean);
    const categories = categoryIds.length
      ? await Category.find({ user: userId, _id: { $in: categoryIds } }).lean()
      : [];
    const categoryMap = new Map(categories.map((category) => [String(category._id), category]));
    const expenseBreakdown = spendRows.map((row) => {
      const category = categoryMap.get(String(row._id));
      return {
        categoryId: row._id,
        name: category?.name || "Uncategorized",
        color: category?.color || "#64748B",
        value: row.total,
      };
    });

    const spentByCategory = new Map(spendRows.map((row) => [String(row._id), row.total]));
    const enrichedBudgets = budgets.map((budget) => {
      const spent = budget.category ? spentByCategory.get(String(budget.category._id)) || 0 : 0;
      const remaining = Math.round((budget.amount - spent + Number.EPSILON) * 100) / 100;
      const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;
      return { ...budget, spent, remaining, percentage, overBudget: spent > budget.amount };
    });

    const budgetLimit = enrichedBudgets.reduce((sum, budget) => sum + budget.amount, 0);
    const budgetSpent = enrichedBudgets.reduce((sum, budget) => sum + budget.spent, 0);
    const budgetUtilization = budgetLimit > 0 ? Math.round((budgetSpent / budgetLimit) * 100) : 0;
    const budgetsAtRisk = enrichedBudgets.filter((budget) => budget.percentage >= 80).length;
    const spendRatio = currentFlow.income > 0 ? Math.round((currentFlow.expenses / currentFlow.income) * 100) : 0;
    const health = currentFlow.income === 0 && currentFlow.expenses === 0
      ? "neutral"
      : currentFlow.balance >= 0 && spendRatio <= 80
        ? "healthy"
        : currentFlow.balance >= 0
          ? "watch"
          : "negative";

    const goalSummary = goalSummaryRows[0] || { target: 0, saved: 0, active: 0, completed: 0 };
    const goals = goalRows.map((goal) => ({
      ...goal,
      percentage: goal.targetAmount > 0 ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100) : 0,
      remaining: Math.max(goal.targetAmount - goal.currentAmount, 0),
    }));
    const recurringIncome = upcomingRecurring
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
    const recurringExpenses = upcomingRecurring
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);
    const projectedBalance30d = Math.round((balance + recurringIncome - recurringExpenses + Number.EPSILON) * 100) / 100;

    return res.json({
      success: true,
      summary: {
        balance,
        totalIncome,
        totalExpenses,
        savingsRate,
        transactionCount,
        budgetCount: enrichedBudgets.length,
        unreadNotifications,
        recentTransactions,
        budgets: enrichedBudgets,
        trend,
        expenseBreakdown,
        currentMonth: {
          income: currentFlow.income,
          expenses: currentFlow.expenses,
          balance: currentFlow.balance,
          spendRatio,
        },
        budgetHealth: {
          limit: budgetLimit,
          spent: budgetSpent,
          utilization: budgetUtilization,
          atRisk: budgetsAtRisk,
        },
        goals: { ...goalSummary, items: goals },
        upcomingRecurring,
        forecast30d: {
          recurringIncome,
          recurringExpenses,
          projectedBalance: projectedBalance30d,
        },
        health,
      },
    });
  } catch (error) {
    return sendError(res, error, req);
  }
};
