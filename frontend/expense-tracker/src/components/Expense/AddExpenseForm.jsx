import React, { useState } from "react";
import Input from "../Inputs/Input";
import EmojiPickerPopup from "../EmojiPickerPopup";
import BulkAddExpenseForm from "./BulkAddExpenseForm";

const AddExpenseForm = ({ onAddExpense, onBulkAddExpense, fetchExpenses }) => {
    const [expense, setExpense] = useState({
        category: "",
        amount: "",
        date: "",
        icon: "",
    });

    // State to toggle between single add and bulk add modes
    const [isBulkMode, setIsBulkMode] = useState(false);

    const handleChange = (key, value) => {
        setExpense({ ...expense, [key]: value });
    };

    // Handle bulk add submission
    const handleBulkAddExpense = async (expenses) => {
        try {
            await onBulkAddExpense(expenses);
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
                        icon={expense.icon}
                        onSelect={(selectedIcon) =>
                            handleChange("icon", selectedIcon)
                        }
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
                        onChange={({ target }) =>
                            handleChange("amount", target.value)
                        }
                        label="Amount"
                        placeholder=""
                        type="number"
                    />

                    {/* Date Input */}
                    <Input
                        value={expense.date}
                        onChange={({ target }) =>
                            handleChange("date", target.value)
                        }
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
            ) : (
                // Bulk Add Form
                <div>
                    <BulkAddExpenseForm
                        onBulkAddExpense={handleBulkAddExpense}
                        onCancel={handleCancelBulkAdd}
                    />
                </div>
            )}
        </div>
    );
};

export default AddExpenseForm;

// import React, { useState } from "react";
// import Input from "../Inputs/Input";
// import EmojiPickerPopup from "../EmojiPickerPopup";

// const AddExpenseForm = ({ onAddExpense }) => {
//     const [expense, setExpense] = useState({
//         category: "",
//         amount: "",
//         date: "",
//         icon: "",
//     });

//     const handleChange = (key, value) => {
//         setExpense({ ...expense, [key]: value });
//     };

//     return (
//         <div>
//             {/* Emoji Picker for Icon */}
//             <EmojiPickerPopup
//                 icon={expense.icon}
//                 onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
//             />

//             {/* Expense Category Input */}
//             <Input
//                 value={expense.category}
//                 onChange={({ target }) =>
//                     handleChange("category", target.value)
//                 }
//                 label="Expense Category"
//                 placeholder="Rent, Groceries, etc"
//                 type="text"
//             />

//             {/* Amount Input */}
//             <Input
//                 value={expense.amount}
//                 onChange={({ target }) => handleChange("amount", target.value)}
//                 label="Amount"
//                 placeholder=""
//                 type="number"
//             />

//             {/* Date Input */}
//             <Input
//                 value={expense.date}
//                 onChange={({ target }) => handleChange("date", target.value)}
//                 label="Date"
//                 placeholder=""
//                 type="date"
//             />

//             {/* Add Expense Button */}
//             <div className="flex justify-end mt-6">
//                 <button
//                     type="button"
//                     className="add-btn add-btn-fill cursor-pointer"
//                     onClick={() => onAddExpense(expense)}
//                 >
//                     Add Expense
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default AddExpenseForm;
