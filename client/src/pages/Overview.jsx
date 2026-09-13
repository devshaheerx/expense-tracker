// pages/Overview.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategoryBreakdown,
  fetchMonthlyTrend,
} from "../features/summary/summarySlice";
import CategoryPieChart from "../components/CategoryPieChart";
import TrendLineChart from "../components/TrendLineChart";
import OverviewCards from "../components/OverviewCards";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1];

const Overview = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { breakdown, trend, overview } = useSelector((state) => state.summary);

  const [breakdownType, setBreakdownType] = useState("expense");
  const [trendYear, setTrendYear] = useState(CURRENT_YEAR);

  useEffect(() => {
    dispatch(fetchCategoryBreakdown({ type: breakdownType }));
  }, [breakdownType, dispatch]);

  useEffect(() => {
    dispatch(fetchMonthlyTrend({ year: trendYear }));
  }, [trendYear, dispatch]);

  return (
    <div className="animate-rise">
      <h1 className="font-display text-xl sm:text-2xl font-semibold text-[rgb(var(--color-ink))] mb-1">
        Welcome, {user?.name}
      </h1>
      <p className="text-sm opacity-60 mb-5 text-[rgb(var(--color-ink))]">
        Here's where things stand this month.
      </p>

      <OverviewCards overview={overview} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="ledger-card p-4 sm:p-6 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="font-display text-base sm:text-lg font-semibold text-[rgb(var(--color-ink))]">
              Spending by category
            </h2>
            <select
              value={breakdownType}
              onChange={(e) => setBreakdownType(e.target.value)}
              className="input-field w-auto text-sm py-1.5"
            >
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>
          </div>
          <CategoryPieChart data={breakdown} />
        </div>

        <div className="ledger-card p-4 sm:p-6 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="font-display text-base sm:text-lg font-semibold text-[rgb(var(--color-ink))]">
              Income vs expense
            </h2>
            <select
              value={trendYear}
              onChange={(e) => setTrendYear(Number(e.target.value))}
              className="input-field w-auto text-sm py-1.5"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <TrendLineChart data={trend} />
        </div>
      </div>
    </div>
  );
};

export default Overview;
