import { useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  ShieldCheck,
  TrendingUp,
  Receipt,
  Wallet,
  CalendarDays,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

const getNotificationIcon = (type) => {
  if (type === "login" || type === "security") return ShieldCheck;
  if (type === "spending_insight") return TrendingUp;
  if (type === "transaction_created") return Receipt;
  if (type === "budget_alert") return Wallet;
  if (type === "monthly_summary") return CalendarDays;

  return Bell;
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications || []);
    } catch (error) {
      console.log("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          read: true,
        }))
      );
    } catch (error) {
      console.log("Failed to mark notifications as read", error);
    }
  };

  const markOneAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                read: true,
              }
            : item
        )
      );
    } catch (error) {
      console.log("Failed to mark notification as read", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] text-sm text-slate-300 mb-5">
              <Bell size={16} className="text-blue-400" />
              Notification Center
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Notifications
            </h1>

            <p className="text-slate-400 mt-3 max-w-2xl">
              Track account activity, spending alerts, budget updates, and
              financial insights generated from your CashFlowr workspace.
            </p>
          </div>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="h-12 px-5 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center gap-2 text-white hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <CheckCheck size={18} />
            Mark all as read
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
            <p className="text-slate-400 text-sm">Total notifications</p>
            <h3 className="text-3xl font-bold text-white mt-3">
              {notifications.length}
            </h3>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
            <p className="text-slate-400 text-sm">Unread updates</p>
            <h3 className="text-3xl font-bold text-white mt-3">
              {unreadCount}
            </h3>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
            <p className="text-slate-400 text-sm">Status</p>
            <h3 className="text-3xl font-bold text-white mt-3">
              {unreadCount > 0 ? "Action needed" : "All clear"}
            </h3>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Recent activity
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Finance alerts and account notifications appear here.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 rounded-3xl bg-white/[0.03] border border-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-20 w-20 mx-auto rounded-[28px] bg-blue-500/10 flex items-center justify-center">
                <Bell className="text-blue-400" size={32} />
              </div>

              <h3 className="text-white text-2xl font-semibold mt-6">
                No notifications yet
              </h3>

              <p className="text-slate-400 mt-3 max-w-md mx-auto leading-relaxed">
                Login alerts, transaction updates, budget warnings, and
                spending insights will appear here once your account activity
                begins.
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);

                return (
                  <button
                    key={notification._id}
                    onClick={() => markOneAsRead(notification._id)}
                    className={`w-full text-left p-6 border-b border-white/5 transition-all cursor-pointer hover:bg-white/[0.03] ${
                      notification.read ? "bg-transparent" : "bg-blue-500/5"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          notification.read
                            ? "bg-white/[0.03]"
                            : "bg-blue-500/10"
                        }`}
                      >
                        <Icon
                          size={19}
                          className={
                            notification.read
                              ? "text-slate-400"
                              : "text-blue-400"
                          }
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <h3 className="text-white font-semibold">
                            {notification.title}
                          </h3>

                          {!notification.read && (
                            <span className="w-fit rounded-full bg-blue-500/10 text-blue-400 text-xs px-3 py-1">
                              New
                            </span>
                          )}
                        </div>

                        <p className="text-slate-400 mt-2 leading-relaxed">
                          {notification.message}
                        </p>

                        <p className="text-slate-600 text-xs mt-3">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;