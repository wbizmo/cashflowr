import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id,
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    notifications,
  });
};

export const getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user._id,
    read: false,
  });

  res.json({
    success: true,
    count,
  });
};

export const markNotificationAsRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id,
    },
    { read: true },
    { new: true }
  );

  res.json({
    success: true,
    notification,
  });
};

export const markAllNotificationsAsRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id },
    { read: true }
  );

  res.json({
    success: true,
    message: "All notifications marked as read",
  });
};