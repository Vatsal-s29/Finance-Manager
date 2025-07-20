const express = require("express");
const {
    addExpense,
    bulkAddExpense,
    getAllExpense,
    deleteExpense,
    downloadExpenseExcel,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, addExpense);
router.post("/bulk-add", protect, bulkAddExpense);
router.get("/get", protect, getAllExpense);
router.get("/downloadexcel", protect, downloadExpenseExcel);
router.delete("/:id", protect, deleteExpense);

module.exports = router;
