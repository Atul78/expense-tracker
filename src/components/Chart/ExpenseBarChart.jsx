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

const ExpenseBarChart = () => {
  const { expenses } = useContext(ExpenseContext);

  const data = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const cat = e.category || "Other";
      map[cat] = (map[cat] || 0) + Number(e.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  if (data.length === 0) {
    return (
      <div className="chart-card">
        <h3>Spending by Category</h3>
        <p style={{ marginTop: 12 }}>No expenses yet</p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Spending by Category</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name="Amount" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseBarChart;
