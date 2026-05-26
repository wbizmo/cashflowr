import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";

export const getAnalyticsSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ user: userId })
      .populate("category")
      .sort({ date: 1 });

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

    const incomeTransactions = transactions.filter(
      (item) => item.type === "income"
    );

    const expenseTransactions = transactions.filter(
      (item) => item.type === "expense"
    );

    const categoryMap = {};

    expenseTransactions.forEach((item) => {
      const categoryName = item.category?.name || "Uncategorized";
      const categoryColor = item.category?.color || "#3B82F6";

      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
          name: categoryName,
          value: 0,
          color: categoryColor,
        };
      }

      categoryMap[categoryName].value += item.amount;
    });

    const categoryBreakdown = Object.values(categoryMap).sort(
      (a, b) => b.value - a.value
    );

    const monthlyMap = {};

    transactions.forEach((item) => {
      const date = new Date(item.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;

      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          month: key,
          income: 0,
          expenses: 0,
          balance: 0,
        };
      }

      if (item.type === "income") {
        monthlyMap[key].income += item.amount;
      }

      if (item.type === "expense") {
        monthlyMap[key].expenses += item.amount;
      }

      monthlyMap[key].balance =
        monthlyMap[key].income - monthlyMap[key].expenses;
    });

    const monthlyTrend = Object.values(monthlyMap).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const budgets = await Budget.find({
      user: userId,
      month: currentMonth,
      year: currentYear,
    }).populate("category");

    const totalBudgetLimit = budgets.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const budgetUtilization =
      totalBudgetLimit > 0
        ? Math.round((totalExpenses / totalBudgetLimit) * 100)
        : 0;

    const highestExpenseCategory = categoryBreakdown[0] || null;

    const averageExpense =
      expenseTransactions.length > 0
        ? Math.round(totalExpenses / expenseTransactions.length)
        : 0;

    res.json({
      success: true,
      analytics: {
        balance,
        totalIncome,
        totalExpenses,
        savingsRate,
        transactionCount: transactions.length,
        incomeCount: incomeTransactions.length,
        expenseCount: expenseTransactions.length,
        averageExpense,
        budgetUtilization,
        highestExpenseCategory,
        categoryBreakdown,
        monthlyTrend,
        incomeVsExpense: [
          {
            name: "Income",
            value: totalIncome,
          },
          {
            name: "Expenses",
            value: totalExpenses,
          },
        ],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};