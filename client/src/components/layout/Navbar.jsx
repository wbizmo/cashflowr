import {
  Bell,
  Menu,
  Search,
} from "lucide-react";

import { useUI } from "../../context/UIContext";

const Navbar = () => {
  const { setMobileSidebarOpen } = useUI();

  return (
    <header
      className="
        sticky top-0 z-30
        h-20
        border-b border-white/10
        bg-[#070B14]/80
        backdrop-blur-xl
        flex items-center justify-between
        px-4 md:px-6
      "
    >
      <div className="flex items-center gap-4">

        <button
          onClick={() =>
            setMobileSidebarOpen(true)
          }
          className="
            lg:hidden
            h-11 w-11
            rounded-xl
            border border-white/10
            bg-white/[0.03]
            flex items-center justify-center
            cursor-pointer
            hover:scale-105
            active:scale-95
            transition-all duration-300
          "
        >
          <Menu size={20} className="text-white" />
        </button>

        <div>
          <h2 className="text-xl font-semibold text-white">
            Dashboard
          </h2>

          <p className="text-sm text-slate-400 hidden md:block">
            Welcome back
          </p>
        </div>

      </div>

      <div className="flex items-center gap-3">

        <div
          className="
            hidden md:flex
            items-center gap-2
            px-4
            h-11
            rounded-xl
            border border-white/10
            bg-white/[0.03]
            transition-all
            duration-300
            focus-within:border-blue-500/40
            focus-within:bg-white/[0.05]
          "
        >
          <Search
            size={18}
            className="text-slate-400"
          />

          <input
            type="text"
            placeholder="Search..."
            className="
              bg-transparent
              outline-none
              text-sm
              text-white
              placeholder:text-slate-500
            "
          />
        </div>

        <button
          className="
            h-11 w-11
            rounded-xl
            border border-white/10
            bg-white/[0.03]
            flex items-center justify-center
            cursor-pointer
            hover:scale-105
            active:scale-95
            hover:bg-white/[0.06]
            transition-all duration-300
          "
        >
          <Bell size={18} className="text-white" />
        </button>

        <button
          className="
            h-11 w-11
            rounded-full
            bg-gradient-to-br
            from-blue-500
            to-purple-500
            border border-white/10
            cursor-pointer
            hover:scale-105
            active:scale-95
            transition-all duration-300
          "
        />

      </div>
    </header>
  );
};

export default Navbar;