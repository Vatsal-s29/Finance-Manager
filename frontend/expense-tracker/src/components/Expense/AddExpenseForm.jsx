import React, { useState } from "react";
import Input from "../Inputs/Input";
import EmojiPickerPopup from "../EmojiPickerPopup";

const AddExpenseForm = ({ onAddExpense }) => {
    const [expense, setExpense] = useState({
        category: "",
        amount: "",
        date: "",
        icon: "",
    });

    const handleChange = (key, value) => {
        setExpense({ ...expense, [key]: value });
    };

    return (
        <div>
            {/* Emoji Picker for Icon */}
            <EmojiPickerPopup
                icon={expense.icon}
                onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
            />

            {/* Expense Category Input */}
            <Input
                value={expense.category}
                onChange={({ target }) =>
                    handleChange("category", target.value)
                }
                label="Expense Category"
                placeholder="Rent, Groceries, etc"
                type="text"
            />

            {/* Amount Input */}
            <Input
                value={expense.amount}
                onChange={({ target }) => handleChange("amount", target.value)}
                label="Amount"
                placeholder=""
                type="number"
            />

            {/* Date Input */}
            <Input
                value={expense.date}
                onChange={({ target }) => handleChange("date", target.value)}
                label="Date"
                placeholder=""
                type="date"
            />

            {/* Add Expense Button */}
            <div className="flex justify-end mt-6">
                <button
                    type="button"
                    className="add-btn add-btn-fill cursor-pointer"
                    onClick={() => onAddExpense(expense)}
                >
                    Add Expense
                </button>
            </div>
        </div>
    );
};

export default AddExpenseForm;
