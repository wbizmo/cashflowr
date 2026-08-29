import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Pencil, Plus, Receipt, Search, Trash2, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

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
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [form, setForm] = useState(initialForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionError, setActionError] = useState("");

  const {
    transactions,
    categories,
    pagination,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions({ page, limit: 15, search, type, from, to });

  const openCreateModal = () => {
    setEditing(null);
    setForm({ ...initialForm, date: new Date().toISOString().slice(0, 10) });
    setModalOpen(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (searchParams.get("new") !== "1") return;

    openCreateModal();
    const next = new URLSearchParams(searchParams);
    next.delete("new");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type]
  );

  const openEditModal = (transaction) => {
    setEditing(transaction);
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
    setEditing(null);
    setForm(initialForm);
  };

  const handleField = (name, value) => {
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "type" ? { category: "" } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setActionError("");
      const payload = {
        ...form,
        amount: Number(form.amount),
        date: form.date || undefined,
        description: form.description.trim(),
      };
      if (editing) await updateTransaction(editing._id, payload, editing.__v);
      else await createTransaction(payload);
      closeModal();
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || "Unable to save transaction.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTransaction(deleteTarget._id, deleteTarget.__v);
      setDeleteTarget(null);
    } catch (requestError) {
      setDeleteTarget(null);
      setActionError(requestError.response?.data?.message || "Unable to delete transaction.");
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setType("all");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <DashboardLayout>
      <div className="space-y-5 md:space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="eyebrow">Money</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mt-2">Transactions</h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">Your ledger is server-filtered and paginated, so totals and navigation stay correct as history grows.</p>
          </div>
          <button type="button" onClick={openCreateModal} className="action-primary self-start lg:self-auto"><Plus size={16} /> Add transaction</button>
        </header>

        {(error || actionError) && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300 flex items-center justify-between gap-3">
            <span>{actionError || error}</span>
            <button type="button" onClick={() => setActionError("")}><X size={16} /></button>
          </div>
        )}

        <section className="finance-panel overflow-hidden">
          <div className="p-4 md:p-5 border-b border-white/10 space-y-4">
            <div className="flex flex-col xl:flex-row xl:items-center gap-3">
              <div className="flex items-center gap-2 h-11 rounded-xl border border-white/10 bg-white/[0.025] px-3 flex-1 min-w-0">
                <Search size={16} className="text-slate-500 shrink-0" />
                <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search transaction titles" className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-600" />
              </div>
              <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="form-input xl:w-40">
                <option value="all">All types</option><option value="income">Income</option><option value="expense">Expense</option>
              </select>
              <div className="grid grid-cols-2 gap-2 xl:w-[310px]">
                <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="form-input" aria-label="From date" />
                <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="form-input" aria-label="To date" />
              </div>
              <button type="button" onClick={clearFilters} className="action-secondary"><Filter size={15} /> Reset</button>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
              <span>{pagination.total} matching transaction{pagination.total === 1 ? "" : "s"}</span>
              <span>{start}–{end} of {pagination.total}</span>
            </div>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">{[1, 2, 3, 4].map((item) => <div key={item} className="h-17 rounded-xl bg-white/[0.035] animate-pulse" />)}</div>
          ) : transactions.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <Receipt size={30} className="text-slate-600 mx-auto" />
              <h3 className="text-lg font-semibold text-white mt-4">No matching transactions</h3>
              <p className="text-sm text-slate-500 mt-2">Change your filters or record a new transaction.</p>
              <button type="button" onClick={openCreateModal} className="action-primary mt-5"><Plus size={16} /> Add transaction</button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {transactions.map((transaction) => {
                const Icon = categoryIcons[transaction.category?.icon] || Receipt;
                return (
                  <article key={transaction._id} className="p-4 md:px-5 flex items-center gap-3 md:gap-4 hover:bg-white/[0.018]">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${transaction.category?.color || "#3B82F6"}18` }}>
                      <Icon size={17} style={{ color: transaction.category?.color || "#3B82F6" }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">{transaction.title}</h3>
                        <span className={`hidden sm:inline-flex text-[9px] uppercase tracking-wide font-semibold rounded-full px-1.5 py-0.5 ${transaction.type === "income" ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>{transaction.type}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate">{transaction.category?.name || "Uncategorized"} · {new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                    <p className={`money-text text-sm md:text-base font-bold text-right ${transaction.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                      {transaction.type === "income" ? "+" : "-"}{formatMoney(transaction.amount, currency)}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button type="button" onClick={() => openEditModal(transaction)} className="icon-button" aria-label={`Edit ${transaction.title}`}><Pencil size={15} /></button>
                      <button type="button" onClick={() => setDeleteTarget(transaction)} className="icon-button text-red-400" aria-label={`Delete ${transaction.title}`}><Trash2 size={15} /></button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="p-4 border-t border-white/10 flex items-center justify-between gap-3">
            <button type="button" disabled={!pagination.hasPreviousPage || loading} onClick={() => setPage((value) => Math.max(value - 1, 1))} className="action-secondary disabled:opacity-40"><ChevronLeft size={15} /> Previous</button>
            <span className="text-xs text-slate-500">Page {pagination.page} of {pagination.pages}</span>
            <button type="button" disabled={!pagination.hasNextPage || loading} onClick={() => setPage((value) => value + 1)} className="action-secondary disabled:opacity-40">Next <ChevronRight size={15} /></button>
          </div>
        </section>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 py-6">
          <button type="button" aria-label="Close transaction dialog" onClick={closeModal} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <form onSubmit={handleSubmit} role="dialog" aria-modal="true" className="relative w-full max-w-2xl finance-panel max-h-[90vh] overflow-y-auto p-5 md:p-6">
            <button type="button" onClick={closeModal} aria-label="Close" className="icon-button absolute right-4 top-4"><X size={16} /></button>
            <h2 className="text-xl font-semibold text-white pr-12">{editing ? "Edit transaction" : "Add transaction"}</h2>
            <p className="text-xs text-slate-500 mt-1.5 mb-5">Record a categorized income or expense.</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Title"><input name="title" required maxLength={160} value={form.title} onChange={(e) => handleField("title", e.target.value)} className="form-input" placeholder="Groceries" /></Field>
              <Field label="Amount"><input name="amount" required type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => handleField("amount", e.target.value)} className="form-input" placeholder="0.00" /></Field>
              <Field label="Type"><select value={form.type} onChange={(e) => handleField("type", e.target.value)} className="form-input"><option value="expense">Expense</option><option value="income">Income</option></select></Field>
              <Field label="Category"><select required value={form.category} onChange={(e) => handleField("category", e.target.value)} className="form-input"><option value="">Select category</option>{filteredCategories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></Field>
              <Field label="Date"><input type="date" value={form.date} onChange={(e) => handleField("date", e.target.value)} className="form-input" /></Field>
              <Field label="Description"><input maxLength={1000} value={form.description} onChange={(e) => handleField("description", e.target.value)} className="form-input" placeholder="Optional note" /></Field>
            </div>
            <button type="submit" disabled={saving} className="action-primary w-full mt-5 disabled:opacity-50">{saving ? "Saving…" : editing ? "Save changes" : "Add transaction"}</button>
          </form>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete transaction?"
        message={`Permanently remove "${deleteTarget?.title}" from your ledger?`}
        confirmText="Delete"
        danger
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </DashboardLayout>
  );
};

const Field = ({ label, children }) => <label className="block"><span className="block text-xs font-medium text-slate-400 mb-1.5">{label}</span>{children}</label>;

export default Transactions;
