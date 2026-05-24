import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    color: {
      type: String,
      default: "#3B82F6",
    },

    icon: {
      type: String,
      default: "Wallet",
    },
  },
  { timestamps: true }
);

categorySchema.index(
  { user: 1, name: 1, type: 1 },
  { unique: true }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;