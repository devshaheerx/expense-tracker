import { createBudget, getBudgets, updateBudget, deleteBudget } from '../services/budgetService.js';

const handleError = (res, error) => {
  console.error(error.message);
  res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : 'Something went wrong' });
};

export const addBudget = async (req, res) => {
  try {
    const budget = await createBudget(req.user._id, req.body);
    res.status(201).json({ message: 'Budget created', budget });
  } catch (error) {
    handleError(res, error);
  }
};

export const listBudgets = async (req, res) => {
  try {
    const budgets = await getBudgets(req.user._id);
    res.status(200).json({ budgets });
  } catch (error) {
    handleError(res, error);
  }
};

export const editBudget = async (req, res) => {
  try {
    const budget = await updateBudget(req.user._id, req.params.id, req.body);
    res.status(200).json({ message: 'Budget updated', budget });
  } catch (error) {
    handleError(res, error);
  }
};

export const removeBudget = async (req, res) => {
  try {
    await deleteBudget(req.user._id, req.params.id);
    res.status(200).json({ message: 'Budget deleted' });
  } catch (error) {
    handleError(res, error);
  }
};