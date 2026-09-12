// models/Budget.js
import mongoose from "mongoose";
import { EXPENSE_CATEGORIES } from "../constants/categories.js";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: EXPENSE_CATEGORIES, // budgets are only meaningful for expenses, not income
      required: true,
    },
    limit: {
      type: Number,
      required: true,
      min: [0.01, "Limit must be greater than 0"],
    },
    period: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
  },
  { timestamps: true },
);

// One budget per category+period per user — prevents accidentally creating
// two conflicting "Food" budgets for the same user.
budgetSchema.index({ user: 1, category: 1, period: 1 }, { unique: true });

export default mongoose.model("Budget", budgetSchema);
