import bcrypt from "bcryptjs";

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { validateLogin, validateRegistration } from "../utils/validation.js";
import { sendError } from "../middleware/errorMiddleware.js";

const publicUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  currency: user.currency,
  avatar: user.avatar,
  role: user.role,
});

export const registerUser = async (req, res) => {
  try {
    const validation = validateRegistration(req.body || {});
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0],
        errors: validation.errors,
        requestId: req.requestId,
      });
    }

    const { firstName, lastName, email, password } = validation.value;
    const userExists = await User.exists({ email });

    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
        requestId: req.requestId,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ firstName, lastName, email, password: hashedPassword });

    return res.status(201).json({
      success: true,
      token: generateToken(user._id, user.tokenVersion || 0),
      user: publicUser(user),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
        requestId: req.requestId,
      });
    }
    return sendError(res, error, req);
  }
};

export const loginUser = async (req, res) => {
  try {
    const validation = validateLogin(req.body || {});
    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        requestId: req.requestId,
      });
    }

    const { email, password } = validation.value;
    const user = await User.findOne({ email }).select("+password +tokenVersion");
    const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !passwordMatches || user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        requestId: req.requestId,
      });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateModifiedOnly: true });

    return res.json({
      success: true,
      token: generateToken(user._id, user.tokenVersion || 0),
      user: publicUser(user),
    });
  } catch (error) {
    return sendError(res, error, req);
  }
};

export const logoutUser = async (req, res) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
    return res.json({ success: true, message: "Signed out successfully" });
  } catch (error) {
    return sendError(res, error, req);
  }
};

export const getCurrentUser = async (req, res) => {
  return res.json({ success: true, user: publicUser(req.user) });
};

export { publicUser };
