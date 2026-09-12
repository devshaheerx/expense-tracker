import { getCategoryBreakdown, getMonthlyTrend, getOverview } from '../services/summaryService.js';

const handleError = (res, error) => {
  console.error(error.message);
  res.status(500).json({ message: 'Something went wrong' });
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