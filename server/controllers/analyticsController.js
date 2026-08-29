import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import Category from "../models/Category.js";
import { sendError } from "../middleware/errorMiddleware.js";
import { parseDateRange } from "../utils/request.js";

const monthKey = (year, month) => `${year}-${String(month).padStart(2, "0")}`;

export const getAnalyticsSummary = async (req, res) => {
  try {
    const range = parseDateRange(req.query, 60);
    if (!range) {
      return res.status(400).json({ success: false, message: "Invalid analytics range. Use a range of 60 months or less." });
    }

    const userId = req.user._id;
    const now = new Date();
    const currentMonth = now.getUTCMonth() + 1;
    const currentYear = now.getUTCFullYear();
    const monthStart = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
    const monthEnd = new Date(Date.UTC(currentYear, currentMonth, 1));

    const [facets, budgets, currentSpendRows] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: range.from, $lt: range.to } } },
        {
          $facet: {
            totals: [
              { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } },
            ],
            categoryBreakdown: [
              { $match: { type: "expense" } },
              { $group: { _id: "$category", value: { $sum: "$amount" } } },
              { $sort: { value: -1 } },
            ],
            monthly: [
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
            ],
          },
        },
      ]),
      Budget.find({ user: userId, month: currentMonth, year: currentYear }).lean(),
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: "expense",
            date: { $gte: monthStart, $lt: monthEnd },
          },
        },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
      ]),
    ]);

    const data = facets[0] || { totals: [], categoryBreakdown: [], monthly: [] };
    const totals = Object.fromEntries(data.totals.map((row) => [row._id, row]));
    const totalIncome = totals.income?.total || 0;
    const totalExpenses = totals.expense?.total || 0;
    const incomeCount = totals.income?.count || 0;
    const expenseCount = totals.expense?.count || 0;
    const balance = Math.round((totalIncome - totalExpenses + Number.EPSILON) * 100) / 100;
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

    const categoryIds = data.categoryBreakdown.map((row) => row._id).filter(Boolean);
    const categories = categoryIds.length
      ? await Category.find({ user: userId, _id: { $in: categoryIds } }).lean()
      : [];
    const categoriesById = new Map(categories.map((category) => [String(category._id), category]));
    const categoryBreakdown = data.categoryBreakdown.map((row) => {
      const category = categoriesById.get(String(row._id));
      return {
        categoryId: row._id,
        name: category?.name || "Uncategorized",
        value: row.value,
        color: category?.color || "#64748B",
      };
    });

    const monthlyMap = new Map();
    for (const row of data.monthly) {
      const key = monthKey(row._id.year, row._id.month);
      const entry = monthlyMap.get(key) || { month: key, income: 0, expenses: 0, balance: 0 };
      if (row._id.type === "income") entry.income = row.total;
      if (row._id.type === "expense") entry.expenses = row.total;
      entry.balance = Math.round((entry.income - entry.expenses + Number.EPSILON) * 100) / 100;
      monthlyMap.set(key, entry);
    }
    const monthlyTrend = [...monthlyMap.values()].sort((a, b) => a.month.localeCompare(b.month));

    const totalBudgetLimit = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const budgetCategoryIds = new Set(budgets.map((budget) => String(budget.category)));
    const currentBudgetSpend = currentSpendRows
      .filter((row) => budgetCategoryIds.has(String(row._id)))
      .reduce((sum, row) => sum + row.total, 0);
    const budgetUtilization = totalBudgetLimit > 0 ? Math.round((currentBudgetSpend / totalBudgetLimit) * 100) : 0;
    const averageExpense = expenseCount > 0
      ? Math.round((totalExpenses / expenseCount + Number.EPSILON) * 100) / 100
      : 0;

    return res.json({
      success: true,
      analytics: {
        range: { from: range.from, to: range.to },
        balance,
        totalIncome,
        totalExpenses,
        savingsRate,
        transactionCount: incomeCount + expenseCount,
        incomeCount,
        expenseCount,
        averageExpense,
        budgetUtilization,
        highestExpenseCategory: categoryBreakdown[0] || null,
        categoryBreakdown,
        monthlyTrend,
        incomeVsExpense: [
          { name: "Income", value: totalIncome },
          { name: "Expenses", value: totalExpenses },
        ],
      },
    });
  } catch (error) {
    return sendError(res, error, req);
  }
};
