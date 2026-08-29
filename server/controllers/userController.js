import User from "../models/User.js";
import { sendError } from "../middleware/errorMiddleware.js";
import { cleanText, normalizeEmail } from "../utils/validation.js";

const allowedCurrencies = new Set(["USD", "GBP", "EUR", "NGN"]);

export const updateUserSettings = async (req, res) => {
  try {
    const updates = {};

    if (Object.prototype.hasOwnProperty.call(req.body, "firstName")) {
      updates.firstName = cleanText(req.body.firstName, 80);
      if (!updates.firstName) return res.status(400).json({ success: false, message: "First name is required" });
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "lastName")) {
      updates.lastName = cleanText(req.body.lastName, 80);
      if (!updates.lastName) return res.status(400).json({ success: false, message: "Last name is required" });
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "currency")) {
      if (!allowedCurrencies.has(req.body.currency)) {
        return res.status(400).json({ success: false, message: "Unsupported currency selected" });
      }
      updates.currency = req.body.currency;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "avatar")) {
      if (typeof req.body.avatar !== "string" || req.body.avatar.length > 2048) {
        return res.status(400).json({ success: false, message: "Invalid avatar value" });
      }
      updates.avatar = req.body.avatar.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No supported settings to update" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id, status: "active" },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({
      success: true,
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: normalizeEmail(updatedUser.email),
        currency: updatedUser.currency,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    if (error?.name === "ValidationError") return res.status(400).json({ success: false, message: "Invalid settings" });
    return sendError(res, error, req);
  }
};
