import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from '../services/transactionService.js';

const handleError = (res, error) => {
  console.error(error.message);
  res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : 'Something went wrong' });
};

export const addTransaction = async (req, res) => {
  try {
    const { transaction, budgetAlert } = await createTransaction(req.user._id, req.body);
    res.status(201).json({ message: 'Transaction created', transaction, budgetAlert });
  } catch (error) {
    handleError(res, error);
  }
};

export const listTransactions = async (req, res) => {
  try {
    const result = await getTransactions(req.user._id, req.query);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const editTransaction = async (req, res) => {
  try {
    const transaction = await updateTransaction(req.user._id, req.params.id, req.body);
    res.status(200).json({ message: 'Transaction updated', transaction });
  } catch (error) {
    handleError(res, error);
  }
};

export const removeTransaction = async (req, res) => {
  try {
    await deleteTransaction(req.user._id, req.params.id);
    res.status(200).json({ message: 'Transaction deleted' });
  } catch (error) {
    handleError(res, error);
  }
};