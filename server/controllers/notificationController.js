import Notification from "../models/Notification.js";
import { sendError } from "../middleware/errorMiddleware.js";
import { isValidId, paginationMeta, parsePagination } from "../utils/request.js";

export const getNotifications = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, { limit: 20, maxLimit: 100 });
    const filter = { user: req.user._id };
    if (req.query.unread === "true") filter.read = false;

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      notifications,
      pagination: paginationMeta({ page, limit, total }),
    });
  } catch (error) {
    return sendError(res, error, req);
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.user._id, read: false });
    return res.json({ success: true, count });
  } catch (error) {
    return sendError(res, error, req);
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false, message: "Notification not found" });
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    return res.json({ success: true, notification });
  } catch (error) {
    return sendError(res, error, req);
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );

    return res.json({
      success: true,
      message: "All notifications marked as read",
      updated: result.modifiedCount,
    });
  } catch (error) {
    return sendError(res, error, req);
  }
};
