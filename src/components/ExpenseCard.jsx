import React, { useContext, useState } from "react";
import Modal from "react-modal";
import { ExpenseContext } from "../Context/ExpenseContext";
import { v4 as uuidv4 } from "uuid";
import { useSnackbar } from "notistack";

Modal.setAppElement("#root");

const ExpenseCard = () => {
  const { expenses, addExpense } = useContext(ExpenseContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  const { enqueueSnackbar } = useSnackbar();

  const handleAddExpense = () => {
    if (!title || !amount || !category || !date) {
      alert("Please fill all fields!");
      return;
    }

    if (Number(amount) <= 0) {
      alert("Amount must be greater than 0!");
      return;
    }

    // Convert date format from yyyy-mm-dd → yy-day-month
    const [year, month, day] = date.split("-");
    const formattedDate = `${year.slice(2)}-${day}-${month}`; // ✅ yy-day-month

    const success = addExpense({
      id: uuidv4(),
      title,
      amount: Number(amount),
      category,
      date: formattedDate,
    });

    if (success) {
      setTitle("");
      setAmount("");
      setCategory("");
      setDate("");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="expense-card">
      <h3>
        Expenses:{" "}
        <span className="yellow">
          ₹{expenses.reduce((acc, e) => acc + e.amount, 0)}
        </span>
      </h3>
      <button className="add-expense-btn" onClick={() => setIsModalOpen(true)}>
        + Add Expense
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <h2 className="modal-title">Add Expense</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddExpense();
          }}
        >
          <div className="modal-body">
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="modal-input"
            />

            <input
              type="number"
              name="price"
              placeholder="Price"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="modal-input"
              min={0}
            />

            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="modal-input"
            >
              <option value="">Select category</option>
              <option value="Food">Food</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Travel">Travel</option>
            </select>

            <input
              type="date"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="modal-input"
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-yellow">
              Add Expense
            </button>
            <button
              type="button"
              className="btn btn-gray"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExpenseCard;
