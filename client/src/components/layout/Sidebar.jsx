import { Link, useLocation } from "react-router-dom";
import { navigationItems } from "../../config/navigation";

const Sidebar = () => {
  const location = useLocation();
  const groups = [...new Set(navigationItems.map((item) => item.group))];

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col border-r border-white/10 bg-[#080D18]/95 backdrop-blur-xl px-4 py-5">
      <Link to="/dashboard" className="flex items-center gap-3 px-2 mb-7">
        <div className="h-9 w-9 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black tracking-tight shadow-lg shadow-blue-500/20">
          C
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Cash<span className="text-blue-400">Flowr</span>
          </h1>
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mt-0.5">Finance workspace</p>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto pr-1 space-y-5" aria-label="Primary navigation">
        {groups.map((group) => (
          <div key={group}>
            <p className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-600">
              {group}
            </p>
            <div className="space-y-1">
              {navigationItems.filter((item) => item.group === group).map((item) => {
                const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                      active
                        ? "bg-blue-500/10 text-white border-blue-500/20"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04] border-transparent"
                    }`}
                  >
                    <Icon size={18} className={active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-3.5">
        <p className="text-xs font-semibold text-slate-300">Private by default</p>
        <p className="text-[11px] leading-relaxed text-slate-500 mt-1">
          Your finance records are scoped to your account on every API request.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
