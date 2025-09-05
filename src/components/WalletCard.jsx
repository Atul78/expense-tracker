import React, { useContext, useState } from "react";
import Modal from "react-modal";
import { ExpenseContext } from "../Context/ExpenseContext";
import { toast } from "react-toastify";

Modal.setAppElement("#root"); // Accessibility ke liye

const WalletCard = () => {
  const { walletBalance, addIncome } = useContext(ExpenseContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState("");

  const handleAddIncome = () => {
    const amount = Number(incomeAmount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    addIncome(amount);
    toast.success("Income added successfully!");
    setIncomeAmount("");
    setIsModalOpen(false);
  };

  return (
    <div className="wallet-card">
      <h3>
        Wallet Balance: <span className="green">₹{walletBalance}</span>
      </h3>
      <button className="add-income-btn" onClick={() => setIsModalOpen(true)}>
        + Add Income
      </button>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <h2 className="modal-title">Add Balance</h2>

        <div className="modal-body">
          <input
            type="number"
            placeholder="Income Amount"
            value={incomeAmount}
            onChange={(e) => setIncomeAmount(e.target.value)}
            min={0}
            className="modal-input"
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-yellow" onClick={handleAddIncome}>
            Add Balance
          </button>
          <button
            className="btn btn-gray"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default WalletCard;
