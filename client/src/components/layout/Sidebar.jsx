import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Wallet,
  Settings,
} from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Transactions",
    icon: Receipt,
  },
  {
    name: "Analytics",
    icon: PieChart,
  },
  {
    name: "Budgets",
    icon: Wallet,
  },
  {
    name: "Settings",
    icon: Settings,
  },
];

const Sidebar = () => {
  return (
    <aside
      className="
        hidden lg:flex
        w-72
        flex-col
        border-r border-white/10
        bg-white/[0.03]
        backdrop-blur-xl
        p-6
      "
    >
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Cash<span className="text-blue-500">Flowr</span>
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          Smart finance management
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item.name}
            className="
              group
              relative
              w-full
              flex items-center gap-3
              px-4 py-3
              rounded-2xl
              text-slate-300
              hover:text-white
              hover:bg-white/5
              active:scale-[0.98]
              transition-all
              duration-300
              cursor-pointer
            "
          >
            <item.icon
              size={20}
              className="
                transition-transform
                duration-300
                group-hover:scale-110
              "
            />

            <span className="font-medium">
              {item.name}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;