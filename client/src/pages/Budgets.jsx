import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, Wallet, CheckCircle2 } from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import ConfirmModal from "../components/common/ConfirmModal";
import useBudgets from "../hooks/useBudgets";
import { categoryIcons } from "../utils/categoryOptions";
import { formatMoney } from "../utils/formatCurrency";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  category: "",
  amount: "",
};

const monthOptions = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const Budgets = () => {
  const {
    budgets,
    categories,
    month,
    year,
    loading,
    setMonth,
    setYear,
    createBudget,
    updateBudget,
    deleteBudget,
  } = useBudgets();

  const { user } = useAuth();
  const currency = user?.currency || "USD";

  const [form, setForm] = useState(initialForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  const totals = useMemo(() => {
    const limit = budgets.reduce((sum, item) => sum + item.amount, 0);
    const spent = budgets.reduce((sum, item) => sum + (item.spent || 0), 0);
    const remaining = limit - spent;

    return {
      limit,
      spent,
      remaining,
      percentage:
        limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0,
    };
  }, [budgets]);

  const availableCategories = categories.filter((category) => {
    if (editingId) return true;
    return !budgets.some((budget) => budget.category?._id === category._id);
  });

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (budget) => {
    setEditingId(budget._id);
    setForm({
      category: budget.category?._id || "",
      amount: budget.amount,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const saveBudget = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        category: form.category,
        amount: Number(form.amount),
        month,
        year,
      };

      if (editingId) {
        await updateBudget(editingId, payload);
      } else {
        await createBudget(payload);
      }

      closeModal();
    } catch (error) {
      setErrorModal(error.response?.data?.message || "Failed to save budget.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteBudget = async () => {
    if (!deleteTarget) return;

    try {
      await deleteBudget(deleteTarget._id);
      setDeleteTarget(null);
    } catch (error) {
      setDeleteTarget(null);
      setErrorModal(error.response?.data?.message || "Failed to delete budget.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Budgets
            </h1>

            <p className="text-slate-400 mt-3">
              Set monthly spending limits and track progress by category.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="h-12 px-5 rounded-2xl bg-white text-black font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={18} />
            New Budget
          </button>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div>
            <h2 className="text-white text-xl font-semibold">Budget Period</h2>
            <p className="text-slate-400 text-sm mt-1">
              View and manage budgets for a specific month.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="form-input select-dark sm:w-44"
            >
              {monthOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="form-input sm:w-32"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <SummaryCard
            title="Budget Limit"
            value={formatMoney(totals.limit, currency)}
          />
          <SummaryCard
            title="Spent"
            value={formatMoney(totals.spent, currency)}
          />
          <SummaryCard
            title="Remaining"
            value={formatMoney(totals.remaining, currency)}
          />
          <SummaryCard title="Usage" value={`${totals.percentage}%`} />
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-48 rounded-[32px] border border-white/10 bg-white/[0.03] animate-pulse"
              />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="h-20 w-20 mx-auto rounded-[28px] bg-blue-500/10 flex items-center justify-center">
              <Wallet className="text-blue-400" size={32} />
            </div>

            <h3 className="text-white text-2xl font-semibold mt-6">
              No budgets yet
            </h3>

            <p className="text-slate-400 mt-3">
              Create a budget for an expense category to start tracking limits.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {budgets.map((budget) => {
              const Icon = categoryIcons[budget.category?.icon] || Wallet;

              return (
                <div
                  key={budget._id}
                  className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 min-w-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${
                            budget.category?.color || "#3B82F6"
                          }20`,
                        }}
                      >
                        <Icon
                          size={22}
                          style={{
                            color: budget.category?.color || "#3B82F6",
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-white font-semibold text-lg truncate">
                          {budget.category?.name}
                        </h3>

                        <p className="money-text money-text-sm text-slate-400 mt-1">
                          {formatMoney(budget.spent || 0, currency)} spent of{" "}
                          {formatMoney(budget.amount, currency)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEditModal(budget)}
                        className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center hover:bg-white/[0.06] cursor-pointer"
                      >
                        <Pencil size={16} className="text-slate-300" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(budget)}
                        className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-start justify-between gap-3 text-sm">
                      <span className="text-slate-400">
                        {budget.percentage || 0}% used
                      </span>
                      <span className="money-text money-text-sm text-slate-400 text-right max-w-[60%]">
                        {formatMoney(budget.remaining || 0, currency)} left
                      </span>
                    </div>

                    <div className="mt-3 h-3 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (budget.percentage || 0) >= 90
                            ? "bg-red-500"
                            : (budget.percentage || 0) >= 70
                              ? "bg-amber-500"
                              : "bg-blue-500"
                        }`}
                        style={{ width: `${budget.percentage || 0}%` }}
                      />
                    </div>
                  </div>

                  {(budget.percentage || 0) < 100 ? (
                    <div className="mt-5 flex items-center gap-2 text-emerald-400 text-sm">
                      <CheckCircle2 size={16} />
                      Within budget
                    </div>
                  ) : (
                    <div className="mt-5 flex items-center gap-2 text-red-400 text-sm">
                      <Wallet size={16} />
                      Budget exceeded
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 py-6">
          <div
            onClick={closeModal}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          <form
            onSubmit={saveBudget}
            className="relative w-full max-w-xl max-h-[90vh] rounded-[32px] border border-white/10 bg-[#0B1120] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="shrink-0 p-6 md:p-8 border-b border-white/10">
              <button
                type="button"
                onClick={closeModal}
                className="absolute right-5 top-5 h-10 w-10 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center cursor-pointer hover:bg-white/[0.06]"
              >
                <X size={18} className="text-white" />
              </button>

              <h2 className="text-3xl font-bold text-white pr-12">
                {editingId ? "Edit Budget" : "New Budget"}
              </h2>

              <p className="text-slate-400 mt-2">
                Choose an expense category and set the monthly limit.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5">
              <div>
                <label className="text-sm text-slate-300">
                  Expense category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="mt-2 form-input select-dark"
                >
                  <option value="">Select category</option>

                  {availableCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-300">Monthly limit</label>

                <input
                  name="amount"
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className="mt-2 form-input"
                />
              </div>
            </div>

            <div className="shrink-0 p-6 md:p-8 border-t border-white/10 bg-[#0B1120]">
              <button
                disabled={saving}
                className="w-full h-13 rounded-2xl bg-white text-black font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Budget"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete budget?"
        message={`This will remove the budget for "${deleteTarget?.category?.name}".`}
        confirmText="Delete"
        danger
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteBudget}
      />

      <ConfirmModal
        open={Boolean(errorModal)}
        title="Something went wrong"
        message={errorModal || ""}
        confirmText="Close"
        onClose={() => setErrorModal(null)}
        onConfirm={() => setErrorModal(null)}
      />
    </DashboardLayout>
  );
};

const SummaryCard = ({ title, value }) => {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 min-w-0">
      <p className="text-slate-400 text-sm">{title}</p>
      <h3 className="money-text money-text-xl font-bold text-white mt-3">
        {value}
      </h3>
    </div>
  );
};

export default Budgets;