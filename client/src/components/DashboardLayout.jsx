// components/DashboardLayout.jsx
import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { fetchTransactions } from "../features/transactions/transactionSlice";
import { fetchBudgets } from "../features/budgets/budgetSlice";
import {
  fetchCategoryBreakdown,
  fetchMonthlyTrend,
  fetchOverview,
} from "../features/summary/summarySlice";

const DashboardLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchBudgets());
    dispatch(fetchCategoryBreakdown({ type: "expense" }));
    dispatch(fetchMonthlyTrend({}));
    dispatch(fetchOverview({}));
  }, [dispatch]);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => !prev);
    setIsAnimating(true);
    clearTimeout(timeoutRef.current);
    // Matches the 300ms width transition duration in Sidebar.jsx — once it's
    // done, blur is safe to re-enable without a visible recompute flash.
    timeoutRef.current = setTimeout(() => setIsAnimating(false), 320);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={isOpen}
        onCloseMobile={() => setIsOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        isAnimating={isAnimating}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 ledger-card mx-4 mt-4">
          <h1 className="font-display text-lg font-semibold text-[rgb(var(--color-ink))]">
            Ledger
          </h1>
          <button
            onClick={() => setIsOpen(true)}
            className="text-[rgb(var(--color-ink))]"
          >
            <Menu size={22} />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 space-y-6 max-w-6xl w-full mx-auto transition-[margin] duration-300 ease-out">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
