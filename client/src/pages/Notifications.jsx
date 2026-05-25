import { useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  Circle,
  Wallet,
  RefreshCw,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import ConfirmModal from "../components/common/ConfirmModal";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatMoney } from "../utils/formatCurrency";

const Notifications = () => {
  const { user } = useAuth();
  const currency = user?.currency || "USD";

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorModal, setErrorModal] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/notifications");

      setNotifications(data.notifications || []);
    } catch (error) {
      setErrorModal(
        error.response?.data?.message || "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      setErrorModal(
        error.response?.data?.message || "Failed to mark notifications as read."
      );
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Notifications
            </h1>

            <p className="text-slate-400 mt-3">
              Track account activity, finance updates, and CashFlowr insights.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={fetchNotifications}
              className="h-12 px-5 rounded-2xl border border-white/10 bg-white/[0.03] text-white flex items-center justify-center gap-2 hover:bg-white/[0.06] cursor-pointer"
            >
              <RefreshCw size={18} />
              Refresh
            </button>

            <button
              onClick={markAllAsRead}
              className="h-12 px-5 rounded-2xl bg-white text-black font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <CheckCheck size={18} />
              Mark all read
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <SummaryCard title="Total Notifications" value={notifications.length} />
          <SummaryCard title="Unread" value={unreadCount} />
          <SummaryCard
            title="Read"
            value={notifications.length - unreadCount}
          />
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Notification Center
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                Latest updates from your financial workspace.
              </p>
            </div>

            <Bell className="text-blue-400" size={24} />
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 rounded-3xl border border-white/10 bg-white/[0.03] animate-pulse"
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

              <p className="text-slate-400 mt-3">
                Activity alerts and financial insights will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notification) => {
                const amount = notification.metadata?.amount;
                const transactionType =
                  notification.metadata?.transactionType ||
                  notification.metadata?.type;

                return (
                  <div
                    key={notification._id}
                    className={`p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 ${
                      notification.read ? "bg-transparent" : "bg-blue-500/5"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                        {notification.read ? (
                          <Bell className="text-blue-400" size={20} />
                        ) : (
                          <Circle className="text-blue-400 fill-blue-400" size={16} />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-white font-semibold">
                            {notification.title}
                          </h3>

                          {!notification.read && (
                            <span className="text-[11px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              New
                            </span>
                          )}
                        </div>

                        <p className="text-slate-400 mt-1 leading-relaxed">
                          {notification.message}
                        </p>

                        {amount !== undefined && amount !== null && (
                          <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                            <Wallet
                              size={16}
                              className={
                                transactionType === "income"
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }
                            />

                            <span
                              className={`font-semibold ${
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
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={Boolean(errorModal)}
        title="Something went wrong"
        message={errorModal || ""}
        confirmText="Close"
        onClose={() => setErrorModal(null)}
        onConfirm={() => setErrorModal(null)}
      />
    </DashboardLayout>
  );
};

const SummaryCard = ({ title, value }) => {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
      <p className="text-slate-400 text-sm">{title}</p>

      <h3 className="text-3xl font-bold text-white mt-3">{value}</h3>
    </div>
  );
};

export default Notifications;