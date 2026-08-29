import jwt from "jsonwebtoken";
import User from "../models/User.js";

const getBearerToken = (req) => {
  const header = req.headers.authorization;
  if (!header) return null;

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
};

export const protect = async (req, res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
      requestId: req.requestId,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("+tokenVersion");

    if (!user || user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
        requestId: req.requestId,
      });
    }

    const tokenVersion = decoded.tokenVersion ?? 0;
    if (tokenVersion !== (user.tokenVersion ?? 0)) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please sign in again.",
        requestId: req.requestId,
      });
    }

    req.user = user;
    req.auth = { tokenVersion };
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
      requestId: req.requestId,
    });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to perform this action",
      requestId: req.requestId,
    });
  }

  next();
};

export { getBearerToken };
