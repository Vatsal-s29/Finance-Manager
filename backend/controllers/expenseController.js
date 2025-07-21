const xlsx = require("xlsx");
const Expense = require("../models/Expense");
const moment = require("moment");

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

// Get All Expense Source with Pagination and Search
exports.getAllExpense = async (req, res) => {
    const userId = req.user.id;
    try {
        const {
            page = 1,
            limit = 10,
            category = "",
            dateRange = "all",
            startDate,
            endDate,
            minAmount,
            maxAmount,
        } = req.query;

        // Convert page and limit to numbers
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // Build query
        let query = { userId };

        // Category filter (case-insensitive partial match)
        if (category) {
            query.category = { $regex: category, $options: "i" };
        }

        // Date range filter
        let dateFilter = {};
        const now = moment();

        switch (dateRange) {
            case "lastWeek":
                dateFilter = {
                    $gte: now
                        .clone()
                        .subtract(7, "days")
                        .startOf("day")
                        .toDate(),
                    $lte: now.clone().endOf("day").toDate(),
                };
                break;
            case "lastMonth":
                dateFilter = {
                    $gte: now
                        .clone()
                        .subtract(1, "month")
                        .startOf("day")
                        .toDate(),
                    $lte: now.clone().endOf("day").toDate(),
                };
                break;
            case "lastYear":
                dateFilter = {
                    $gte: now
                        .clone()
                        .subtract(1, "year")
                        .startOf("day")
                        .toDate(),
                    $lte: now.clone().endOf("day").toDate(),
                };
                break;
            case "custom":
                if (startDate && endDate) {
                    dateFilter = {
                        $gte: moment(startDate).startOf("day").toDate(),
                        $lte: moment(endDate).endOf("day").toDate(),
                    };
                } else if (startDate) {
                    dateFilter = {
                        $gte: moment(startDate).startOf("day").toDate(),
                    };
                } else if (endDate) {
                    dateFilter = {
                        $lte: moment(endDate).endOf("day").toDate(),
                    };
                }
                break;
            default:
                // 'all' - no date filter
                break;
        }

        if (Object.keys(dateFilter).length > 0) {
            query.date = dateFilter;
        }

        // Amount range filter
        let amountFilter = {};
        if (minAmount) {
            amountFilter.$gte = parseFloat(minAmount);
        }
        if (maxAmount) {
            amountFilter.$lte = parseFloat(maxAmount);
        }
        if (Object.keys(amountFilter).length > 0) {
            query.amount = amountFilter;
        }

        // Execute queries
        const [expense, totalCount] = await Promise.all([
            Expense.find(query).sort({ date: -1 }).skip(skip).limit(limitNum),
            Expense.countDocuments(query),
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limitNum);

        res.json({
            transactions: expense,
            currentPage: pageNum,
            totalPages,
            totalItems: totalCount,
            itemsPerPage: limitNum,
        });
    } catch (error) {
        console.error("Get all expense error:", error);
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
