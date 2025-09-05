import WalletCard from "./components/WalletCard";
import ExpenseCard from "./components/ExpenseCard";
import RecentTransactions from "./components/RecentTransactions";
import ExpensePieChart from "./components/Chart/ExpensePieChart";
import ExpenseBarChart from "./components/Chart/ExpenseBarChart";
import TopExpensesChart from "./components/Chart/TopExpensesChart";
import "./App.css";

const App = () => {
  return (
    <div className="container">
      <h1>Expense Tracker</h1>
      <div className="top-section">
        <WalletCard />
        <ExpenseCard />
        <ExpensePieChart />
      </div>
      <div className="transactions-section">
        <RecentTransactions />
        <TopExpensesChart />
      </div>
    </div>
  );
};

export default App;
