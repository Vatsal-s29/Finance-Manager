const xlsx = require("xlsx");
const Expense = require("../models/Expense");

// Add Expense Source
exports.addExpense = async (req, res) => {
    const userId = req.user.id;

    try {
        const { icon, category, amount, date } = req.body || {};

        // Validation: Check for missing fields
        if (!category || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newExpense = new Expense({
            userId,
            icon,
            category,
            amount,
            date: new Date(date),
        });

        await newExpense.save();
        res.status(200).json(newExpense);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

exports.bulkAddExpense = async (req, res) => {
    const userId = req.user.id;
    try {
        const { expenses } = req.body || {};

        // Validation: Check if expenses array exists and is not empty
        if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
            return res
                .status(400)
                .json({ message: "Expense array is required" });
        }

        // Validate each expense entry
        for (let i = 0; i < expenses.length; i++) {
            const { category, amount, date } = expenses[i];
            if (!category || !amount || !date) {
                return res.status(400).json({
                    message: `All fields are required for expense entry ${
                        i + 1
                    }`,
                });
            }
        }

        // Prepare expense data for bulk insert
        const expenseData = expenses.map((expense) => ({
            userId,
            icon: expense.icon || "",
            category: expense.category,
            amount: expense.amount,
            date: new Date(expense.date),
        }));

        // Bulk insert
        const savedExpenses = await Expense.insertMany(expenseData);

        res.status(200).json({
            message: `${savedExpenses.length} expenses added successfully`,
            expenses: savedExpenses,
        });
    } catch (error) {
        console.error("Bulk add expense error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get All Expense Source
exports.getAllExpense = async (req, res) => {
    const userId = req.user.id;

    try {
        const expense = await Expense.find({ userId }).sort({ date: -1 });
        res.json(expense);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Delete Expense Source
exports.deleteExpense = async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Download Excel
exports.downloadExpenseExcel = async (req, res) => {
    const userId = req.user.id;

    try {
        const expense = await Expense.find({ userId }).sort({ date: -1 });

        // Prepare data for Excel
        const data = expense.map((item) => ({
            Category: item.category,
            Amount: item.amount,
            Date: item.date,
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Expense");

        xlsx.writeFile(wb, "expense_details.xlsx");
        res.download("expense_details.xlsx");
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
