import mongoose from "mongoose";

const roundMoney = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round((number + Number.EPSILON) * 100) / 100 : value;
};

const recurringSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 160,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
      set: roundMoney,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    frequency: {
      type: String,
      enum: ["weekly", "monthly", "quarterly", "yearly"],
      required: true,
    },
    nextDueDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
    },
    lastPostedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, optimisticConcurrency: true }
);

recurringSchema.index({ user: 1, status: 1, nextDueDate: 1 });
recurringSchema.index({ user: 1, createdAt: -1 });

const Recurring = mongoose.model("Recurring", recurringSchema);
export default Recurring;
