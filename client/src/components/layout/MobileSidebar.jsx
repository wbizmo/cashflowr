import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "../../context/UIContext";
import { navigationItems } from "../../config/navigation";

const MobileSidebar = () => {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUI();
  const location = useLocation();

  return (
    <AnimatePresence>
      {mobileSidebarOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm z-40 lg:hidden"
          />

          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-0 left-0 h-dvh w-[min(19rem,88vw)] bg-[#080D18] border-r border-white/10 z-50 px-4 py-5 lg:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6 px-2">
              <Link to="/dashboard" onClick={() => setMobileSidebarOpen(false)} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black">C</div>
                <h1 className="text-xl font-bold text-white">Cash<span className="text-blue-400">Flowr</span></h1>
              </Link>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setMobileSidebarOpen(false)}
                className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white hover:bg-white/[0.08]"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="space-y-1" aria-label="Mobile navigation">
              {navigationItems.map((item) => {
                const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-colors ${
                      active
                        ? "bg-blue-500/10 text-white border-blue-500/20"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04] border-transparent"
                    }`}
                  >
                    <Icon size={19} className={active ? "text-blue-400" : "text-slate-500"} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;
