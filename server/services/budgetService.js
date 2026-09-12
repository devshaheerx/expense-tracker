import Budget from '../models/Budget.js';
import { EXPENSE_CATEGORIES } from '../constants/categories.js';

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const createBudget = async (userId, { category, limit, period }) => {
  if (!category || limit === undefined) {
    throw new AppError('Category and limit are required', 400);
  }

  if (!EXPENSE_CATEGORIES.includes(category)) {
    throw new AppError('Invalid category', 400);
  }

  try {
    const budget = await Budget.create({
      user: userId,
      category,
      limit,
      period: period || 'monthly',
    });
    return budget;
  } catch (error) {
    // Mongo's duplicate key error code — thrown by our unique compound index
    // (user + category + period) when one already exists.
    if (error.code === 11000) {
      throw new AppError('A budget for this category and period already exists', 409);
    }
    throw error;
  }
};

export const getBudgets = async (userId) => {
  return Budget.find({ user: userId }).sort({ category: 1 });
};

export const updateBudget = async (userId, budgetId, updates) => {
  const budget = await Budget.findOne({ _id: budgetId, user: userId });

  if (!budget) {
    throw new AppError('Budget not found', 404);
  }

  if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
    throw new AppError('No update data provided', 400);
  }

  if (updates.limit !== undefined) budget.limit = updates.limit;
  if (updates.period !== undefined) budget.period = updates.period;

  await budget.save();
  return budget;
};

export const deleteBudget = async (userId, budgetId) => {
  const budget = await Budget.findOneAndDelete({ _id: budgetId, user: userId });

  if (!budget) {
    throw new AppError('Budget not found', 404);
  }

  return budget;
};

export { AppError };