import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 80,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: {
      type: String,
      required: true,
      minlength: 10,
      select: false,
    },
    currency: {
      type: String,
      enum: ["USD", "GBP", "EUR", "NGN"],
      default: "USD",
    },
    avatar: {
      type: String,
      default: "",
      maxlength: 2048,
    },
    role: {
      type: String,
      enum: ["user", "support", "admin"],
      default: "user",
      immutable: true,
    },
    status: {
      type: String,
      enum: ["active", "disabled", "locked"],
      default: "active",
    },
    tokenVersion: {
      type: Number,
      default: 0,
      min: 0,
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.index({ status: 1 });

const User = mongoose.model("User", userSchema);

export default User;
