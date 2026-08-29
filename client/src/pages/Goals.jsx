import { useEffect, useMemo, useState } from "react";
import { Archive, CheckCircle2, Pencil, Plus, Target, WalletCards, X } from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import ConfirmModal from "../components/common/ConfirmModal";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatMoney } from "../utils/formatCurrency";

const emptyForm = {
  name: "",
  targetAmount: "",
  currentAmount: "",
  targetDate: "",
  color: "#3B82F6",
  notes: "",
};

const Goals = () => {
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const [goals, setGoals] = useState([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [contributionGoal, setContributionGoal] = useState(null);
  const [contribution, setContribution] = useState("");
  const [archiveTarget, setArchiveTarget] = useState(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/goals", { params: status === "all" ? { status: "all" } : { status } });
      setGoals(data.goals || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load savings goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [status]);

  const totals = useMemo(() => goals.reduce((acc, goal) => ({
    target: acc.target + goal.targetAmount,
    saved: acc.saved + goal.currentAmount,
    active: acc.active + (goal.status === "active" ? 1 : 0),
    completed: acc.completed + (goal.status === "completed" ? 1 : 0),
  }), { target: 0, saved: 0, active: 0, completed: 0 }), [goals]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (goal) => {
    setEditing(goal);
    setForm({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : "",
      color: goal.color || "#3B82F6",
      notes: goal.notes || "",
    });
    setFormOpen(true);
  };

  const submitGoal = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      const payload = {
        name: form.name.trim(),
        targetAmount: Number(form.targetAmount),
        targetDate: form.targetDate || null,
        color: form.color,
        notes: form.notes.trim(),
        ...(!editing ? { currentAmount: Number(form.currentAmount || 0) } : {}),
      };

      if (editing) {
        await api.put(`/goals/${editing._id}`, payload, { headers: { "If-Match": String(editing.__v ?? 0) } });
      } else {
        await api.post("/goals", payload);
      }
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await fetchGoals();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save goal.");
    } finally {
      setSaving(false);
    }
  };

  const submitContribution = async (event) => {
    event.preventDefault();
    if (!contributionGoal) return;
    try {
      setSaving(true);
      setError("");
      await api.patch(`/goals/${contributionGoal._id}/contribute`, { amount: Number(contribution) });
      setContributionGoal(null);
      setContribution("");
      await fetchGoals();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to add contribution.");
    } finally {
      setSaving(false);
    }
  };

  const archiveGoal = async () => {
    if (!archiveTarget) return;
    try {
      await api.patch(`/goals/${archiveTarget._id}/archive`);
      setArchiveTarget(null);
      await fetchGoals();
    } catch (requestError) {
      setArchiveTarget(null);
      setError(requestError.response?.data?.message || "Unable to archive goal.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 md:space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="eyebrow">Plan</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mt-2">Savings goals</h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">Turn future expenses and milestones into trackable targets.</p>
          </div>
          <button type="button" onClick={openCreate} className="action-primary self-start lg:self-auto"><Plus size={16} /> New goal</button>
        </header>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300 flex items-center justify-between gap-4">
            <span>{error}</span><button type="button" onClick={() => setError("")} className="text-red-200"><X size={16} /></button>
          </div>
        )}

        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <GoalMetric label="Total target" value={formatMoney(totals.target, currency)} icon={Target} />
          <GoalMetric label="Saved toward goals" value={formatMoney(totals.saved, currency)} icon={WalletCards} />
          <GoalMetric label="Active goals" value={totals.active} icon={Target} />
          <GoalMetric label="Completed" value={totals.completed} icon={CheckCircle2} />
        </section>

        <section className="finance-panel overflow-hidden">
          <div className="p-4 md:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="section-title">Goal portfolio</h2>
              <p className="text-xs text-slate-500 mt-1">Progress updates are atomic, so simultaneous contributions won’t overwrite each other.</p>
            </div>
            <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.025] p-1 self-start">
              {["all", "active", "completed"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStatus(item)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${status === item ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
              {[1, 2, 3].map((item) => <div key={item} className="h-48 rounded-2xl bg-white/[0.035] animate-pulse" />)}
            </div>
          ) : goals.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <Target size={30} className="text-slate-600 mx-auto" />
              <h3 className="text-lg font-semibold text-white mt-4">No goals in this view</h3>
              <p className="text-sm text-slate-500 mt-2">Create a savings target or change the status filter.</p>
              <button type="button" onClick={openCreate} className="action-primary mt-5"><Plus size={16} /> Create goal</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 md:p-5">
              {goals.map((goal) => (
                <article key={goal._id} className="finance-panel-muted p-5 flex flex-col min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: goal.color }} />
                        <h3 className="text-base font-semibold text-white truncate">{goal.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5">
                        {goal.targetDate ? `Target ${new Date(goal.targetDate).toLocaleDateString()}` : "No target date"}
                      </p>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-1 rounded-full border ${goal.status === "completed" ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" : "text-blue-300 bg-blue-500/10 border-blue-500/20"}`}>
                      {goal.status}
                    </span>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-end justify-between gap-3">
                      <p className="money-text text-xl font-bold text-white">{formatMoney(goal.currentAmount, currency)}</p>
                      <p className="text-xs text-slate-500">{goal.percentage}%</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">of {formatMoney(goal.targetAmount, currency)}</p>
                    <div className="progress-track mt-3"><div className="progress-value" style={{ width: `${Math.min(goal.percentage, 100)}%`, backgroundColor: goal.color }} /></div>
                    <p className="text-[11px] text-slate-500 mt-2">{formatMoney(goal.remaining, currency)} remaining</p>
                  </div>

                  {goal.notes && <p className="text-xs text-slate-500 leading-relaxed mt-4 line-clamp-2">{goal.notes}</p>}

                  <div className="mt-auto pt-5 flex items-center gap-2">
                    {goal.status === "active" && (
                      <button type="button" onClick={() => { setContributionGoal(goal); setContribution(""); }} className="action-primary flex-1">Contribute</button>
                    )}
                    <button type="button" onClick={() => openEdit(goal)} className="icon-button" aria-label={`Edit ${goal.name}`}><Pencil size={15} /></button>
                    <button type="button" onClick={() => setArchiveTarget(goal)} className="icon-button" aria-label={`Archive ${goal.name}`}><Archive size={15} /></button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {formOpen && (
        <Modal title={editing ? "Edit goal" : "Create savings goal"} description="Set a clear target and keep progress visible." onClose={() => setFormOpen(false)}>
          <form onSubmit={submitGoal} className="space-y-4">
            <Field label="Goal name"><input className="form-input" required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Emergency fund" /></Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Target amount"><input className="form-input" required type="number" min="0.01" step="0.01" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} /></Field>
              {!editing && <Field label="Already saved"><input className="form-input" type="number" min="0" step="0.01" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} /></Field>}
              <Field label="Target date"><input className="form-input" type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} /></Field>
              <Field label="Accent"><input className="form-input h-12 p-2" type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></Field>
            </div>
            <Field label="Notes"><textarea className="form-input" maxLength={1000} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="What is this goal for?" /></Field>
            <button type="submit" disabled={saving} className="action-primary w-full disabled:opacity-50">{saving ? "Saving…" : editing ? "Save changes" : "Create goal"}</button>
          </form>
        </Modal>
      )}

      {contributionGoal && (
        <Modal title={`Contribute to ${contributionGoal.name}`} description={`${formatMoney(contributionGoal.remaining, currency)} remaining to target.`} onClose={() => setContributionGoal(null)}>
          <form onSubmit={submitContribution} className="space-y-4">
            <Field label="Contribution amount"><input autoFocus className="form-input" required type="number" min="0.01" step="0.01" value={contribution} onChange={(e) => setContribution(e.target.value)} /></Field>
            <button type="submit" disabled={saving} className="action-primary w-full disabled:opacity-50">{saving ? "Adding…" : "Add contribution"}</button>
          </form>
        </Modal>
      )}

      <ConfirmModal
        open={Boolean(archiveTarget)}
        title="Archive goal?"
        message={`Archive "${archiveTarget?.name}"? It will be hidden from your active plan but kept in your records.`}
        confirmText="Archive"
        onClose={() => setArchiveTarget(null)}
        onConfirm={archiveGoal}
      />
    </DashboardLayout>
  );
};

const GoalMetric = ({ label, value, icon: Icon }) => (
  <div className="finance-panel p-5 flex items-start justify-between gap-3 min-w-0">
    <div className="min-w-0"><p className="finance-label">{label}</p><p className="money-text text-xl font-bold text-white mt-2">{value}</p></div>
    <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/15 flex items-center justify-center"><Icon size={17} /></div>
  </div>
);

const Field = ({ label, children }) => <label className="block"><span className="block text-xs font-medium text-slate-400 mb-1.5">{label}</span>{children}</label>;

const Modal = ({ title, description, onClose, children }) => (
  <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 py-6">
    <button type="button" aria-label="Close dialog" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
    <div role="dialog" aria-modal="true" className="relative w-full max-w-lg finance-panel max-h-[90vh] overflow-y-auto p-5 md:p-6">
      <button type="button" onClick={onClose} aria-label="Close" className="icon-button absolute right-4 top-4"><X size={16} /></button>
      <h2 className="text-xl font-semibold text-white pr-12">{title}</h2>
      <p className="text-xs text-slate-500 mt-1.5 mb-5">{description}</p>
      {children}
    </div>
  </div>
);

export default Goals;
