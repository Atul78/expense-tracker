import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import { SnackbarProvider, useSnackbar } from "notistack";
import { PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { FiPlus, FiEdit2, FiTrash2, FiBarChart2, FiPieChart } from "react-icons/fi";

if (typeof document !== "undefined") {
  Modal.setAppElement("#root");
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1", "#a4de6c", "#d0ed57", "#ffc0cb"]; // Do not rely on theme

const loadLS = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};
const saveLS = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

// Expense item type
// { id, title, amount (number), category, date (yyyy-mm-dd) }

function ExpenseTrackerApp() {
  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "top", horizontal: "center" }} autoHideDuration={2500}>
      <AppInner />
    </SnackbarProvider>
  );
}

function AppInner() {
  const { enqueueSnackbar } = useSnackbar();

  const [walletBalance, setWalletBalance] = useState(() => {
    const v = loadLS("walletBalance", 5000);
    return typeof v === "number" && !Number.isNaN(v) ? v : 5000;
  });
  const [expenses, setExpenses] = useState(() => loadLS("expenses", []));

  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [isMoneyModalOpen, setMoneyModalOpen] = useState(false);

  // Form state for add/edit expense
  const initialForm = { id: null, title: "", amount: "", category: "", date: "" };
  const [form, setForm] = useState(initialForm);
  const isEditing = useMemo(() => form.id !== null, [form.id]);

  // Persist
  useEffect(() => saveLS("walletBalance", walletBalance), [walletBalance]);
  useEffect(() => saveLS("expenses", expenses), [expenses]);

  // Derived data
  const totalsByCategory = useMemo(() => {
    const map = new Map();
    for (const e of expenses) {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  // Handlers
  const openAddExpense = () => {
    setForm(initialForm);
    setExpenseModalOpen(true);
  };

  const openEditExpense = (exp) => {
    setForm({ id: exp.id, title: exp.title, amount: String(exp.amount), category: exp.category, date: exp.date });
    setExpenseModalOpen(true);
  };

  const closeExpenseModal = () => {
    setForm(initialForm);
    setExpenseModalOpen(false);
  };

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "amount" ? value.replace(/[^0-9.]/g, "") : value }));
  };

  const validateExpense = (payload) => {
    if (!payload.title.trim() || !payload.category.trim() || !payload.date.trim()) return "Please fill all required fields.";
    const amt = Number(payload.amount);
    if (!Number.isFinite(amt) || amt <= 0) return "Enter a valid amount (> 0).";
    return null;
  };

  const submitExpense = (e) => {
    e?.preventDefault?.();
    const err = validateExpense(form);
    if (err) return enqueueSnackbar(err, { variant: "warning" });

    const amt = Number(form.amount);

    if (isEditing) {
      const prev = expenses.find((x) => x.id === form.id);
      if (!prev) return enqueueSnackbar("Item not found.", { variant: "error" });

      // Check balance constraint: you can recover prev.amount, then apply new amount
      const available = walletBalance + prev.amount;
      if (amt > available) return enqueueSnackbar("Insufficient balance for this update.", { variant: "error" });

      setExpenses((list) => list.map((x) => (x.id === form.id ? { ...x, title: form.title.trim(), amount: amt, category: form.category.trim(), date: form.date } : x)));
      setWalletBalance((b) => b + prev.amount - amt);
      enqueueSnackbar("Expense updated.", { variant: "success" });
    } else {
      if (amt > walletBalance) return enqueueSnackbar("Expense exceeds wallet balance.", { variant: "error" });

      const newExp = { id: crypto.randomUUID(), title: form.title.trim(), amount: amt, category: form.category.trim(), date: form.date };
      setExpenses((list) => [newExp, ...list]);
      setWalletBalance((b) => b - amt);
      enqueueSnackbar("Expense added.", { variant: "success" });
    }

    // Clear form after success
    setForm(initialForm);
    setExpenseModalOpen(false);
  };

  const deleteExpense = (id) => {
    const ex = expenses.find((x) => x.id === id);
    if (!ex) return;
    setExpenses((list) => list.filter((x) => x.id !== id));
    setWalletBalance((b) => b + ex.amount);
    enqueueSnackbar("Expense deleted.", { variant: "info" });
  };

  // Money modal
  const [moneyAmount, setMoneyAmount] = useState("");
  const openMoney = () => {
    setMoneyAmount("");
    setMoneyModalOpen(true);
  };
  const closeMoney = () => setMoneyModalOpen(false);
  const addMoney = (e) => {
    e?.preventDefault?.();
    const amt = Number(moneyAmount);
    if (!Number.isFinite(amt) || amt <= 0) return enqueueSnackbar("Enter a valid amount to add.", { variant: "warning" });
    setWalletBalance((b) => b + amt);
    enqueueSnackbar("Money added to wallet.", { variant: "success" });
    setMoneyAmount("");
    setMoneyModalOpen(false);
  };

  // Helpers for tests / selectors
  const currency = (n) => new Intl.NumberFormat(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Expense Tracker</h1>
          <div className="flex gap-2">
            <button data-testid="add-money-btn" onClick={openMoney} className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 bg-emerald-600 hover:bg-emerald-500 transition shadow">
              + Add Income
            </button>
            <button data-testid="open-add-expense" onClick={openAddExpense} className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 bg-indigo-600 hover:bg-indigo-500 transition shadow">
              + Add Expense
            </button>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="rounded-2xl p-4 bg-neutral-900 border border-neutral-800">
              <div className="text-neutral-400 text-sm">Wallet Balance</div>
              <div data-testid="wallet-balance" className="text-3xl font-bold mt-1">{currency(walletBalance)}</div>
              <p className="text-xs text-neutral-400 mt-2">Default balance is ₹5,000 and persists across refresh.</p>
            </div>

            <div className="rounded-2xl p-4 bg-neutral-900 border border-neutral-800 mt-4">
              <div className="flex items-center gap-2 text-neutral-300 font-medium"><FiPieChart /> Expense Summary</div>
              <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={totalsByCategory} dataKey="value" nameKey="name" outerRadius={90} label>
                      {totalsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ReTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-2xl p-4 bg-neutral-900 border border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-300 font-medium"><FiBarChart2 /> Expense Trends</div>
              <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={totalsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ReTooltip />
                    <Legend />
                    <Bar dataKey="value" name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-neutral-900 border border-neutral-800 mt-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Expenses</h2>
                <span className="text-sm text-neutral-400">{expenses.length} item(s)</span>
              </div>

              <div className="overflow-x-auto mt-3">
                <table className="min-w-full text-sm">
                  <thead className="text-neutral-400">
                    <tr className="text-left">
                      <th className="py-2 pr-2">Title</th>
                      <th className="py-2 pr-2">Category</th>
                      <th className="py-2 pr-2">Date</th>
                      <th className="py-2 pr-2">Amount</th>
                      <th className="py-2 pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-neutral-500">No expenses added yet.</td>
                      </tr>
                    ) : (
                      expenses.map((e) => (
                        <tr key={e.id} className="border-t border-neutral-800">
                          <td className="py-2 pr-2" data-testid={`exp-title-${e.id}`}>{e.title}</td>
                          <td className="py-2 pr-2">{e.category}</td>
                          <td className="py-2 pr-2">{e.date}</td>
                          <td className="py-2 pr-2">{currency(e.amount)}</td>
                          <td className="py-2 pr-2">
                            <div className="flex gap-2">
                              <button aria-label="Edit" className="px-2 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700" onClick={() => openEditExpense(e)}>
                                <FiEdit2 />
                              </button>
                              <button aria-label="Delete" className="px-2 py-1 rounded-md bg-red-900/50 hover:bg-red-800/60" onClick={() => deleteExpense(e.id)}>
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onRequestClose={closeExpenseModal}
        contentLabel={isEditing ? "Edit Expense" : "Add Expense"}
        className="max-w-lg w-[92vw] mx-auto mt-24 rounded-2xl bg-neutral-900 p-4 outline-none border border-neutral-800"
        overlayClassName="fixed inset-0 bg-black/70 flex"
      >
        <h3 className="text-xl font-semibold mb-3">{isEditing ? "Edit Expense" : "Add Expense"}</h3>
        <form onSubmit={submitExpense} className="grid gap-3">
          <div className="grid gap-1">
            <label htmlFor="title" className="text-sm text-neutral-300">Title *</label>
            <input data-testid="expense-title-input" id="title" name="title" value={form.title} onChange={onFormChange} placeholder="e.g., Groceries" className="bg-neutral-800 rounded-lg px-3 py-2 outline-none" required />
          </div>
          <div className="grid gap-1">
            <label htmlFor="amount" className="text-sm text-neutral-300">Amount (₹) *</label>
            <input data-testid="expense-amount-input" id="amount" name="amount" value={form.amount} onChange={onFormChange} placeholder="e.g., 500" className="bg-neutral-800 rounded-lg px-3 py-2 outline-none" inputMode="decimal" required />
          </div>
          <div className="grid gap-1">
            <label htmlFor="category" className="text-sm text-neutral-300">Category *</label>
            <input data-testid="expense-category-input" id="category" name="category" value={form.category} onChange={onFormChange} placeholder="e.g., Food" className="bg-neutral-800 rounded-lg px-3 py-2 outline-none" required />
          </div>
          <div className="grid gap-1">
            <label htmlFor="date" className="text-sm text-neutral-300">Date *</label>
            <input data-testid="expense-date-input" id="date" name="date" type="date" value={form.date} onChange={onFormChange} className="bg-neutral-800 rounded-lg px-3 py-2 outline-none" required />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeExpenseModal} className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700">Cancel</button>
            <button data-testid="submit-expense" type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500">
              {isEditing ? "Save Changes" : "Add Expense"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Money Modal */}
      <Modal
        isOpen={isMoneyModalOpen}
        onRequestClose={closeMoney}
        contentLabel="Add Money"
        className="max-w-md w-[92vw] mx-auto mt-24 rounded-2xl bg-neutral-900 p-4 outline-none border border-neutral-800"
        overlayClassName="fixed inset-0 bg-black/70 flex"
      >
        <h3 className="text-xl font-semibold mb-3 text-white">Add Money</h3>
        <form onSubmit={addMoney} className="grid gap-3">
          <div className="grid gap-1">
            <label htmlFor="money-amt" className="text-sm text-neutral-300">Amount (₹)</label>
            <input type="number" data-testid="add-money-input" id="money-amt" value={moneyAmount} onChange={(e) => setMoneyAmount(e.target.value.replace(/[^0-9.]/g, ""))} className="bg-neutral-800 rounded-lg px-3 py-2 outline-none" inputMode="decimal" placeholder="Income Amount" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeMoney} className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700">Cancel</button>
            <button data-testid="confirm-add-money" type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500">Add Balance</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ExpenseTrackerApp;
