import React, { useContext, useState } from "react";
import { ExpenseContext } from "../Context/ExpenseContext";
import { FaTrash, FaEdit } from "react-icons/fa";
import Modal from "react-modal";

Modal.setAppElement("#root");

const RecentTransactions = () => {
  const { expenses, deleteExpense, editExpense } = useContext(ExpenseContext);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);

  const handleEditClick = (expense) => {
    setCurrentExpense(expense);
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!currentExpense.title || !currentExpense.amount || !currentExpense.category || !currentExpense.date) {
      alert("Please fill all fields!");
      return;
    }

    editExpense(currentExpense.id, currentExpense);
    setEditModalOpen(false);
  };

  return (
    <div className="transactions-container">
      <h2>Recent Transactions</h2>
      {expenses.length === 0 && <p>No expenses added yet</p>}

      {expenses.map((exp) => (
        <div key={exp.id} className="transaction-item">
          <div>
            <strong>{exp.title}</strong>
            <p className="date">{exp.date}</p>
          </div>
          <div className="actions">
            <span className="amount">₹{exp.amount}</span>
            <button className="icon-btn delete" onClick={() => deleteExpense(exp.id)}>
              <FaTrash />
            </button>
            <button className="icon-btn edit" onClick={() => handleEditClick(exp)}>
              <FaEdit />
            </button>
          </div>
        </div>
      ))}

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onRequestClose={() => setEditModalOpen(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Edit Expense</h2>
        {currentExpense && (
          <>
            <input
              type="text"
              value={currentExpense.title}
              onChange={(e) => setCurrentExpense({ ...currentExpense, title: e.target.value })}
            />
            <input
              type="number"
              value={currentExpense.amount}
              onChange={(e) => setCurrentExpense({ ...currentExpense, amount: Number(e.target.value) })}
            />
            <select
              value={currentExpense.category}
              onChange={(e) => setCurrentExpense({ ...currentExpense, category: e.target.value })}
            >
              <option value="Food">Food</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Travel">Travel</option>
            </select>
            <input
              type="date"
              value={currentExpense.date}
              onChange={(e) => setCurrentExpense({ ...currentExpense, date: e.target.value })}
            />
            <div className="modal-actions">
              <button className="btn yellow" onClick={handleSaveEdit}>
                Save Changes
              </button>
              <button className="btn gray" onClick={() => setEditModalOpen(false)}>
                Cancel
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default RecentTransactions;
