import { useEffect, useMemo, useState } from "react";
import { CalendarClock, PauseCircle, Pencil, PlayCircle, Plus, Repeat2, Trash2, X } from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import ConfirmModal from "../components/common/ConfirmModal";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatMoney } from "../utils/formatCurrency";

const emptyForm = {
  title: "",
  amount: "",
  type: "expense",
  category: "",
  frequency: "monthly",
  nextDueDate: "",
  endDate: "",
  description: "",
  status: "active",
};

const Recurring = () => {
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("active");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [postingId, setPostingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const params = filter === "all" ? { status: "all" } : { status: filter };
      const [recurringResponse, categoryResponse] = await Promise.all([
        api.get("/recurring", { params }),
        api.get("/categories"),
      ]);
      setItems(recurringResponse.data.recurring || []);
      setCategories(categoryResponse.data.categories || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load recurring cash flow.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const filteredCategories = useMemo(() => categories.filter((category) => category.type === form.type), [categories, form.type]);
  const monthlyExpense = useMemo(() => items
    .filter((item) => item.status === "active" && item.type === "expense")
    .reduce((sum, item) => sum + normalizedMonthlyAmount(item), 0), [items]);
  const monthlyIncome = useMemo(() => items
    .filter((item) => item.status === "active" && item.type === "income")
    .reduce((sum, item) => sum + normalizedMonthlyAmount(item), 0), [items]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      amount: item.amount,
      type: item.type,
      category: item.category?._id || "",
      frequency: item.frequency,
      nextDueDate: item.nextDueDate ? item.nextDueDate.slice(0, 10) : "",
      endDate: item.endDate ? item.endDate.slice(0, 10) : "",
      description: item.description || "",
      status: item.status,
    });
    setFormOpen(true);
  };

  const setField = (name, value) => {
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "type" ? { category: "" } : {}),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      const payload = {
        ...form,
        amount: Number(form.amount),
        endDate: form.endDate || null,
        description: form.description.trim(),
      };
      if (editing) {
        await api.put(`/recurring/${editing._id}`, payload, { headers: { "If-Match": String(editing.__v ?? 0) } });
      } else {
        await api.post("/recurring", payload);
      }
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setNotice(editing ? "Recurring item updated." : "Recurring item created.");
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save recurring item.");
    } finally {
      setSaving(false);
    }
  };

  const postItem = async (item) => {
    try {
      setPostingId(item._id);
      setError("");
      const { data } = await api.post(`/recurring/${item._id}/post`);
      setNotice(`${data.transaction?.title || item.title} was posted to transactions.`);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to post recurring item.");
    } finally {
      setPostingId(null);
    }
  };

  const togglePause = async (item) => {
    try {
      const nextStatus = item.status === "paused" ? "active" : "paused";
      await api.put(`/recurring/${item._id}`, { status: nextStatus }, { headers: { "If-Match": String(item.__v ?? 0) } });
      setNotice(nextStatus === "paused" ? "Recurring item paused." : "Recurring item resumed.");
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update recurring item.");
    }
  };

  const deleteItem = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/recurring/${deleteTarget._id}`);
      setDeleteTarget(null);
      setNotice("Recurring item deleted.");
      await loadData();
    } catch (requestError) {
      setDeleteTarget(null);
      setError(requestError.response?.data?.message || "Unable to delete recurring item.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 md:space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="eyebrow">Plan</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mt-2">Recurring cash flow</h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">Track repeat income and bills, then post each due occurrence into your ledger without duplicate entries.</p>
          </div>
          <button type="button" onClick={openCreate} className="action-primary self-start lg:self-auto"><Plus size={16} /> New recurring item</button>
        </header>

        {(error || notice) && (
          <div className={`rounded-xl border px-4 py-3 text-sm flex items-center justify-between gap-4 ${error ? "border-red-500/20 bg-red-500/[0.07] text-red-300" : "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-300"}`}>
            <span>{error || notice}</span><button type="button" onClick={() => { setError(""); setNotice(""); }}><X size={16} /></button>
          </div>
        )}

        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <RecurringMetric label="Monthly equivalent income" value={formatMoney(monthlyIncome, currency)} tone="green" />
          <RecurringMetric label="Monthly equivalent bills" value={formatMoney(monthlyExpense, currency)} tone="red" />
          <RecurringMetric label="Planned monthly net" value={formatMoney(monthlyIncome - monthlyExpense, currency)} tone={monthlyIncome - monthlyExpense >= 0 ? "blue" : "red"} />
          <RecurringMetric label="Items in view" value={items.length} tone="purple" />
        </section>

        <section className="finance-panel overflow-hidden">
          <div className="p-4 md:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="section-title">Schedule</h2>
              <p className="text-xs text-slate-500 mt-1">Posting a due item is idempotent for that occurrence.</p>
            </div>
            <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.025] p-1 self-start">
              {["active", "paused", "completed", "all"].map((item) => (
                <button key={item} type="button" onClick={() => setFilter(item)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${filter === item ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}>{item}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-20 rounded-xl bg-white/[0.035] animate-pulse" />)}</div>
          ) : items.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <Repeat2 size={30} className="text-slate-600 mx-auto" />
              <h3 className="text-lg font-semibold text-white mt-4">No recurring items here</h3>
              <p className="text-sm text-slate-500 mt-2">Add rent, salary, subscriptions, retainers, or any repeating cash flow.</p>
              <button type="button" onClick={openCreate} className="action-primary mt-5"><Plus size={16} /> Add recurring item</button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {items.map((item) => {
                const due = dueLabel(item.nextDueDate);
                return (
                  <article key={item._id} className="p-4 md:p-5 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-white/[0.018]">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/15 flex items-center justify-center shrink-0"><CalendarClock size={18} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                        <span className={`text-[10px] font-semibold uppercase tracking-wide rounded-full border px-2 py-0.5 ${item.status === "paused" ? "text-amber-300 bg-amber-500/10 border-amber-500/20" : item.status === "completed" ? "text-slate-400 bg-white/[0.03] border-white/10" : "text-emerald-300 bg-emerald-500/10 border-emerald-500/20"}`}>{item.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate">{item.category?.name || "Uncategorized"} · {item.frequency} · {due}</p>
                    </div>
                    <div className="flex items-center justify-between lg:justify-end gap-4 lg:min-w-[360px]">
                      <p className={`money-text text-base font-bold ${item.type === "income" ? "text-emerald-400" : "text-red-400"}`}>{item.type === "income" ? "+" : "-"}{formatMoney(item.amount, currency)}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.status === "active" && <button type="button" disabled={postingId === item._id} onClick={() => postItem(item)} className="action-secondary disabled:opacity-50">{postingId === item._id ? "Posting…" : "Post"}</button>}
                        {item.status !== "completed" && <button type="button" onClick={() => togglePause(item)} className="icon-button" aria-label={item.status === "paused" ? `Resume ${item.title}` : `Pause ${item.title}`}>{item.status === "paused" ? <PlayCircle size={16} /> : <PauseCircle size={16} />}</button>}
                        <button type="button" onClick={() => openEdit(item)} className="icon-button" aria-label={`Edit ${item.title}`}><Pencil size={15} /></button>
                        <button type="button" onClick={() => setDeleteTarget(item)} className="icon-button text-red-400" aria-label={`Delete ${item.title}`}><Trash2 size={15} /></button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {formOpen && (
        <Modal title={editing ? "Edit recurring item" : "Create recurring item"} description="Define the schedule and the transaction CashFlowr should post for each occurrence." onClose={() => setFormOpen(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Title"><input required maxLength={160} className="form-input" value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="Monthly rent" /></Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Amount"><input required type="number" min="0.01" step="0.01" className="form-input" value={form.amount} onChange={(e) => setField("amount", e.target.value)} /></Field>
              <Field label="Type"><select className="form-input" value={form.type} onChange={(e) => setField("type", e.target.value)}><option value="expense">Expense</option><option value="income">Income</option></select></Field>
              <Field label="Category"><select required className="form-input" value={form.category} onChange={(e) => setField("category", e.target.value)}><option value="">Select category</option>{filteredCategories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></Field>
              <Field label="Frequency"><select className="form-input" value={form.frequency} onChange={(e) => setField("frequency", e.target.value)}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select></Field>
              <Field label="Next due date"><input required type="date" className="form-input" value={form.nextDueDate} onChange={(e) => setField("nextDueDate", e.target.value)} /></Field>
              <Field label="End date"><input type="date" className="form-input" value={form.endDate} onChange={(e) => setField("endDate", e.target.value)} /></Field>
              {editing && <Field label="Status"><select className="form-input" value={form.status} onChange={(e) => setField("status", e.target.value)}><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option></select></Field>}
            </div>
            <Field label="Description"><textarea className="form-input" maxLength={1000} value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="Optional note" /></Field>
            <button type="submit" disabled={saving} className="action-primary w-full disabled:opacity-50">{saving ? "Saving…" : editing ? "Save changes" : "Create recurring item"}</button>
          </form>
        </Modal>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete recurring item?"
        message={`Delete "${deleteTarget?.title}"? Previously posted transactions will remain in your ledger.`}
        confirmText="Delete"
        danger
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteItem}
      />
    </DashboardLayout>
  );
};

const normalizedMonthlyAmount = (item) => {
  if (item.frequency === "weekly") return item.amount * 52 / 12;
  if (item.frequency === "quarterly") return item.amount / 3;
  if (item.frequency === "yearly") return item.amount / 12;
  return item.amount;
};

const dueLabel = (dateValue) => {
  const due = new Date(dateValue);
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const days = Math.round((startDue - startToday) / 86_400_000);
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due ${due.toLocaleDateString()}`;
};

const RecurringMetric = ({ label, value, tone }) => {
  const tones = { green: "text-emerald-400", red: "text-red-400", blue: "text-blue-400", purple: "text-violet-400" };
  return <div className="finance-panel p-5 min-w-0"><p className="finance-label">{label}</p><p className={`money-text text-xl font-bold mt-2 ${tones[tone] || tones.blue}`}>{value}</p></div>;
};

const Field = ({ label, children }) => <label className="block"><span className="block text-xs font-medium text-slate-400 mb-1.5">{label}</span>{children}</label>;
const Modal = ({ title, description, onClose, children }) => (
  <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 py-6">
    <button type="button" aria-label="Close dialog" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
    <div role="dialog" aria-modal="true" className="relative w-full max-w-2xl finance-panel max-h-[90vh] overflow-y-auto p-5 md:p-6">
      <button type="button" onClick={onClose} aria-label="Close" className="icon-button absolute right-4 top-4"><X size={16} /></button>
      <h2 className="text-xl font-semibold text-white pr-12">{title}</h2>
      <p className="text-xs text-slate-500 mt-1.5 mb-5">{description}</p>
      {children}
    </div>
  </div>
);

export default Recurring;
