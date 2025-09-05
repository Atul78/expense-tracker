import React, { useContext, useMemo } from "react";
import { ExpenseContext } from "../../Context/ExpenseContext";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28FD0", "#FF6384"];

const ExpensePieChart = () => {
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
        <h3>Expense Summary</h3>
        <p style={{ marginTop: 12 }}>No expenses yet</p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Expense Summary</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpensePieChart;
