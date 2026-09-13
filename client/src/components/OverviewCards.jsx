// components/OverviewCards.jsx
import { useCountUp } from "../hooks/useCountUp";

const StatCard = ({ label, value, colorClass }) => {
  const animatedValue = useCountUp(value);

  return (
    <div className="ledger-card stat-card p-4 text-center">
      <p className="text-sm opacity-70 text-[rgb(var(--color-ink))]">{label}</p>
      <p
        className={`text-lg sm:text-xl font-bold font-mono-amount break-words ${colorClass}`}
      >
        {animatedValue.toFixed(2)}
      </p>
    </div>
  );
};

const OverviewCards = ({ overview }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <StatCard
        label="Income"
        value={overview.income}
        colorClass="text-[rgb(var(--color-income))]"
      />
      <StatCard
        label="Expense"
        value={overview.expense}
        colorClass="text-[rgb(var(--color-expense))]"
      />
      <StatCard
        label="Balance"
        value={overview.balance}
        colorClass={
          overview.balance >= 0
            ? "text-[rgb(var(--color-income))]"
            : "text-[rgb(var(--color-expense))]"
        }
      />
    </div>
  );
};

export default OverviewCards;
