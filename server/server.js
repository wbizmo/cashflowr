import dotenv from "dotenv";
import mongoose from "mongoose";

import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
let server;

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully.`);
  if (server) {
    server.close(async () => {
      await mongoose.connection.close(false);
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  } else {
    await mongoose.connection.close(false).catch(() => {});
    process.exit(0);
  }
};

const start = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }

  await connectDB();
  server = app.listen(PORT, () => {
    console.log(`CashFlowr API listening on port ${PORT}`);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection", error);
  shutdown("unhandledRejection");
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception", error);
  shutdown("uncaughtException");
});

start().catch((error) => {
  console.error("Failed to start CashFlowr API", error);
  process.exit(1);
});
