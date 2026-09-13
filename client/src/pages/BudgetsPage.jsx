// pages/BudgetsPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { addBudget, deleteBudget } from "../features/budgets/budgetSlice";
import { fetchBudgetVsActual } from "../features/summary/summarySlice";
import { EXPENSE_CATEGORIES } from "../constants/categories";
import BudgetComparisonChart from "../components/BudgetComparisonChart";

const BudgetsPage = () => {
  const dispatch = useDispatch();
  const { items: budgets } = useSelector((state) => state.budgets);
  const { budgetVsActual } = useSelector((state) => state.summary);

  const [form, setForm] = useState({ category: "Food", limit: "" });

  useEffect(() => {
    dispatch(fetchBudgetVsActual());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      addBudget({ ...form, limit: Number(form.limit) }),
    );
    if (addBudget.fulfilled.match(result)) {
      toast.success("Budget created");
      setForm({ ...form, limit: "" });
      dispatch(fetchBudgetVsActual());
    } else {
      toast.error(result.payload || "Failed to add budget");
    }
  };

  const handleDelete = async (id) => {
    const result = await dispatch(deleteBudget(id));
    if (deleteBudget.fulfilled.match(result)) {
      toast.success("Budget removed");
      dispatch(fetchBudgetVsActual());
    } else {
      toast.error(result.payload || "Failed to remove budget");
    }
  };

  return (
    <div className="animate-rise">
      <h1 className="font-display text-2xl font-semibold text-[rgb(var(--color-ink))] mb-1">
        Budgets
      </h1>
      <p className="text-sm opacity-60 mb-5 text-[rgb(var(--color-ink))]">
        Set a monthly limit per category, and see exactly how this month's
        spending measures up against it.
      </p>

      <div className="ledger-card p-6 mb-6">
        <h2 className="font-display text-lg font-semibold text-[rgb(var(--color-ink))] mb-1">
          Limit vs actual, every category
        </h2>
        <p className="text-xs opacity-60 mb-4 text-[rgb(var(--color-ink))]">
          Each budget's limit next to what you've actually spent so far this
          month — a shorter red bar than blue means you're under budget.
        </p>
        <BudgetComparisonChart data={budgetVsActual} />
      </div>

      <div className="grid md:grid-cols-[320px_1fr] gap-6 items-start">
        <div className="ledger-card p-6">
          <h3 className="font-semibold mb-3 text-[rgb(var(--color-ink))]">
            Create budget
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Monthly limit"
              value={form.limit}
              onChange={(e) => setForm({ ...form, limit: e.target.value })}
              required
              className="input-field font-mono-amount"
            />
            <button type="submit" className="btn-primary w-full">
              Create
            </button>
          </form>
        </div>

        <div className="ledger-card p-6">
          <h3 className="font-semibold mb-3 text-[rgb(var(--color-ink))]">
            Your budgets
          </h3>
          {budgets.length === 0 && (
            <p className="text-sm opacity-60 text-[rgb(var(--color-ink))]">
              No budgets set yet.
            </p>
          )}
          <ul>
            {budgets.map((b) => (
              <li
                key={b._id}
                className="ledger-divider flex items-center justify-between py-3"
              >
                <span className="text-sm font-medium text-[rgb(var(--color-ink))]">
                  {b.category}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono-amount text-sm text-[rgb(var(--color-ink))]">
                    {b.limit.toFixed(2)} / {b.period}
                  </span>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="opacity-40 hover:opacity-100 hover:text-[rgb(var(--color-expense))] text-[rgb(var(--color-ink))]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BudgetsPage;
