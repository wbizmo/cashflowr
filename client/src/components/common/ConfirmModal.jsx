import { AlertTriangle, X } from "lucide-react";

const ConfirmModal = ({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  onConfirm,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      <div className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-[#0B1120] p-6 md:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 h-10 w-10 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center cursor-pointer hover:bg-white/[0.06]"
        >
          <X size={18} className="text-white" />
        </button>

        <div
          className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 ${
            danger ? "bg-red-500/10" : "bg-blue-500/10"
          }`}
        >
          <AlertTriangle
            className={danger ? "text-red-400" : "text-blue-400"}
          />
        </div>

        <h2 className="text-2xl font-bold text-white">{title}</h2>

        <p className="text-slate-400 mt-3 leading-relaxed">{message}</p>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06] cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`h-12 rounded-2xl font-semibold cursor-pointer ${
              danger
                ? "bg-red-500 text-white hover:bg-red-400"
                : "bg-white text-black hover:scale-[1.02]"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;