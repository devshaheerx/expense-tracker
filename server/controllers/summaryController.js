// controllers/summaryController.js
import {
  getCategoryBreakdown,
  getMonthlyTrend,
  getOverview,
  getCategoryTrend,
  getBudgetVsActual,
} from "../services/summaryService.js";

const handleError = (res, error) => {
  console.error(error.message);
  res
    .status(error.statusCode || 500)
    .json({
      message: error.statusCode ? error.message : "Something went wrong",
    });
};

export const categoryBreakdown = async (req, res) => {
  try {
    const data = await getCategoryBreakdown(req.user._id, req.query);
    res.status(200).json({ breakdown: data });
  } catch (error) {
    handleError(res, error);
  }
};

export const monthlyTrend = async (req, res) => {
  try {
    const data = await getMonthlyTrend(req.user._id, req.query);
    res.status(200).json({ trend: data });
  } catch (error) {
    handleError(res, error);
  }
};

export const overview = async (req, res) => {
  try {
    const data = await getOverview(req.user._id, req.query);
    res.status(200).json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const categoryTrend = async (req, res) => {
  try {
    const data = await getCategoryTrend(req.user._id, req.query);
    res.status(200).json({ trend: data });
  } catch (error) {
    handleError(res, error);
  }
};

export const budgetVsActual = async (req, res) => {
  try {
    const data = await getBudgetVsActual(req.user._id);
    res.status(200).json({ data });
  } catch (error) {
    handleError(res, error);
  }
};
