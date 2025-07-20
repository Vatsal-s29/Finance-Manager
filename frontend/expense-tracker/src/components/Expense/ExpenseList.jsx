import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react";
import moment from "moment";
import { LuDownload, LuSearch, LuCalendar, LuDollarSign } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const ExpenseList = forwardRef(({ onDelete, onDownload }, ref) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
    });

    // Search filters
    const [filters, setFilters] = useState({
        category: "",
        dateRange: "all", // all, lastWeek, lastMonth, lastYear, custom
        startDate: "",
        endDate: "",
        minAmount: "",
        maxAmount: "",
    });

    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

    // Date range options
    const dateRangeOptions = [
        { value: "all", label: "All Time" },
        { value: "lastWeek", label: "Last Week" },
        { value: "lastMonth", label: "Last Month" },
        { value: "lastYear", label: "Last Year" },
        { value: "custom", label: "Custom Range" },
    ];

    // Fetch transactions from backend
    const fetchTransactions = async (page = 1, searchFilters = filters) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: pagination.itemsPerPage.toString(),
                ...searchFilters,
            });

            // Remove empty filters
            Object.keys(searchFilters).forEach((key) => {
                if (!searchFilters[key] || searchFilters[key] === "all") {
                    queryParams.delete(key);
                }
            });

            const response = await axiosInstance.get(
                `${API_PATHS.EXPENSE.GET_ALL_EXPENSE}?${queryParams}`
            );
            const data = response.data;

            if (response.status === 200) {
                setTransactions(data.transactions || []);
                setPagination({
                    currentPage: data.currentPage || 1,
                    totalPages: data.totalPages || 1,
                    totalItems: data.totalItems || 0,
                    itemsPerPage: data.itemsPerPage || 10,
                });
            } else {
                console.error("Error fetching transactions:", data.message);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    // Expose refresh method to parent component
    useImperativeHandle(ref, () => ({
        refreshData: () => {
            fetchTransactions(pagination.currentPage, filters);
        },
    }));

    // Initial load
    useEffect(() => {
        fetchTransactions();
    }, []);

    // Handle search
    const handleSearch = () => {
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        fetchTransactions(1, filters);
    };

    // Handle filter change
    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchTransactions(newPage, filters);
        }
    };

    // Clear filters
    const clearFilters = () => {
        const resetFilters = {
            category: "",
            dateRange: "all",
            startDate: "",
            endDate: "",
            minAmount: "",
            maxAmount: "",
        };
        setFilters(resetFilters);
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        fetchTransactions(1, resetFilters);
    };

    // Generate page numbers
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        const { currentPage, totalPages } = pagination;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push("...");
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push("...");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="card">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h5 className="text-lg">All Expenses</h5>
                <button className="card-btn" onClick={onDownload}>
                    <LuDownload className="text-base" /> Download
                </button>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                {/* Basic Search */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by category..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={filters.category}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "category",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Search
                        </button>
                        <button
                            onClick={() =>
                                setShowAdvancedSearch(!showAdvancedSearch)
                            }
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            {showAdvancedSearch ? "Hide" : "Advanced"}
                        </button>
                    </div>
                </div>

                {/* Advanced Search */}
                {showAdvancedSearch && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                        {/* Date Range Filter */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <LuCalendar className="inline mr-1" /> Date
                                    Range
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={filters.dateRange}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "dateRange",
                                            e.target.value
                                        )
                                    }
                                >
                                    {dateRangeOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Date Range */}
                            {filters.dateRange === "custom" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={filters.startDate}
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    "startDate",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={filters.endDate}
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    "endDate",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Amount Range Filter */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <LuDollarSign className="inline mr-1" /> Min
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={filters.minAmount}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "minAmount",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Amount
                                </label>
                                <input
                                    type="number"
                                    placeholder="No limit"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={filters.maxAmount}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "maxAmount",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Summary */}
            <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                <span>
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
                    to{" "}
                    {Math.min(
                        pagination.currentPage * pagination.itemsPerPage,
                        pagination.totalItems
                    )}{" "}
                    of {pagination.totalItems} results
                </span>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    {/* List of Expense Transactions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {transactions.length > 0 ? (
                            transactions.map((expense) => (
                                <TransactionInfoCard
                                    key={expense._id}
                                    title={expense.category}
                                    icon={expense.icon}
                                    date={moment(expense.date).format(
                                        "Do MMM YYYY"
                                    )}
                                    amount={expense.amount}
                                    type="expense"
                                    onDelete={() => onDelete(expense._id)}
                                />
                            ))
                        ) : (
                            <div className="col-span-2 text-center py-8 text-gray-500">
                                No expense transactions found
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            {/* Page Info */}
                            <div className="text-sm text-gray-600">
                                Page {pagination.currentPage} of{" "}
                                {pagination.totalPages}
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center space-x-2">
                                {/* Previous Button */}
                                <button
                                    onClick={() =>
                                        handlePageChange(
                                            pagination.currentPage - 1
                                        )
                                    }
                                    disabled={pagination.currentPage === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                {/* Page Numbers */}
                                <div className="flex space-x-1">
                                    {getPageNumbers().map((page, index) => (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                typeof page === "number" &&
                                                handlePageChange(page)
                                            }
                                            disabled={page === "..."}
                                            className={`px-3 py-1 text-sm rounded-md ${
                                                page === pagination.currentPage
                                                    ? "bg-blue-500 text-white"
                                                    : page === "..."
                                                    ? "cursor-default"
                                                    : "border border-gray-300 hover:bg-gray-50"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                {/* Next Button */}
                                <button
                                    onClick={() =>
                                        handlePageChange(
                                            pagination.currentPage + 1
                                        )
                                    }
                                    disabled={
                                        pagination.currentPage ===
                                        pagination.totalPages
                                    }
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
});

ExpenseList.displayName = "ExpenseList";

export default ExpenseList;

// import React from "react";
// import moment from "moment";
// import { LuDownload } from "react-icons/lu";
// import TransactionInfoCard from "../Cards/TransactionInfoCard";

// const ExpenseList = ({ transactions, onDelete, onDownload }) => {
//     return (
//         <div className="card">
//             {/* Header */}
//             <div className="flex items-center justify-between">
//                 <h5 className="text-lg">All Expenses</h5>

//                 <button className="card-btn " onClick={onDownload}>
//                     <LuDownload className="text-base" /> Download
//                 </button>
//             </div>

//             {/* List of Expense Transactions */}
//             <div className="grid grid-cols-1 md:grid-cols-2">
//                 {transactions?.map((expense) => (
//                     <TransactionInfoCard
//                         key={expense._id}
//                         title={expense.category}
//                         icon={expense.icon}
//                         date={moment(expense.date).format("Do MMM YYYY")}
//                         amount={expense.amount}
//                         type="expense"
//                         onDelete={() => onDelete(expense._id)}
//                     />
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default ExpenseList;
