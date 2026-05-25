import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Tags,
  PieChart,
  Wallet,
  Settings,
  Bell,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Transactions", icon: Receipt, path: "/transactions" },
  { name: "Categories", icon: Tags, path: "/categories" },
  { name: "Analytics", icon: PieChart, path: "/analytics" },
  { name: "Budgets", icon: Wallet, path: "/budgets" },
  { name: "Notifications", icon: Bell, path: "/notifications" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-72 flex-col border-r border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Cash<span className="text-blue-500">Flowr</span>
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          Smart finance management
        </p>
      </div>

      <nav className="space-y-2 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer border ${
                active
                  ? "bg-blue-500/10 text-white border-blue-500/20"
                  : "text-slate-300 hover:text-white hover:bg-white/5 border-transparent"
              }`}
            >
              <item.icon
                size={20}
                className="transition-transform duration-300 group-hover:scale-110"
              />

              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;