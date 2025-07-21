const xlsx = require("xlsx");
const Income = require("../models/Income");
const moment = require("moment");

// Add Income Source
exports.addIncome = async (req, res) => {
    const userId = req.user.id;
    try {
        const { icon, source, amount, date } = req.body || {};
        // Validation: Check for missing fields
        if (!source || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const newIncome = new Income({
            userId,
            icon,
            source,
            amount,
            date: new Date(date),
        });
        await newIncome.save();
        res.status(200).json(newIncome);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Add this new function to your existing incomeController.js
exports.bulkAddIncome = async (req, res) => {
    const userId = req.user.id;
    try {
        const { incomes } = req.body || {};
        // Validation: Check if incomes array exists and is not empty
        if (!incomes || !Array.isArray(incomes) || incomes.length === 0) {
            return res
                .status(400)
                .json({ message: "Income array is required" });
        }
        // Validate each income entry
        for (let i = 0; i < incomes.length; i++) {
            const { source, amount, date } = incomes[i];
            if (!source || !amount || !date) {
                return res.status(400).json({
                    message: `All fields are required for income entry ${
                        i + 1
                    }`,
                });
            }
        }
        // Prepare income data for bulk insert
        const incomeData = incomes.map((income) => ({
            userId,
            icon: income.icon || "",
            source: income.source,
            amount: income.amount,
            date: new Date(income.date),
        }));
        // Bulk insert
        const savedIncomes = await Income.insertMany(incomeData);
        res.status(200).json({
            message: `${savedIncomes.length} incomes added successfully`,
            incomes: savedIncomes,
        });
    } catch (error) {
        console.error("Bulk add income error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get All Income Source with Pagination and Search
exports.getAllIncome = async (req, res) => {
    const userId = req.user.id;
    try {
        const {
            page = 1,
            limit = 10,
            source = '',
            dateRange = 'all',
            startDate,
            endDate,
            minAmount,
            maxAmount
        } = req.query;

        // Convert page and limit to numbers
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // Build query
        let query = { userId };

        // Source filter (case-insensitive partial match)
        if (source) {
            query.source = { $regex: source, $options: 'i' };
        }

        // Date range filter
        let dateFilter = {};
        const now = moment();

        switch (dateRange) {
            case 'lastWeek':
                dateFilter = {
                    $gte: now.clone().subtract(7, 'days').startOf('day').toDate(),
                    $lte: now.clone().endOf('day').toDate()
                };
                break;
            case 'lastMonth':
                dateFilter = {
                    $gte: now.clone().subtract(1, 'month').startOf('day').toDate(),
                    $lte: now.clone().endOf('day').toDate()
                };
                break;
            case 'lastYear':
                dateFilter = {
                    $gte: now.clone().subtract(1, 'year').startOf('day').toDate(),
                    $lte: now.clone().endOf('day').toDate()
                };
                break;
            case 'custom':
                if (startDate && endDate) {
                    dateFilter = {
                        $gte: moment(startDate).startOf('day').toDate(),
                        $lte: moment(endDate).endOf('day').toDate()
                    };
                } else if (startDate) {
                    dateFilter = {
                        $gte: moment(startDate).startOf('day').toDate()
                    };
                } else if (endDate) {
                    dateFilter = {
                        $lte: moment(endDate).endOf('day').toDate()
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
        const [income, totalCount] = await Promise.all([
            Income.find(query)
                .sort({ date: -1 })
                .skip(skip)
                .limit(limitNum),
            Income.countDocuments(query)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limitNum);

        res.json({
            transactions: income,
            currentPage: pageNum,
            totalPages,
            totalItems: totalCount,
            itemsPerPage: limitNum
        });
    } catch (error) {
        console.error("Get all income error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Delete Income Source
exports.deleteIncome = async (req, res) => {
    try {
        await Income.findByIdAndDelete(req.params.id);
        res.json({ message: "Income deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Download Excel
exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id;
    try {
        const income = await Income.find({ userId }).sort({ date: -1 });
        // Prepare data for Excel
        const data = income.map((item) => ({
            Source: item.source,
            Amount: item.amount,
            Date: item.date,
        }));
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Income");
        xlsx.writeFile(wb, "income_details.xlsx");
        res.download("income_details.xlsx");
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
