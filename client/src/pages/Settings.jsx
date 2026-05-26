import { useEffect, useState } from "react";
import { Mail, Save, User, Wallet } from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import ConfirmModal from "../components/common/ConfirmModal";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const currencies = [
  { code: "USD", label: "US Dollar", sample: "$1,000.00" },
  { code: "GBP", label: "British Pound", sample: "£1,000.00" },
  { code: "EUR", label: "Euro", sample: "€1,000.00" },
  { code: "NGN", label: "Nigerian Naira", sample: "₦1,000.00" },
];

const Settings = () => {
  const { user, updateAuthUser } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    currency: "USD",
  });

  const [saving, setSaving] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        currency: user.currency || "USD",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const saveSettings = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const { data } = await api.put("/users/settings", form);

      updateAuthUser(data.user);
      setSuccessModal(true);
    } catch (error) {
      setErrorModal(error.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Settings
          </h1>

          <p className="text-slate-400 mt-3">
            Manage your profile and app preferences.
          </p>
        </div>

        <form
          onSubmit={saveSettings}
          className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden"
        >
          <div className="p-6 md:p-8 border-b border-white/10">
            <h2 className="text-2xl font-semibold text-white">
              Profile
            </h2>

            <p className="text-slate-400 mt-2">
              Keep your CashFlowr workspace personal and accurate.
            </p>
          </div>

          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <User size={16} />
                First name
              </label>

              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="mt-2 form-input"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <User size={16} />
                Last name
              </label>

              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="mt-2 form-input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <Mail size={16} />
                Email address
              </label>

              <input
                value={user?.email || ""}
                disabled
                className="mt-2 form-input opacity-70 cursor-not-allowed"
              />

              <p className="text-xs text-slate-500 mt-2">
                Email update will be added later with verification.
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8 border-t border-white/10">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <Wallet size={22} />
              Currency
            </h2>

            <p className="text-slate-400 mt-2">
              Choose how amounts are displayed across dashboard, transactions,
              budgets, notifications, and analytics.
            </p>

            <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {currencies.map((currency) => {
                const active = form.currency === currency.code;

                return (
                  <button
                    key={currency.code}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        currency: currency.code,
                      }))
                    }
                    className={`text-left rounded-3xl border p-5 transition-all cursor-pointer ${
                      active
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="text-white font-semibold">
                      {currency.code}
                    </p>

                    <p className="text-slate-400 text-sm mt-1">
                      {currency.label}
                    </p>

                    <p className="text-blue-400 text-sm mt-3">
                      {currency.sample}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 md:p-8 border-t border-white/10 flex justify-end">
            <button
              disabled={saving}
              className="h-12 px-6 rounded-2xl bg-white text-black font-semibold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        open={successModal}
        title="Settings saved"
        message="Your profile and currency preference have been updated."
        confirmText="Close"
        onClose={() => setSuccessModal(false)}
        onConfirm={() => setSuccessModal(false)}
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

export default Settings;