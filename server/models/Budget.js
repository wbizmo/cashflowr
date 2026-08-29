import mongoose from "mongoose";

const roundMoney = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round((number + Number.EPSILON) * 100) / 100 : value;
};

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
      set: roundMoney,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 1970,
      max: 2200,
    },
  },
  { timestamps: true, optimisticConcurrency: true }
);

budgetSchema.index({ user: 1, month: 1, year: 1 });
budgetSchema.index(
  { user: 1, category: 1, month: 1, year: 1 },
  { unique: true }
);

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
