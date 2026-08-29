import mongoose from "mongoose";

const roundMoney = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round((number + Number.EPSILON) * 100) / 100 : value;
};

const transactionSchema = new mongoose.Schema(
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
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    idempotencyKey: {
      type: String,
      trim: true,
      maxlength: 128,
      select: false,
    },
  },
  { timestamps: true, optimisticConcurrency: true }
);

transactionSchema.index({ user: 1, date: -1, _id: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1, date: -1 });
transactionSchema.index(
  { user: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string" } } }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
