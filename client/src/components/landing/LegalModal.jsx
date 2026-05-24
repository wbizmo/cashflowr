import { X, ShieldCheck } from "lucide-react";

const legalContent = {
  privacy: {
    title: "Privacy Policy",
    text: "CashFlowr is designed to protect user financial data with secure account access, protected routes, and responsible data handling. We only collect information required to provide budgeting, transaction tracking, analytics, and account management features.",
  },
  terms: {
    title: "Terms of Service",
    text: "By using CashFlowr, users agree to use the platform responsibly for personal finance tracking and budgeting. CashFlowr provides financial visibility tools and does not replace professional financial, legal, or tax advice.",
  },
  security: {
    title: "Security",
    text: "CashFlowr uses modern authentication practices, account-based access control, protected API routes, and secure database storage to keep user records isolated and protected.",
  },
  cookies: {
    title: "Cookie Policy",
    text: "CashFlowr may use essential browser storage and session tools to keep users signed in, remember preferences, and improve the app experience. Marketing cookies are not required for core functionality.",
  },
};

const LegalModal = ({ type, onClose }) => {
  if (!type) return null;

  const content = legalContent[type];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      <div className="relative w-full max-w-xl rounded-[32px] border border-white/10 bg-[#0B1120] p-6 md:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 h-10 w-10 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center hover:bg-white/[0.06] cursor-pointer transition-all"
        >
          <X size={18} className="text-white" />
        </button>

        <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
          <ShieldCheck className="text-blue-400" />
        </div>

        <h2 className="text-3xl font-bold text-white">
          {content.title}
        </h2>

        <p className="mt-5 text-slate-400 leading-relaxed">
          {content.text}
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
          For enquiries, contact CashFlowr at{" "}
          <span className="text-white">wbizmo@gmail.com</span>.
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full rounded-2xl bg-white text-black py-3 font-semibold hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all"
        >
          I understand
        </button>
      </div>
    </div>
  );
};

export default LegalModal;