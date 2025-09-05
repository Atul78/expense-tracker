import React, { useContext, useMemo } from "react";
import { ExpenseContext } from "../../Context/ExpenseContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const TopExpensesChart = () => {
  const { expenses } = useContext(ExpenseContext);

  const data = useMemo(() => {
    // Sort by amount (desc) and take top 5
    const sorted = [...expenses].sort((a, b) => b.amount - a.amount);
    const topFive = sorted.slice(0, 5);

    return topFive.map((exp) => ({
      name: exp.title || "Unnamed",
      amount: Number(exp.amount),
    }));
  }, [expenses]);

  if (data.length === 0) {
    return (
      <div className="chart-card">
        <h3>Top Expenses</h3>
        <p style={{ marginTop: 12 }}>No expenses yet</p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Top Expenses</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical" // horizontal bars
          margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="amount"
            fill="#FF6384"
            barSize={30}
            radius={[0, 8, 8, 0]} // rounded right corners
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopExpensesChart;
