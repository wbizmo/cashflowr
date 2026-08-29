import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import recurringRoutes from "./routes/recurringRoutes.js";
import {
  apiRateLimiter,
  requestContext,
  securityHeaders,
} from "./middleware/securityMiddleware.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(requestContext);
app.use(securityHeaders);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(Object.assign(new Error("Origin not allowed by CORS"), { statusCode: 403 }));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key", "If-Match", "X-Request-Id"],
    exposedHeaders: ["X-Request-Id", "Idempotent-Replayed"],
  })
);
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: false, limit: "64kb" }));
app.use("/api", apiRateLimiter);

app.get("/", (req, res) => {
  res.json({ success: true, message: "CashFlowr API Running", requestId: req.requestId });
});

app.get("/health", (req, res) => {
  res.json({ success: true, status: "ok", requestId: req.requestId });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/recurring", recurringRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
