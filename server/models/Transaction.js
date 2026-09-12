import mongoose from "mongoose";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "../constants/categories.js";

const transactionSchema = new mongoose.Schema(
  {
    // Every query on this collection MUST filter by user — this is what keeps
    // one person from ever seeing another person's financial data.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // speeds up the "get all transactions for this user" query, which runs constantly
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      // Custom validator instead of a single fixed enum — because the valid
      // category list depends on whether type is 'income' or 'expense'.
      // A plain `enum: [...]` can't express that conditional relationship.
      validate: {
        validator: function (value) {
          const allowed =
            this.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
          return allowed.includes(value);
        },
        message: (props) =>
          `${props.value} is not a valid category for this transaction type`,
      },
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Transaction", transactionSchema);
