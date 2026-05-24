import { Link, useLocation } from "react-router-dom";
import {
  X,
  LayoutDashboard,
  Receipt,
  Tags,
  PieChart,
  Wallet,
  Settings,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "../../context/UIContext";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Transactions", icon: Receipt, path: "/transactions" },
  { name: "Categories", icon: Tags, path: "/categories" },
  { name: "Analytics", icon: PieChart, path: "/analytics" },
  { name: "Budgets", icon: Wallet, path: "/budgets" },
  { name: "Notifications", icon: Bell, path: "/notifications" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

const MobileSidebar = () => {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUI();
  const location = useLocation();

  return (
    <AnimatePresence>
      {mobileSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />

          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 h-screen w-72 bg-[#0B1120] border-r border-white/10 z-50 p-6 lg:hidden"
          >
            <div className="flex items-center justify-between mb-10">
              <h1 className="text-2xl font-bold text-white">
                Cash<span className="text-blue-500">Flowr</span>
              </h1>

              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer"
              >
                <X size={18} className="text-white" />
              </button>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const active = location.pathname === item.path;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer border ${
                      active
                        ? "bg-blue-500/10 text-white border-blue-500/20"
                        : "text-slate-300 hover:text-white hover:bg-white/5 border-transparent"
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
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