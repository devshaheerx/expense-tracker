import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';

// Spending by category — e.g. "Food: $450, Transport: $120" for a given month/year.
// This is the exact shape Recharts' pie/bar chart components expect.
export const getCategoryBreakdown = async (userId, { month, year, type = 'expense' }) => {
  const targetYear = year ? Number(year) : new Date().getFullYear();
  const targetMonth = month ? Number(month) - 1 : new Date().getMonth(); // JS months are 0-indexed

  const startDate = new Date(targetYear, targetMonth, 1);
  const endDate = new Date(targetYear, targetMonth + 1, 1); // first day of NEXT month — exclusive upper bound

  const breakdown = await Transaction.aggregate([
    // Stage 1: $match — filters documents BEFORE grouping, same idea as a WHERE clause.
    // Doing this first (not after $group) matters for performance — it shrinks the
    // dataset early instead of grouping everything then discarding most of it.
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        type,
        date: { $gte: startDate, $lt: endDate },
      },
    },
    // Stage 2: $group — bundles documents sharing the same category into one
    // output document per category. _id here defines what we're grouping BY.
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' }, // SQL equivalent: SUM(amount)
        count: { $sum: 1 },          // classic trick: summing 1 per document counts documents
      },
    },
    // Stage 3: $project — reshapes the output. Mongo's default _id field is
    // confusing to consume on the frontend, so rename it to something clearer.
    {
      $project: {
        _id: 0,
        category: '$_id',
        total: 1,
        count: 1,
      },
    },
    // Stage 4: $sort — highest spending category first, nicer for chart legends.
    { $sort: { total: -1 } },
  ]);

  return breakdown;
};

// Income vs expense trend across months in a year — e.g. Jan: {income: 3000, expense: 1800},
// Feb: {income: 3000, expense: 2100}, ... This is what feeds a Recharts line/area chart.
export const getMonthlyTrend = async (userId, { year }) => {
  const targetYear = year ? Number(year) : new Date().getFullYear();
  const startDate = new Date(targetYear, 0, 1);
  const endDate = new Date(targetYear + 1, 0, 1);

  const trend = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lt: endDate },
      },
    },
    // Grouping by TWO things at once — month AND type — using a compound _id.
    // $month is a Mongo date operator that extracts just the month number (1-12) from a date field.
    {
      $group: {
        _id: { month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.month': 1 } },
  ]);

  // The aggregation above gives us awkward separate rows like:
  // { _id: { month: 1, type: 'income' }, total: 3000 }
  // { _id: { month: 1, type: 'expense' }, total: 1800 }
  // We reshape this in JS into one clean object per month — this step is much
  // easier to do here than to force entirely inside the aggregation pipeline.
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const result = monthNames.map((name, index) => ({
    month: name,
    income: 0,
    expense: 0,
  }));

  trend.forEach((entry) => {
    const monthIndex = entry._id.month - 1;
    result[monthIndex][entry._id.type] = entry.total;
  });

  return result;
};

// Simple overview totals — total income, total expense, net balance, for a given month.
// Useful for dashboard summary cards.
export const getOverview = async (userId, { month, year }) => {
  const targetYear = year ? Number(year) : new Date().getFullYear();
  const targetMonth = month ? Number(month) - 1 : new Date().getMonth();

  const startDate = new Date(targetYear, targetMonth, 1);
  const endDate = new Date(targetYear, targetMonth + 1, 1);

  const totals = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  const income = totals.find((t) => t._id === 'income')?.total || 0;
  const expense = totals.find((t) => t._id === 'expense')?.total || 0;

  return { income, expense, balance: income - expense };
};