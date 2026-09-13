// pages/TransactionsPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";
import {
  addTransaction,
  deleteTransaction,
} from "../features/transactions/transactionSlice";
import {
  fetchCategoryBreakdown,
  fetchMonthlyTrend,
  fetchOverview,
  fetchCategoryTrend,
} from "../features/summary/summarySlice";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../constants/categories";
import CategoryBarChart from "../components/CategoryBarChart";

const ALL_CATEGORIES = [
  ...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]),
];

const TransactionsPage = () => {
  const dispatch = useDispatch();
  const { items: transactions } = useSelector((state) => state.transactions);
  const { categoryTrend } = useSelector((state) => state.summary);

  const [form, setForm] = useState({
    type: "expense",
    category: "Food",
    amount: "",
    description: "",
  });
  const [chartCategory, setChartCategory] = useState("Food");

  useEffect(() => {
    dispatch(fetchCategoryTrend({ category: chartCategory, months: 6 }));
  }, [chartCategory, dispatch]);

  const refreshSummaries = () => {
    dispatch(fetchCategoryBreakdown({ type: "expense" }));
    dispatch(fetchMonthlyTrend({}));
    dispatch(fetchOverview({}));
    dispatch(fetchCategoryTrend({ category: chartCategory, months: 6 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      addTransaction({ ...form, amount: Number(form.amount) }),
    );
    if (addTransaction.fulfilled.match(result)) {
      toast.success("Transaction added");
      setForm({ ...form, amount: "", description: "" });
      refreshSummaries();
      if (result.payload.budgetAlert) {
        toast(result.payload.budgetAlert.message, {
          icon: result.payload.budgetAlert.exceeded ? "⚠️" : "ℹ️",
        });
      }
    } else {
      toast.error(result.payload || "Failed to add transaction");
    }
  };

  const handleDelete = async (id) => {
    const result = await dispatch(deleteTransaction(id));
    if (deleteTransaction.fulfilled.match(result)) {
      toast.success("Transaction deleted");
      refreshSummaries();
    } else {
      toast.error(result.payload || "Failed to delete transaction");
    }
  };

  const categoryOptions =
    form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="animate-rise">
      <h1 className="font-display text-2xl font-semibold text-[rgb(var(--color-ink))] mb-1">
        Transactions
      </h1>
      <p className="text-sm opacity-60 mb-5 text-[rgb(var(--color-ink))]">
        Log what comes in and goes out, and see how any single category has
        moved over recent months.
      </p>

      <div className="ledger-card p-6 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg font-semibold text-[rgb(var(--color-ink))]">
            One category, over time
          </h2>
          <select
            value={chartCategory}
            onChange={(e) => setChartCategory(e.target.value)}
            className="input-field w-auto text-sm py-1.5"
          >
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs opacity-60 mb-4 text-[rgb(var(--color-ink))]">
          The last 6 months of {chartCategory}, totaled month by month — useful
          for spotting whether this category is creeping up or settling down.
        </p>
        <CategoryBarChart data={categoryTrend} color="#dc2626" />
      </div>

      <div className="grid md:grid-cols-[320px_1fr] gap-6 items-start">
        <div className="ledger-card p-6">
          <h3 className="font-semibold mb-3 text-[rgb(var(--color-ink))]">
            Add transaction
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value,
                  category:
                    e.target.value === "income"
                      ? INCOME_CATEGORIES[0]
                      : EXPENSE_CATEGORIES[0],
                })
              }
              className="input-field"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field"
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              className="input-field font-mono-amount"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="input-field"
            />
            <button type="submit" className="btn-primary w-full">
              Add
            </button>
          </form>
        </div>

        <div className="ledger-card p-6">
          <h3 className="font-semibold mb-3 text-[rgb(var(--color-ink))]">
            Recent
          </h3>
          {transactions.length === 0 && (
            <p className="text-sm opacity-60 text-[rgb(var(--color-ink))]">
              No transactions yet — add your first one.
            </p>
          )}
          <ul>
            {transactions.map((t) => (
              <li
                key={t._id}
                className="ledger-divider flex items-center gap-3 py-3"
              >
                <div
                  className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor:
                      t.type === "income"
                        ? "rgb(var(--color-income) / 0.15)"
                        : "rgb(var(--color-expense) / 0.15)",
                    color:
                      t.type === "income"
                        ? "rgb(var(--color-income))"
                        : "rgb(var(--color-expense))",
                  }}
                >
                  {t.type === "income" ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[rgb(var(--color-ink))] truncate">
                    {t.category}
                  </p>
                  {t.description && (
                    <p className="text-xs opacity-60 text-[rgb(var(--color-ink))] truncate">
                      {t.description}
                    </p>
                  )}
                </div>
                <span
                  className={`font-mono-amount text-sm ${
                    t.type === "income"
                      ? "text-[rgb(var(--color-income))]"
                      : "text-[rgb(var(--color-expense))]"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}
                  {t.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleDelete(t._id)}
                  className="opacity-40 hover:opacity-100 hover:text-[rgb(var(--color-expense))] text-[rgb(var(--color-ink))]"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
