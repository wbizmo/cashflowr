import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
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
      maxlength: 80,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    color: {
      type: String,
      default: "#3B82F6",
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    icon: {
      type: String,
      default: "Wallet",
      maxlength: 80,
    },
  },
  { timestamps: true, optimisticConcurrency: true }
);

categorySchema.index({ user: 1, type: 1, name: 1 });
categorySchema.index(
  { user: 1, name: 1, type: 1 },
  { unique: true }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
