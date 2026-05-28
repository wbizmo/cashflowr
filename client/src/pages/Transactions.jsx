import { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import ConfirmModal from "../components/common/ConfirmModal";
import useTransactions from "../hooks/useTransactions";
import { categoryIcons } from "../utils/categoryOptions";
import { formatMoney } from "../utils/formatCurrency";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  title: "",
  amount: "",
  type: "expense",
  category: "",
  description: "",
  date: "",
};

const Transactions = () => {
  const {
    transactions,
    categories,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  const { user } = useAuth();
  const currency = user?.currency || "USD";

  const [form, setForm] = useState(initialForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  const filteredCategories = categories.filter(
    (category) => category.type === form.type
  );

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.title.toLowerCase().includes(search.toLowerCase()) ||
      transaction.category?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "all" || transaction.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const totals = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    const expenses = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
      count: transactions.length,
    };
  }, [transactions]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (transaction) => {
    setEditingId(transaction._id);

    setForm({
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category?._id || "",
      description: transaction.description || "",
      date: transaction.date ? transaction.date.slice(0, 10) : "",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "type" ? { category: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        ...form,
        amount: Number(form.amount),
        date: form.date || undefined,
      };

      if (editingId) {
        await updateTransaction(editingId, payload);
      } else {
        await createTransaction(payload);
      }

      closeModal();
    } catch (error) {
      setErrorModal(
        error.response?.data?.message || "Failed to save transaction."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (transaction) => {
    setDeleteTarget(transaction);
  };

  const confirmDeleteTransaction = async () => {
    if (!deleteTarget) return;

    try {
      await deleteTransaction(deleteTarget._id);
      setDeleteTarget(null);
    } catch (error) {
      setDeleteTarget(null);
      setErrorModal(
        error.response?.data?.message || "Failed to delete transaction."
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Transactions
            </h1>

            <p className="text-slate-400 mt-3">
              Track, manage, and organize your income and expenses.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="h-12 px-5 rounded-2xl bg-white text-black font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={18} />
            Add Transaction
          </button>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <SummaryCard
            title="Total Income"
            value={formatMoney(totals.income, currency)}
            icon={ArrowUpCircle}
            tone="green"
          />

          <SummaryCard
            title="Total Expenses"
            value={formatMoney(totals.expenses, currency)}
            icon={ArrowDownCircle}
            tone="red"
          />

          <SummaryCard
            title="Net Balance"
            value={formatMoney(totals.balance, currency)}
            icon={Wallet}
            tone="blue"
          />

          <SummaryCard
            title="Transactions"
            value={totals.count}
            icon={Wallet}
            tone="purple"
          />
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 h-12 md:w-96">
              <Search size={18} className="text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions..."
                className="w-full bg-transparent outline-none text-white placeholder:text-slate-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-white outline-none select-dark"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 rounded-3xl border border-white/10 bg-white/[0.03] animate-pulse"
                />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-20 w-20 mx-auto rounded-[28px] bg-blue-500/10 flex items-center justify-center">
                <Wallet className="text-blue-400" size={32} />
              </div>

              <h3 className="text-white text-2xl font-semibold mt-6">
                No transactions found
              </h3>

              <p className="text-slate-400 mt-3">
                Add your first transaction to start tracking your money.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredTransactions.map((transaction) => {
                const Icon =
                  categoryIcons[transaction.category?.icon] || Wallet;

                return (
                  <div
                    key={transaction._id}
                    className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 hover:bg-white/[0.03] transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${
                            transaction.category?.color || "#3B82F6"
                          }20`,
                        }}
                      >
                        <Icon
                          size={22}
                          style={{
                            color: transaction.category?.color || "#3B82F6",
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-white font-semibold text-lg truncate">
                          {transaction.title}
                        </h3>

                        <p className="text-slate-400 text-sm mt-1 truncate">
                          {transaction.category?.name || "Uncategorized"} •{" "}
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-5">
                      <p
                        className={`money-text money-text-lg text-right max-w-[180px] font-bold ${
                          transaction.type === "income"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatMoney(transaction.amount, currency)}
                      </p>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => openEditModal(transaction)}
                          className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center hover:bg-white/[0.06] cursor-pointer"
                        >
                          <Pencil size={16} className="text-slate-300" />
                        </button>

                        <button
                          onClick={() => handleDelete(transaction)}
                          className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 py-6">
          <div
            onClick={closeModal}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-2xl max-h-[90vh] rounded-[32px] border border-white/10 bg-[#0B1120] shadow-2xl overflow-hidden flex flex-col"
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
                {editingId ? "Edit Transaction" : "Add Transaction"}
              </h2>

              <p className="text-slate-400 mt-2">
                Record income and expenses using your saved categories.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Title">
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Groceries"
                    className="form-input"
                  />
                </Field>

                <Field label="Amount">
                  <input
                    name="amount"
                    type="number"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="0.00"
                    className="form-input"
                  />
                </Field>

                <Field label="Type">
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="form-input select-dark"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </Field>

                <Field label="Category">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="form-input select-dark"
                  >
                    <option value="">Select category</option>

                    {filteredCategories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Date">
                  <input
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    className="form-input"
                  />
                </Field>

                <Field label="Description">
                  <input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Optional note"
                    className="form-input"
                  />
                </Field>
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
                    : "Save Transaction"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete transaction?"
        message={`This will permanently remove "${deleteTarget?.title}" from your financial records.`}
        confirmText="Delete"
        danger
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteTransaction}
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

const SummaryCard = ({ title, value, icon: Icon, tone }) => {
  const tones = {
    green: "bg-emerald-500/10 text-emerald-400",
    red: "bg-red-500/10 text-red-400",
    blue: "bg-blue-500/10 text-blue-400",
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

const Field = ({ label, children }) => {
  return (
    <div>
      <label className="text-sm text-slate-300">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
};

export default Transactions;