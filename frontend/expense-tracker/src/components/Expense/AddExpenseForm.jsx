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

    // State for receipt upload
    const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
    const [receiptError, setReceiptError] = useState("");

    const handleChange = (key, value) => {
        setExpense({ ...expense, [key]: value });
    };

    // Function to convert date to yyyy-MM-dd format
    const formatDateForInput = (dateStr) => {
        if (!dateStr) return "";

        try {
            // Handle different date formats
            let date;

            // Check if it's already in yyyy-MM-dd format
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                return dateStr;
            }

            // Handle MM/dd/yyyy format
            if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
                const [month, day, year] = dateStr.split("/");
                date = new Date(year, month - 1, day);
            }
            // Handle dd.MM.yyyy format
            else if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateStr)) {
                const [day, month, year] = dateStr.split(".");
                date = new Date(year, month - 1, day);
            }
            // Handle dd-MM-yyyy format
            else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
                const [day, month, year] = dateStr.split("-");
                date = new Date(year, month - 1, day);
            }
            // Try to parse as general date
            else {
                date = new Date(dateStr);
            }

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return "";
            }

            // Format as yyyy-MM-dd
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error("Date formatting error:", error);
            return "";
        }
    };

    // Handle receipt upload and processing
    const handleReceiptUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
        ];
        if (!allowedTypes.includes(file.type)) {
            setReceiptError("Please upload an image file (JPEG, PNG, or GIF)");
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setReceiptError("File size must be less than 5MB");
            return;
        }

        setIsProcessingReceipt(true);
        setReceiptError("");

        try {
            const formData = new FormData();
            formData.append("receipt", file);

            const response = await fetch(
                "http://localhost:3001/api/process-receipt",
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            // Fill the form fields with the extracted data
            setExpense((prevExpense) => ({
                ...prevExpense,
                category: data.category || prevExpense.category,
                amount: data.amount || prevExpense.amount,
                date: formatDateForInput(data.date) || prevExpense.date,
            }));
        } catch (error) {
            console.error("Receipt processing failed:", error);
            setReceiptError(`Failed to process receipt: ${error.message}`);
        } finally {
            setIsProcessingReceipt(false);
            // Clear the file input
            event.target.value = "";
        }
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
                    {/* Receipt Upload Section */}
                    <div style={{ marginBottom: "20px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: "500",
                            }}
                        >
                            Upload Receipt to auto-fill form (Optional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleReceiptUpload}
                            disabled={isProcessingReceipt}
                            style={{
                                width: "100%",
                                padding: "8px",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                            }}
                        />
                        {isProcessingReceipt && (
                            <p
                                style={{
                                    color: "#666",
                                    fontSize: "14px",
                                    marginTop: "8px",
                                }}
                            >
                                Processing receipt...
                            </p>
                        )}
                        {receiptError && (
                            <p
                                style={{
                                    color: "#e74c3c",
                                    fontSize: "14px",
                                    marginTop: "8px",
                                }}
                            >
                                {receiptError}
                            </p>
                        )}
                    </div>

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
// import BulkAddExpenseForm from "./BulkAddExpenseForm";

// const AddExpenseForm = ({ onAddExpense, onBulkAddExpense, fetchExpenses }) => {
//     const [expense, setExpense] = useState({
//         category: "",
//         amount: "",
//         date: "",
//         icon: "",
//     });

//     // State to toggle between single add and bulk add modes
//     const [isBulkMode, setIsBulkMode] = useState(false);

//     const handleChange = (key, value) => {
//         setExpense({ ...expense, [key]: value });
//     };

//     // Handle bulk add submission
//     const handleBulkAddExpense = async (expenses) => {
//         try {
//             await onBulkAddExpense(expenses);
//             console.log("Bulk add successful!");
//         } catch (error) {
//             console.error("Bulk add failed:", error);
//         }
//     };

//     // Handle canceling bulk add
//     const handleCancelBulkAdd = () => {
//         setIsBulkMode(false);
//     };

//     return (
//         <div style={{ position: "relative" }}>
//             {/* Toggle Button */}
//             <div style={{ marginBottom: "20px" }}>
//                 <button
//                     type="button"
//                     onClick={() => setIsBulkMode(!isBulkMode)}
//                     className="add-btn-centered"
//                     style={{
//                         width: "100%",
//                     }}
//                 >
//                     {isBulkMode ? "Switch to Single Add" : "Switch to Bulk Add"}
//                 </button>
//             </div>

//             {/* Conditional Content */}
//             {!isBulkMode ? (
//                 // Single Add Form
//                 <div>
//                     {/* Emoji Picker for Icon */}
//                     <EmojiPickerPopup
//                         icon={expense.icon}
//                         onSelect={(selectedIcon) =>
//                             handleChange("icon", selectedIcon)
//                         }
//                     />

//                     {/* Expense Category Input */}
//                     <Input
//                         value={expense.category}
//                         onChange={({ target }) =>
//                             handleChange("category", target.value)
//                         }
//                         label="Expense Category"
//                         placeholder="Rent, Groceries, etc"
//                         type="text"
//                     />

//                     {/* Amount Input */}
//                     <Input
//                         value={expense.amount}
//                         onChange={({ target }) =>
//                             handleChange("amount", target.value)
//                         }
//                         label="Amount"
//                         placeholder=""
//                         type="number"
//                     />

//                     {/* Date Input */}
//                     <Input
//                         value={expense.date}
//                         onChange={({ target }) =>
//                             handleChange("date", target.value)
//                         }
//                         label="Date"
//                         placeholder=""
//                         type="date"
//                     />

//                     {/* Add Expense Button */}
//                     <div className="flex justify-end mt-6">
//                         <button
//                             type="button"
//                             className="add-btn add-btn-fill cursor-pointer"
//                             onClick={() => onAddExpense(expense)}
//                         >
//                             Add Expense
//                         </button>
//                     </div>
//                 </div>
//             ) : (
//                 // Bulk Add Form
//                 <div>
//                     <BulkAddExpenseForm
//                         onBulkAddExpense={handleBulkAddExpense}
//                         onCancel={handleCancelBulkAdd}
//                     />
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AddExpenseForm;
