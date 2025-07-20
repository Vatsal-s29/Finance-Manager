import React, { useState } from "react";
import Input from "../Inputs/Input";
import EmojiPickerPopup from "../EmojiPickerPopup";

const AddIncomeForm = ({ onAddIncome }) => {
    const [income, setIncome] = useState({
        source: "",
        amount: "",
        date: "",
        icon: "", // you had this but it's not used yet
    });

    const handleChange = (key, value) => {
        setIncome({ ...income, [key]: value });
    };

    return (
        <div>
            {/* Emoji Picker for Icon */}
            <EmojiPickerPopup
                icon={income.icon}
                onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
            />

            {/* Income Source Input */}
            <Input
                value={income.source}
                onChange={({ target }) => handleChange("source", target.value)}
                label="Income Source"
                placeholder="Freelance, Salary, etc"
                type="text"
            />

            {/* Amount Input */}
            <Input
                value={income.amount}
                onChange={({ target }) => handleChange("amount", target.value)}
                label="Amount"
                placeholder=""
                type="number"
            />

            {/* Date Input */}
            <Input
                value={income.date}
                onChange={({ target }) => handleChange("date", target.value)}
                label="Date"
                placeholder=""
                type="date"
            />

            {/* Add Income Button */}
            <div className="flex justify-end mt-6">
                <button
                    type="button"
                    className="add-btn add-btn-fill"
                    onClick={() => onAddIncome(income)}
                >
                    Add Income
                </button>
            </div>
        </div>
    );
};

export default AddIncomeForm;
