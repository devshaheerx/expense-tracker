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
      <h1 className="font-display text-2xl font-semibold text-[rgb(var(--color-ink))] mb-1">
        Welcome, {user?.name}
      </h1>
      <p className="text-sm opacity-60 mb-5 text-[rgb(var(--color-ink))]">
        A snapshot of your money this month — what's coming in, what's going
        out, and where it's going.
      </p>

      <OverviewCards overview={overview} />

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="ledger-card p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display text-lg font-semibold text-[rgb(var(--color-ink))]">
              Where it's split by category
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
          <p className="text-xs opacity-60 mb-4 text-[rgb(var(--color-ink))]">
            Every {breakdownType} this month, added up per category, so you can
            see at a glance what takes the biggest share.
          </p>
          <CategoryPieChart data={breakdown} />
        </div>

        <div className="ledger-card p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display text-lg font-semibold text-[rgb(var(--color-ink))]">
              Income vs expense, month by month
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
          <p className="text-xs opacity-60 mb-4 text-[rgb(var(--color-ink))]">
            Both totals for each month of {trendYear}, side by side, so you can
            spot which months you saved and which ran hot.
          </p>
          <TrendLineChart data={trend} />
        </div>
      </div>
    </div>
  );
};

export default Overview;
