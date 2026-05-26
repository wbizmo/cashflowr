import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Receipt,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import useDashboardSummary from "../hooks/useDashboardSummary";
import { categoryIcons } from "../utils/categoryOptions";
import { formatMoney } from "../utils/formatCurrency";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { summary, loading } = useDashboardSummary();
  const { user } = useAuth();

  const currency = user?.currency || "USD";

  const chartData = [
    { name: "Income", value: summary?.totalIncome || 0 },
    { name: "Expenses", value: summary?.totalExpenses || 0 },
    { name: "Balance", value: summary?.balance || 0 },
  ];

  const pieData =
    summary?.recentTransactions
      ?.filter((item) => item.type === "expense" && item.category?.name)
      .map((item) => ({
        name: item.category.name,
        value: item.amount,
        color: item.category.color || "#3B82F6",
      })) || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Welcome back 👋
          </h1>

          <p className="text-slate-400 mt-3">
            Here is your real-time financial overview.
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 rounded-[28px] border border-white/10 bg-white/[0.03] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <StatCard
                title="Current Balance"
                value={formatMoney(summary?.balance, currency)}
                icon={Wallet}
                tone="blue"
              />

              <StatCard
                title="Total Income"
                value={formatMoney(summary?.totalIncome, currency)}
                icon={TrendingUp}
                tone="green"
              />

              <StatCard
                title="Total Expenses"
                value={formatMoney(summary?.totalExpenses, currency)}
                icon={TrendingDown}
                tone="red"
              />

              <StatCard
                title="Savings Rate"
                value={`${summary?.savingsRate || 0}%`}
                icon={PiggyBank}
                tone="purple"
              />
            </div>

            <div className="grid xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
                <h2 className="text-xl font-semibold text-white">
                  Financial Flow
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  Income, expenses, and balance overview.
                </p>

                <div className="h-80 mt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <Tooltip
                        formatter={(value) => formatMoney(value, currency)}
                      />

                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        fill="#3B82F633"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
                <h2 className="text-xl font-semibold text-white">
                  Expense Split
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  Spending by category.
                </p>

                <div className="h-80 mt-8">
                  {pieData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      No expense data yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={4}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(value) => formatMoney(value, currency)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            <div className="grid xl:grid-cols-2 gap-6">
              <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
                <h2 className="text-xl font-semibold text-white">
                  Recent Transactions
                </h2>

                <div className="mt-6 space-y-4">
                  {summary?.recentTransactions?.length === 0 ? (
                    <p className="text-slate-400">No transactions yet.</p>
                  ) : (
                    summary?.recentTransactions?.map((transaction) => {
                      const Icon =
                        categoryIcons[transaction.category?.icon] || Receipt;

                      return (
                        <div
                          key={transaction._id}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: `${
                                  transaction.category?.color || "#3B82F6"
                                }20`,
                              }}
                            >
                              <Icon
                                size={20}
                                style={{
                                  color:
                                    transaction.category?.color || "#3B82F6",
                                }}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="text-white font-medium truncate">
                                {transaction.title}
                              </p>

                              <p className="text-slate-400 text-sm truncate">
                                {transaction.category?.name || "Uncategorized"}
                              </p>
                            </div>
                          </div>

                          <p
                            className={`money-text money-text-lg font-bold text-right max-w-[45%] ${
                              transaction.type === "income"
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatMoney(transaction.amount, currency)}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
                <h2 className="text-xl font-semibold text-white">
                  Budget Snapshot
                </h2>

                <div className="mt-6 space-y-5">
                  {summary?.budgets?.length === 0 ? (
                    <p className="text-slate-400">No budgets created yet.</p>
                  ) : (
                    summary?.budgets?.map((budget) => (
                      <div key={budget._id}>
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-white font-medium">
                            {budget.category?.name}
                          </p>

                          <p className="money-text money-text-sm text-slate-400 text-right max-w-[55%]">
                            {formatMoney(budget.spent || 0, currency)} /{" "}
                            {formatMoney(budget.amount || 0, currency)}
                          </p>
                        </div>

                        <div className="mt-3 h-3 rounded-full bg-white/[0.05] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{
                              width: `${budget.percentage || 0}%`,
                            }}
                          />
                        </div>

                        <p className="money-text money-text-sm text-slate-500 mt-2">
                          {formatMoney(budget.remaining || 0, currency)} left
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ title, value, icon: Icon, tone }) => {
  const tones = {
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-emerald-500/10 text-emerald-400",
    red: "bg-red-500/10 text-red-400",
    purple: "bg-purple-500/10 text-purple-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 min-w-0"
    >
      <div
        className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
          tones[tone] || tones.blue
        }`}
      >
        <Icon size={22} />
      </div>

      <p className="text-slate-400 text-sm mt-5">{title}</p>

      <h3 className="money-text money-text-xl font-bold text-white mt-2">
        {value}
      </h3>
    </motion.div>
  );
};

export default Dashboard;