// components/BudgetComparisonChart.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BudgetComparisonChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm opacity-60 text-[rgb(var(--color-ink))]">
        Create a budget to see this comparison.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="limit"
          name="Limit"
          fill="#4F46E5"
          radius={[6, 6, 0, 0]}
        />
        <Bar
          dataKey="spent"
          name="Spent"
          fill="#dc2626"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BudgetComparisonChart;
