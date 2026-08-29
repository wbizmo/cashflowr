import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, LogOut, Menu, Moon, Plus, Sun } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getNavigationItem } from "../../config/navigation";
import api from "../../services/api";
import { cleanNotificationMessage } from "../../utils/formatCurrency";

const Navbar = () => {
  const { setMobileSidebarOpen } = useUI();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const current = useMemo(() => getNavigationItem(location.pathname), [location.pathname]);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get("/notifications/unread-count");
      setUnreadCount(data.count || 0);
    } catch {
      // A global 401 handler owns session expiry. Notification failure should not block the shell.
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const { data } = await api.get("/notifications", { params: { limit: 6 } });
      setNotifications(data.notifications || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    setNotificationsOpen(false);
  }, [location.pathname]);

  const handleBellClick = async () => {
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);
    if (nextOpen) await fetchNotifications();
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      setUnreadCount(0);
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    } catch {
      // Keep the existing state when the request fails.
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate("/", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-[#070B14]/90 backdrop-blur-xl flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden icon-button shrink-0"
        >
          <Menu size={19} />
        </button>
        <div className="min-w-0">
          <h2 className="text-sm md:text-base font-semibold text-white truncate">{current?.name || "CashFlowr"}</h2>
          <p className="text-xs text-slate-500 hidden sm:block truncate">
            {current?.path === "/dashboard" ? `Welcome back, ${user?.firstName || "there"}` : "Your personal finance workspace"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 relative shrink-0">
        {location.pathname !== "/transactions" && (
          <Link
            to="/transactions?new=1"
            className="hidden md:inline-flex h-9 items-center gap-2 rounded-xl bg-blue-500 px-3.5 text-sm font-semibold text-white hover:bg-blue-400"
          >
            <Plus size={16} /> New transaction
          </Link>
        )}

        <button type="button" onClick={toggleTheme} className="icon-button" aria-label="Toggle color theme">
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button type="button" onClick={handleBellClick} className="icon-button relative" aria-label="Open notifications" aria-expanded={notificationsOpen}>
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] leading-none flex items-center justify-center border border-[#070B14]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {notificationsOpen && (
          <div className="absolute right-0 top-12 w-[380px] max-w-[calc(100vw-2rem)] finance-panel shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm text-white font-semibold">Notifications</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Latest account activity</p>
              </div>
              <button type="button" onClick={markAllAsRead} className="icon-button h-9 w-9" aria-label="Mark all notifications as read">
                <CheckCheck size={15} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loadingNotifications ? (
                <div className="p-5 text-slate-500 text-sm">Loading…</div>
              ) : notifications.length === 0 ? (
                <div className="p-5 text-slate-500 text-sm">You’re all caught up.</div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification._id} className={`p-4 border-b border-white/5 ${notification.read ? "" : "bg-blue-500/[0.06]"}`}>
                    <div className="flex items-start gap-3">
                      <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${notification.read ? "bg-slate-700" : "bg-blue-400"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{notification.title}</p>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                          {cleanNotificationMessage(notification.message)}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link to="/notifications" className="block p-3.5 text-center text-xs font-medium text-blue-400 hover:text-blue-300">
              View notification center
            </Link>
          </div>
        )}

        <div className="hidden sm:flex h-9 w-9 rounded-xl bg-blue-500/15 border border-blue-500/20 items-center justify-center text-blue-300 text-sm font-bold">
          {user?.firstName?.[0]?.toUpperCase() || "U"}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="icon-button disabled:opacity-50"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
