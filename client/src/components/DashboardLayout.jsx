// components/DashboardLayout.jsx
import { useEffect, useState } from "react";
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
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchBudgets());
    dispatch(fetchCategoryBreakdown({ type: "expense" }));
    dispatch(fetchMonthlyTrend({}));
    dispatch(fetchOverview({}));
  }, [dispatch]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={isOpen}
        onCloseMobile={() => setIsOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
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

        {/* Scales from a tight mobile gutter up to a generous, centered
            reading width on ultra-wide monitors, instead of one fixed size. */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 space-y-6 max-w-6xl 2xl:max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
