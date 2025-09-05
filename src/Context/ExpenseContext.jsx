import React, { createContext, useState, useEffect } from "react";

export const ExpenseContext = createContext();

const ExpenseProvider = ({ children }) => {
  const [walletBalance, setWalletBalance] = useState(() => {
    const v = localStorage.getItem("walletBalance");
    return v !== null ? Number(v) : 5000;
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      const raw = localStorage.getItem("expenses");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("walletBalance", String(walletBalance));
  }, [walletBalance]);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const addIncome = (amount) => {
    setWalletBalance((prev) => prev + Number(amount));
  };

  const addExpense = (expense) => {
    const amt = Number(expense.amount);
    if (amt > walletBalance) {
      alert("Not enough balance!");
      return false;
    }
    setExpenses((prev) => [...prev, { ...expense, amount: amt }]);
    setWalletBalance((prev) => prev - amt);
    return true;
  };

  const deleteExpense = (id) => {
    let deletedAmount = 0;

    // Step 1: Remove from expenses
    setExpenses((prev) => {
      const toDelete = prev.find((e) => e.id === id);
      if (toDelete) {
        deletedAmount = Number(toDelete.amount);
        return prev.filter((e) => e.id !== id);
      }
      return prev;
    });

    // Step 2: Update wallet
    if (deletedAmount > 0) {
      setWalletBalance((bal) => bal + deletedAmount);
    }
  };

  const editExpense = (id, updatedExpense) => {
    let allowed = true;
    setExpenses((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      if (idx === -1) {
        allowed = false;
        return prev;
      }
      const old = prev[idx];
      const newAmount = Number(updatedExpense.amount);
      const delta = newAmount - Number(old.amount);

      if (delta > 0 && delta > walletBalance) {
        allowed = false;
        return prev;
      }

      if (delta !== 0) {
        setWalletBalance((bal) => bal - delta);
      }

      const newList = [...prev];
      newList[idx] = { ...old, ...updatedExpense, amount: newAmount };
      return newList;
    });
    return allowed;
  };

  return (
    <ExpenseContext.Provider
      value={{
        walletBalance,
        addIncome,
        expenses,
        addExpense,
        deleteExpense,
        editExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export default ExpenseProvider;
