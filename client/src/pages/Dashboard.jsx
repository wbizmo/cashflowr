import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  Gauge,
  Plus,
  RefreshCw,
  Target,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import useDashboardSummary from "../hooks/useDashboardSummary";
import { useAuth } from "../context/AuthContext";
import { formatMoney } from "../utils/formatCurrency";

const Dashboard = () => {
  const { summary, loading, error, refresh } = useDashboardSummary();
  const { user } = useAuth();
  const currency = user?.currency || "USD";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-5" aria-busy="true">
          <div className="h-20 rounded-2xl bg-white/[0.035] animate-pulse" />
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-32 finance-panel animate-pulse" />)}
          </div>
          <div className="grid xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 h-[390px] finance-panel animate-pulse" />
            <div className="h-[390px] finance-panel animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="finance-panel p-8 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.16em] text-red-400 font-semibold">Overview unavailable</p>
          <h1 className="text-2xl font-semibold text-white mt-2">We couldn’t load your dashboard.</h1>
          <p className="text-sm text-slate-400 mt-2">{error}</p>
          <button type="button" onClick={refresh} className="mt-5 action-secondary">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const trend = summary?.trend || [];
  const expenseBreakdown = summary?.expenseBreakdown || [];
  const goals = summary?.goals?.items || [];
  const recurring = summary?.upcomingRecurring || [];
  const healthCopy = {
    healthy: { label: "Healthy", className: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" },
    watch: { label: "Watch spend", className: "text-amber-300 bg-amber-500/10 border-amber-500/20" },
    negative: { label: "Negative cash flow", className: "text-red-300 bg-red-500/10 border-red-500/20" },
    neutral: { label: "Building history", className: "text-slate-300 bg-white/[0.04] border-white/10" },
  }[summary?.health || "neutral"];

  return (
    <DashboardLayout>
      <div className="space-y-5 md:space-y-6">
        <section className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="eyebrow">Financial overview</p>
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${healthCopy.className}`}>
                {healthCopy.label}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-2">
              Good to see you, {user?.firstName || "there"}.
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-2 max-w-2xl">
              Your money picture, upcoming commitments, and plan progress in one place.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/analytics" className="action-secondary">View analytics <ArrowRight size={16} /></Link>
            <Link to="/transactions?new=1" className="action-primary"><Plus size={16} /> Add transaction</Link>
          </div>
        </section>

        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            label="Current balance"
            value={formatMoney(summary?.balance || 0, currency)}
            detail={`${summary?.transactionCount || 0} recorded transactions`}
            icon={Wallet}
            tone="blue"
          />
          <MetricCard
            label="This month"
            value={formatMoney(summary?.currentMonth?.balance || 0, currency)}
            detail={`${summary?.currentMonth?.spendRatio || 0}% income spent`}
            icon={(summary?.currentMonth?.balance || 0) >= 0 ? ArrowUpRight : ArrowDownRight}
            tone={(summary?.currentMonth?.balance || 0) >= 0 ? "green" : "red"}
          />
          <MetricCard
            label="Budget utilization"
            value={`${summary?.budgetHealth?.utilization || 0}%`}
            detail={`${summary?.budgetHealth?.atRisk || 0} budget${summary?.budgetHealth?.atRisk === 1 ? "" : "s"} at risk`}
            icon={Gauge}
            tone={(summary?.budgetHealth?.utilization || 0) > 100 ? "red" : "purple"}
          />
          <MetricCard
            label="30-day projection"
            value={formatMoney(summary?.forecast30d?.projectedBalance || summary?.balance || 0, currency)}
            detail={`${recurring.length} upcoming recurring item${recurring.length === 1 ? "" : "s"}`}
            icon={CalendarClock}
            tone="cyan"
          />
        </section>

        <section className="grid xl:grid-cols-3 gap-4">
          <div className="finance-panel xl:col-span-2 p-5 md:p-6 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Six-month movement</p>
                <h2 className="section-title mt-1">Cash-flow trend</h2>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
                <LegendDot className="bg-emerald-400" label="Income" />
                <LegendDot className="bg-blue-400" label="Expenses" />
              </div>
            </div>

            <div className="h-[310px] mt-5">
              {trend.every((item) => item.income === 0 && item.expenses === 0) ? (
                <EmptyChart title="No trend yet" description="Add transactions and your monthly cash-flow history will appear here." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 10, right: 4, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34D399" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.22} />
                        <stop offset="100%" stopColor="#60A5FA" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.09)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value) => value.slice(5)} />
                    <YAxis tick={{ fill: "#64748B", fontSize: 11 }} tickLine={false} axisLine={false} width={58} tickFormatter={(value) => compactMoney(value, currency)} />
                    <Tooltip content={<CashflowTooltip currency={currency} />} />
                    <Area type="monotone" dataKey="income" stroke="#34D399" strokeWidth={2} fill="url(#incomeFill)" />
                    <Area type="monotone" dataKey="expenses" stroke="#60A5FA" strokeWidth={2} fill="url(#expenseFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="finance-panel p-5 md:p-6 min-w-0">
            <div>
              <p className="eyebrow">Current month</p>
              <h2 className="section-title mt-1">Spending mix</h2>
            </div>
            <div className="h-[200px] mt-3">
              {expenseBreakdown.length === 0 ? (
                <EmptyChart title="No expenses yet" description="Your category mix will appear after you record spending." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseBreakdown} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={3} stroke="none">
                      {expenseBreakdown.map((entry) => <Cell key={String(entry.categoryId)} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value) => formatMoney(value, currency)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="space-y-2 mt-2">
              {expenseBreakdown.slice(0, 4).map((entry) => (
                <div key={String(entry.categoryId)} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-400 truncate">{entry.name}</span>
                  </div>
                  <span className="text-slate-200 font-medium money-text">{formatMoney(entry.value, currency)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid xl:grid-cols-3 gap-4">
          <div className="finance-panel p-5 md:p-6">
            <PanelHeader eyebrow="Plan" title="Savings goals" link="/goals" />
            <div className="space-y-4 mt-5">
              {goals.length === 0 ? (
                <EmptyList title="No goals yet" action="Create a goal" to="/goals" />
              ) : goals.map((goal) => (
                <div key={goal._id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-200 truncate">{goal.name}</p>
                    <span className="text-xs text-slate-500">{goal.percentage}%</span>
                  </div>
                  <div className="progress-track mt-2"><div className="progress-value" style={{ width: `${Math.min(goal.percentage, 100)}%`, backgroundColor: goal.color }} /></div>
                  <p className="text-[11px] text-slate-500 mt-1.5">{formatMoney(goal.currentAmount, currency)} of {formatMoney(goal.targetAmount, currency)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="finance-panel p-5 md:p-6">
            <PanelHeader eyebrow="Upcoming" title="Recurring cash flow" link="/recurring" />
            <div className="space-y-2 mt-4">
              {recurring.length === 0 ? (
                <EmptyList title="Nothing scheduled in the next 30 days" action="Add recurring item" to="/recurring" />
              ) : recurring.map((item) => (
                <div key={item._id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.025] border border-white/[0.06] px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{new Date(item.nextDueDate).toLocaleDateString()} · {item.frequency}</p>
                  </div>
                  <p className={`text-sm font-semibold money-text ${item.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                    {item.type === "income" ? "+" : "-"}{formatMoney(item.amount, currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="finance-panel p-5 md:p-6">
            <PanelHeader eyebrow="Latest" title="Recent transactions" link="/transactions" />
            <div className="space-y-2 mt-4">
              {(summary?.recentTransactions || []).length === 0 ? (
                <EmptyList title="No transactions yet" action="Add transaction" to="/transactions?new=1" />
              ) : summary.recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between gap-3 py-2.5 border-b border-white/[0.05] last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200 truncate">{transaction.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{transaction.category?.name || "Uncategorized"}</p>
                  </div>
                  <p className={`text-sm font-semibold money-text ${transaction.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                    {transaction.type === "income" ? "+" : "-"}{formatMoney(transaction.amount, currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

const MetricCard = ({ label, value, detail, icon: Icon, tone }) => {
  const tones = {
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/15",
    green: "bg-emerald-500/10 text-emerald-300 border-emerald-500/15",
    red: "bg-red-500/10 text-red-300 border-red-500/15",
    purple: "bg-violet-500/10 text-violet-300 border-violet-500/15",
    cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/15",
  };
  return (
    <div className="finance-panel p-5 min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="finance-label">{label}</p>
          <p className="money-text text-2xl font-bold text-white tracking-tight mt-2">{value}</p>
          <p className="text-[11px] text-slate-500 mt-2 truncate">{detail}</p>
        </div>
        <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${tones[tone] || tones.blue}`}><Icon size={17} /></div>
      </div>
    </div>
  );
};

const PanelHeader = ({ eyebrow, title, link }) => (
  <div className="flex items-start justify-between gap-3">
    <div><p className="eyebrow">{eyebrow}</p><h2 className="section-title mt-1">{title}</h2></div>
    <Link to={link} className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">View <ArrowRight size={13} /></Link>
  </div>
);

const LegendDot = ({ className, label }) => <span className="inline-flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${className}`} />{label}</span>;

const EmptyChart = ({ title, description }) => (
  <div className="h-full flex flex-col items-center justify-center text-center px-6">
    <p className="text-sm font-medium text-slate-300">{title}</p><p className="text-xs text-slate-500 mt-1.5 max-w-xs">{description}</p>
  </div>
);

const EmptyList = ({ title, action, to }) => (
  <div className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center">
    <Target size={18} className="text-slate-600 mx-auto" />
    <p className="text-xs text-slate-500 mt-2">{title}</p>
    <Link to={to} className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block">{action}</Link>
  </div>
);

const CashflowTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 shadow-xl">
      <p className="text-[11px] text-slate-500 mb-1">{label}</p>
      {payload.map((item) => <p key={item.dataKey} className="text-xs text-slate-200">{item.name}: {formatMoney(item.value, currency)}</p>)}
    </div>
  );
};

const compactMoney = (value, currency) => {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }).format(value || 0);
  } catch {
    return String(value || 0);
  }
};

export default Dashboard;
