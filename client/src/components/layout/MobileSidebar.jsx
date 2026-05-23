import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useUI } from "../../context/UIContext";

const MobileSidebar = () => {
  const {
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useUI();

  return (
    <AnimatePresence>

      {mobileSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="
              fixed inset-0
              bg-black/60
              backdrop-blur-sm
              z-40
              lg:hidden
            "
          />

          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.25 }}
            className="
              fixed top-0 left-0
              h-screen
              w-72
              bg-[#0B1120]
              border-r border-white/10
              z-50
              p-6
              lg:hidden
            "
          >
            <div className="flex items-center justify-between mb-10">
              <h1 className="text-2xl font-bold text-white">
                Cash<span className="text-blue-500">Flowr</span>
              </h1>

              <button
                onClick={() =>
                  setMobileSidebarOpen(false)
                }
                className="
                  h-10 w-10
                  rounded-xl
                  bg-white/5
                  border border-white/10
                  flex items-center justify-center
                "
              >
                <X size={18} className="text-white" />
              </button>
            </div>

            <div className="space-y-4 text-slate-300">
              <div className="p-3 rounded-xl hover:bg-white/5 transition">
                Dashboard
              </div>

              <div className="p-3 rounded-xl hover:bg-white/5 transition">
                Transactions
              </div>

              <div className="p-3 rounded-xl hover:bg-white/5 transition">
                Analytics
              </div>

              <div className="p-3 rounded-xl hover:bg-white/5 transition">
                Budgets
              </div>

              <div className="p-3 rounded-xl hover:bg-white/5 transition">
                Settings
              </div>
            </div>

          </motion.aside>
        </>
      )}

    </AnimatePresence>
  );
};

export default MobileSidebar;