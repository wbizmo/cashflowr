import mongoose from "mongoose";

const roundMoney = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round((number + Number.EPSILON) * 100) / 100 : value;
};

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 120,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0.01,
      set: roundMoney,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
      set: roundMoney,
    },
    targetDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
    color: {
      type: String,
      default: "#3B82F6",
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true, optimisticConcurrency: true }
);

goalSchema.index({ user: 1, status: 1, targetDate: 1 });
goalSchema.index({ user: 1, createdAt: -1 });

const Goal = mongoose.model("Goal", goalSchema);
export default Goal;
