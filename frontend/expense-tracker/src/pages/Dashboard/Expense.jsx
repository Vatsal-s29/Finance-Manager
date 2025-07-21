import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import Modal from "../../components/Modal";
import ExpenseOverview from "../../components/Expense/ExpenseOverview";
import AddExpenseForm from "../../components/Expense/AddExpenseForm";
import ExpenseList from "../../components/Expense/ExpenseList";
import CategoryWiseExpenses from "../../components/Expense/CategoryWiseExpenses";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import { prepareCategoryWiseExpenseData } from "../../utils/helper";

import { useUserAuth } from "../../hooks/useUserAuth";
import DeleteAlert from "../../components/DeleteAlert";
import toast from "react-hot-toast";

import { API_PATHS } from "../../utils/apiPaths";

const Expense = () => {
    useUserAuth();

    const [expenseData, setExpenseData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [openDeleteAlert, setOpenDeleteAlert] = useState({
        show: false,
        data: null,
    });

    const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);

    // Reference to trigger refresh in ExpenseList
    const expenseListRef = useRef(null);

    // Get All Expense Details (for overview only - not paginated)
    const fetchExpenseDetails = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get(
                API_PATHS.EXPENSE.GET_ALL_EXPENSE
            );
            if (response.data) {
                setExpenseData(response.data);
            }
        } catch (error) {
            console.log("Something went wrong. Please try again.", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle Add Expense
    const handleAddExpense = async (expense) => {
        const { category, amount, date, icon } = expense;

        // Validation Checks
        if (!category.trim()) {
            toast.error("Category is required.");
            return;
        }

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            toast.error("Amount should be a valid number greater than 0.");
            return;
        }

        if (!date) {
            toast.error("Date is required.");
            return;
        }

        try {
            await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
                category,
                amount,
                date,
                icon,
            });
            setOpenAddExpenseModal(false);
            toast.success("Expense added successfully");

            // Refresh both overview and list
            fetchExpenseDetails();
            if (expenseListRef.current) {
                expenseListRef.current.refreshData();
            }
        } catch (error) {
            console.error(
                "Error adding expense:",
                error.response?.data?.message || error.message
            );
        }
    };

    // bulk add expense
    const bulkAddExpense = async (expenses) => {
        try {
            const response = await axiosInstance.post(
                API_PATHS.EXPENSE.BULK_ADD,
                {
                    expenses,
                }
            );

            setOpenAddExpenseModal(false);
            toast.success("Expense added successfully");

            // Refresh both overview and list
            fetchExpenseDetails();
            if (expenseListRef.current) {
                expenseListRef.current.refreshData();
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    };

    // Delete Expense
    const deleteExpense = async (id) => {
        try {
            await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));
            setOpenDeleteAlert({ show: false, data: null });
            toast.success("Expense details deleted successfully");

            // Refresh both overview and list
            fetchExpenseDetails();
            if (expenseListRef.current) {
                expenseListRef.current.refreshData();
            }
        } catch (error) {
            console.error(
                "Error deleting expense:",
                error.response?.data?.message || error.message
            );
            toast.error("Failed to delete expense. Please try again.");
        }
    };

    // handle download expense details
    const handleDownloadExpenseDetails = async () => {
        try {
            const response = await axiosInstance.get(
                API_PATHS.EXPENSE.DOWNLOAD_EXPENSE,
                { responseType: "blob" }
            );

            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "expense_details.xlsx");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading expense details:", error);
            toast.error(
                "Failed to download expense details. Please try again."
            );
        }
    };

    useEffect(() => {
        fetchExpenseDetails();
        return () => {};
    }, []);

    return (
        <DashboardLayout activeMenu="Expense">
            <div className="my-5 mx-auto">
                <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_3.5fr] gap-5">
                        {/* Category-wise Expenses Pie Chart */}
                        <CategoryWiseExpenses
                            transactions={expenseData.transactions || []}
                        />

                        {/* Expense Overview */}
                        <div className="">
                            <ExpenseOverview
                                transactions={expenseData.transactions || []}
                                onAddExpense={() =>
                                    setOpenAddExpenseModal(true)
                                }
                            />
                        </div>
                    </div>

                    <ExpenseList
                        ref={expenseListRef}
                        onDelete={(id) => {
                            setOpenDeleteAlert({ show: true, data: id });
                        }}
                        onDownload={handleDownloadExpenseDetails}
                    />
                </div>
                <Modal
                    isOpen={openAddExpenseModal}
                    onClose={() => setOpenAddExpenseModal(false)}
                    title="Add Expense"
                >
                    <AddExpenseForm
                        onAddExpense={handleAddExpense}
                        onBulkAddExpense={bulkAddExpense}
                        fetchExpenses={fetchExpenseDetails}
                    />
                </Modal>
                <Modal
                    isOpen={openDeleteAlert.show}
                    onClose={() =>
                        setOpenDeleteAlert({ show: false, data: null })
                    }
                    title="Delete Expense"
                >
                    <DeleteAlert
                        content="Are you sure you want to delete this expense and its details?"
                        onDelete={() => deleteExpense(openDeleteAlert.data)}
                    />
                </Modal>
            </div>
        </DashboardLayout>
    );
};
export default Expense;
