import React, { useState } from "react";
import Input from "../Inputs/Input";
import EmojiPickerPopup from "../EmojiPickerPopup";
import BulkAddIncomeForm from "./BulkAddIncomeForm";

const AddIncomeForm = ({ onAddIncome, onBulkAddIncome, fetchIncomes }) => {
    const [income, setIncome] = useState({
        source: "",
        amount: "",
        date: "",
        icon: "",
    });

    // State to toggle between single add and bulk add modes
    const [isBulkMode, setIsBulkMode] = useState(false);

    const handleChange = (key, value) => {
        setIncome({ ...income, [key]: value });
    };

    // Handle bulk add submission
    const handleBulkAddIncome = async (incomes) => {
        try {
            await onBulkAddIncome(incomes);
            console.log("Bulk add successful!");
        } catch (error) {
            console.error("Bulk add failed:", error);
        }
    };

    // Handle canceling bulk add
    const handleCancelBulkAdd = () => {
        setIsBulkMode(false);
    };

    return (
        <div style={{ position: "relative" }}>
            {/* Toggle Button */}
            <div style={{ marginBottom: "20px" }}>
                <button
                    type="button"
                    onClick={() => setIsBulkMode(!isBulkMode)}
                    className="add-btn-centered"
                    style={{
                        width: "100%",
                    }}
                >
                    {isBulkMode ? "Switch to Single Add" : "Switch to Bulk Add"}
                </button>
            </div>

            {/* Conditional Content */}
            {!isBulkMode ? (
                // Single Add Form
                <div>
                    {/* Emoji Picker for Icon */}
                    <EmojiPickerPopup
                        icon={income.icon}
                        onSelect={(selectedIcon) =>
                            handleChange("icon", selectedIcon)
                        }
                    />

                    {/* Income Source Input */}
                    <Input
                        value={income.source}
                        onChange={({ target }) =>
                            handleChange("source", target.value)
                        }
                        label="Income Source"
                        placeholder="Freelance, Salary, etc"
                        type="text"
                    />

                    {/* Amount Input */}
                    <Input
                        value={income.amount}
                        onChange={({ target }) =>
                            handleChange("amount", target.value)
                        }
                        label="Amount"
                        placeholder=""
                        type="number"
                    />

                    {/* Date Input */}
                    <Input
                        value={income.date}
                        onChange={({ target }) =>
                            handleChange("date", target.value)
                        }
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
            ) : (
                // Bulk Add Form
                <div>
                    <BulkAddIncomeForm
                        onBulkAddIncome={handleBulkAddIncome}
                        onCancel={handleCancelBulkAdd}
                    />
                </div>
            )}
        </div>
    );
};

export default AddIncomeForm;
