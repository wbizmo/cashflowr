import { Link } from "react-router-dom";
import { Menu, X, LogOut, Sun, Moon } from "lucide-react";
import { useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const navLinks = [
  { label: "Analytics", href: "#analytics" },
  { label: "Features", href: "#features" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

const LandingNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { isLoggedIn, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070B14]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-3xl font-bold tracking-tight text-white">
          Cash<span className="text-blue-500">Flowr</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-slate-300 hover:text-white transition-all duration-300"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="h-11 w-11 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 hover:bg-white/[0.06] transition-all duration-300"
            title={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <Sun size={18} className="text-white" />
            ) : (
              <Moon size={18} className="text-white" />
            )}
          </button>

          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-2xl bg-white text-black font-semibold hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
              >
                Open Dashboard
              </Link>

              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border border-white/10 flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0] || "U"}
              </div>

              <button
                onClick={logout}
                className="h-11 w-11 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                <LogOut size={18} className="text-white" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-2xl text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="px-5 py-2.5 rounded-2xl bg-white text-black font-semibold hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden h-11 w-11 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center cursor-pointer"
        >
          {mobileOpen ? (
            <X size={20} className="text-white" />
          ) : (
            <Menu size={20} className="text-white" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#070B14] px-4 py-5">
          <nav className="space-y-3">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-2xl px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-5 grid gap-3">
            <button
              onClick={toggleTheme}
              className="px-5 py-3 rounded-2xl border border-white/10 text-white flex items-center justify-center gap-2 cursor-pointer"
            >
              {theme === "dark" ? (
                <>
                  <Sun size={18} />
                  Switch to Light Mode
                </>
              ) : (
                <>
                  <Moon size={18} />
                  Switch to Dark Mode
                </>
              )}
            </button>

            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="text-center px-5 py-3 rounded-2xl bg-white text-black font-semibold"
                >
                  Open Dashboard
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="text-center px-5 py-3 rounded-2xl border border-white/10 text-white cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center px-5 py-3 rounded-2xl border border-white/10 text-white"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="text-center px-5 py-3 rounded-2xl bg-white text-black font-semibold"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;