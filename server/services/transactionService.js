import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "../constants/categories.js";

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const createTransaction = async (
  userId,
  { type, category, amount, description, date },
) => {
  if (!type || !category || amount === undefined) {
    throw new AppError("Type, category, and amount are required", 400);
  }

  if (!["income", "expense"].includes(type)) {
    throw new AppError("Type must be income or expense", 400);
  }

  const validCategories =
    type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  if (!validCategories.includes(category)) {
    throw new AppError(`Invalid category for ${type}`, 400);
  }

  const transaction = await Transaction.create({
    user: userId,
    type,
    category,
    amount,
    description,
    date: date || Date.now(),
  });

  // Budget alert check — only relevant for expenses, since budgets don't apply to income.
  let budgetAlert = null;
  if (type === "expense") {
    budgetAlert = await checkBudgetAlert(userId, category);
  }

  return { transaction, budgetAlert };
};

// Compares this month's total spend in a category against that category's budget limit.
// Returns null if no budget is set for this category, or if spend is still under the limit.
export const checkBudgetAlert = async (userId, category) => {
  const budget = await Budget.findOne({
    user: userId,
    category,
    period: "monthly",
  });
  if (!budget) return null;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const result = await Transaction.aggregate([
    {
      $match: {
        user: budget.user,
        type: "expense",
        category,
        date: { $gte: startOfMonth },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalSpent = result[0]?.total || 0;

  if (totalSpent > budget.limit) {
    return {
      category,
      limit: budget.limit,
      spent: totalSpent,
      exceeded: true,
      message: `You've exceeded your ${category} budget of ${budget.limit} — currently at ${totalSpent}`,
    };
  }

  // Also useful: warn when close to the limit, not just after crossing it.
  if (totalSpent >= budget.limit * 0.8) {
    return {
      category,
      limit: budget.limit,
      spent: totalSpent,
      exceeded: false,
      message: `You're at ${Math.round((totalSpent / budget.limit) * 100)}% of your ${category} budget`,
    };
  }

  return null;
};

export const getTransactions = async (
  userId,
  { type, category, startDate, endDate, page = 1, limit = 20 },
) => {
  const filter = { user: userId };
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const updateTransaction = async (userId, transactionId, updates) => {
  const transaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
  });

  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  // Guard against a missing/malformed body instead of crashing with a raw TypeError.
  if (
    !updates ||
    typeof updates !== "object" ||
    Object.keys(updates).length === 0
  ) {
    throw new AppError("No update data provided", 400);
  }

  const allowedFields = ["type", "category", "amount", "description", "date"];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) transaction[field] = updates[field];
  });

  await transaction.save();
  return transaction;
};

export const deleteTransaction = async (userId, transactionId) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    user: userId,
  });

  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  return transaction;
};

export { AppError };
