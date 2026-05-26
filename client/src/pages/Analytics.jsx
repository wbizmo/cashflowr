import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import {
  Activity,
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Wallet,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import useAnalytics from "../hooks/useAnalytics";
import { useAuth } from "../context/AuthContext";
import { formatMoney } from "../utils/formatCurrency";

const Analytics = () => {
  const { analytics, loading } = useAnalytics();
  const { user } = useAuth();

  const currency = user?.currency || "USD";

  const monthLabel = (value = "") => {
    const [year, month] = value.split("-");

    if (!year || !month) return value;

    return new Date(Number(year), Number(month) - 1).toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Analytics
          </h1>

          <p className="text-slate-400 mt-3">
            Visualize income, expenses, trends, and category behavior.
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
              <MetricCard
                title="Current Balance"
                value={formatMoney(analytics?.balance, currency)}
                icon={Wallet}
                tone="blue"
              />

              <MetricCard
                title="Total Income"
                value={formatMoney(analytics?.totalIncome, currency)}
                icon={TrendingUp}
                tone="green"
              />

              <MetricCard
                title="Total Expenses"
                value={formatMoney(analytics?.totalExpenses, currency)}
                icon={Activity}
                tone="red"
              />

              <MetricCard
                title="Savings Rate"
                value={`${analytics?.savingsRate || 0}%`}
                icon={BarChart3}
                tone="purple"
              />
            </div>

            <div className="grid xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
                <h2 className="text-xl font-semibold text-white">
                  Monthly Trend
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  Income, expenses, and balance over time.
                </p>

                <div className="h-80 mt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.monthlyTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />

                      <XAxis
                        dataKey="month"
                        tickFormatter={monthLabel}
                        tick={{ fill: "#94A3B8", fontSize: 12 }}
                      />

                      <YAxis
                        tickFormatter={(value) => formatMoney(value, currency)}
                        tick={{ fill: "#94A3B8", fontSize: 12 }}
                        width={92}
                      />

                      <Tooltip
                        formatter={(value) => formatMoney(value, currency)}
                        labelFormatter={monthLabel}
                      />

                      <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#10B981"
                        fill="#10B98133"
                        strokeWidth={3}
                      />

                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="#EF4444"
                        fill="#EF444433"
                        strokeWidth={3}
                      />

                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#3B82F6"
                        fill="#3B82F633"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
                <h2 className="text-xl font-semibold text-white">
                  Income vs Expense
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  Overall financial split.
                </p>

                <div className="h-80 mt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics?.incomeVsExpense || []}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={5}
                      >
                        {(analytics?.incomeVsExpense || []).map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={
                              entry.name === "Income" ? "#10B981" : "#EF4444"
                            }
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value) => formatMoney(value, currency)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid xl:grid-cols-2 gap-6">
              <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
                <h2 className="text-xl font-semibold text-white">
                  Spending by Category
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  Breakdown of where your money went.
                </p>

                <div className="h-80 mt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.categoryBreakdown || []}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />

                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#94A3B8", fontSize: 12 }}
                      />

                      <YAxis
                        tickFormatter={(value) => formatMoney(value, currency)}
                        tick={{ fill: "#94A3B8", fontSize: 12 }}
                        width={92}
                      />

                      <Tooltip
                        formatter={(value) => formatMoney(value, currency)}
                      />

                      <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                        {(analytics?.categoryBreakdown || []).map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color || "#3B82F6"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
                <h2 className="text-xl font-semibold text-white">
                  Smart Insights
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  Quick highlights from your financial activity.
                </p>

                <div className="mt-8 grid gap-4">
                  <InsightCard
                    icon={PieIcon}
                    title="Top Expense Category"
                    value={
                      analytics?.highestExpenseCategory
                        ? `${analytics.highestExpenseCategory.name} • ${formatMoney(
                            analytics.highestExpenseCategory.value,
                            currency
                          )}`
                        : "No expense category yet"
                    }
                  />

                  <InsightCard
                    icon={Activity}
                    title="Average Expense"
                    value={formatMoney(analytics?.averageExpense, currency)}
                  />

                  <InsightCard
                    icon={BarChart3}
                    title="Budget Utilization"
                    value={`${analytics?.budgetUtilization || 0}%`}
                  />

                  <InsightCard
                    icon={Wallet}
                    title="Total Transactions"
                    value={`${analytics?.transactionCount || 0} records`}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

const MetricCard = ({ title, value, icon: Icon, tone }) => {
  const tones = {
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-emerald-500/10 text-emerald-400",
    red: "bg-red-500/10 text-red-400",
    purple: "bg-purple-500/10 text-purple-400",
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 min-w-0">
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
    </div>
  );
};

const InsightCard = ({ icon: Icon, title, value }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex items-center gap-4 min-w-0">
      <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <p className="text-slate-400 text-sm">{title}</p>
        <h3 className="money-text money-text-lg text-white font-semibold mt-1">
          {value}
        </h3>
      </div>
    </div>
  );
};

export default Analytics;