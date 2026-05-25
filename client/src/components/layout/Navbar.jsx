import { useEffect, useState } from "react";
import {
  Bell,
  LogOut,
  Menu,
  Search,
  CheckCheck,
  Sun,
  Moon,
  Wallet,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

import api from "../../services/api";
import { formatMoney } from "../../utils/formatCurrency";

const Navbar = () => {
  const { setMobileSidebarOpen } = useUI();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const currency = user?.currency || "USD";

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications || []);
    } catch (error) {
      console.log("Failed to fetch notifications", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get("/notifications/unread-count");
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.log("Failed to fetch unread count", error);
    }
  };

  const handleBellClick = async () => {
    setNotificationsOpen((prev) => !prev);

    if (!notificationsOpen) {
      await fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");

      setUnreadCount(0);

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          read: true,
        }))
      );
    } catch (error) {
      console.log("Failed to mark notifications", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  return (
    <header className="sticky top-0 z-30 h-20 border-b border-white/10 bg-[#070B14]/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden h-11 w-11 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <Menu size={20} className="text-white" />
        </button>

        <div>
          <h2 className="text-xl font-semibold text-white">Dashboard</h2>

          <p className="text-sm text-slate-400 hidden md:block">
            Welcome back, {user?.firstName || "User"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 relative">
        <div className="hidden md:flex items-center gap-2 px-4 h-11 rounded-xl border border-white/10 bg-white/[0.03] transition-all duration-300 focus-within:border-blue-500/40 focus-within:bg-white/[0.05]">
          <Search size={18} className="text-slate-400" />

          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
          />
        </div>

        <button
          onClick={toggleTheme}
          className="h-11 w-11 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 hover:bg-white/[0.06] transition-all duration-300"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <Sun size={18} className="text-white" />
          ) : (
            <Moon size={18} className="text-white" />
          )}
        </button>

        <button
          onClick={handleBellClick}
          className="relative h-11 w-11 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 hover:bg-white/[0.06] transition-all duration-300"
        >
          <Bell size={18} className="text-white" />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center border border-[#070B14]">
              {unreadCount}
            </span>
          )}
        </button>

        {notificationsOpen && (
          <div className="absolute right-0 top-14 w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl border border-white/10 bg-[#0B1120] shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Notifications</h3>

                <p className="text-xs text-slate-500 mt-1">
                  Latest account and finance updates
                </p>
              </div>

              <button
                onClick={markAllAsRead}
                className="h-9 w-9 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-white/[0.06] cursor-pointer"
              >
                <CheckCheck size={16} className="text-slate-300" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loadingNotifications ? (
                <div className="p-5 text-slate-400 text-sm">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-5 text-slate-400 text-sm">
                  No notifications yet.
                </div>
              ) : (
                notifications.slice(0, 5).map((notification) => {
                  const amount = notification.metadata?.amount;
                  const transactionType =
                    notification.metadata?.transactionType ||
                    notification.metadata?.type;

                  return (
                    <div
                      key={notification._id}
                      className={`p-5 border-b border-white/5 ${
                        notification.read ? "bg-transparent" : "bg-blue-500/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-white text-sm font-medium">
                            {notification.title}
                          </p>

                          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>

                        {!notification.read && (
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-400 shrink-0" />
                        )}
                      </div>

                      {amount !== undefined && amount !== null && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                          <Wallet
                            size={15}
                            className={
                              transactionType === "income"
                                ? "text-emerald-400"
                                : "text-red-400"
                            }
                          />

                          <span
                            className={`text-xs font-semibold ${
                              transactionType === "income"
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {transactionType === "income" ? "+" : "-"}
                            {formatMoney(amount, currency)}
                          </span>
                        </div>
                      )}

                      <p className="text-slate-600 text-xs mt-3">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <Link
              to="/notifications"
              onClick={() => setNotificationsOpen(false)}
              className="block p-4 text-center text-sm text-blue-400 hover:text-blue-300 border-t border-white/10"
            >
              View all notifications
            </Link>
          </div>
        )}

        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border border-white/10 flex items-center justify-center text-white font-semibold">
          {user?.firstName?.[0] || "U"}
        </div>

        <button
          onClick={handleLogout}
          className="h-11 px-4 rounded-xl border border-white/10 bg-white/[0.03] flex items-center gap-2 text-white text-sm cursor-pointer hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300"
        >
          <LogOut size={17} />

          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;