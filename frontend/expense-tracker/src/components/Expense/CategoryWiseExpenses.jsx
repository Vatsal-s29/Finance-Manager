import React, { useEffect, useState } from "react";
import CustomPieChart from "../Charts/CustomPieChart";

const CategoryWiseExpenses = ({ transactions }) => {
    const [pieChartData, setPieChartData] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    const prepareCategoryWiseExpenseData = (transactions) => {
        if (!Array.isArray(transactions) || transactions.length === 0) {
            return { data: [], total: 0 };
        }

        // Calculate total amount
        const total = transactions.reduce((sum, transaction) => {
            return sum + (parseFloat(transaction.amount) || 0);
        }, 0);

        // Group by category and sum amounts
        const categoryTotals = transactions.reduce((acc, transaction) => {
            const category = transaction.category || "Uncategorized";
            const amount = parseFloat(transaction.amount) || 0;

            if (acc[category]) {
                acc[category] += amount;
            } else {
                acc[category] = amount;
            }
            return acc;
        }, {});

        // Convert to array and sort by amount (descending)
        const sortedCategories = Object.entries(categoryTotals)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount);

        // Get top 5 and group rest as "Others"
        const top5 = sortedCategories.slice(0, 5);
        const others = sortedCategories.slice(5);

        if (others.length > 0) {
            const othersTotal = others.reduce(
                (sum, item) => sum + item.amount,
                0
            );
            top5.push({ name: "Others", amount: othersTotal });
        }

        return { data: top5, total };
    };

    useEffect(() => {
        if (Array.isArray(transactions)) {
            const result = prepareCategoryWiseExpenseData(transactions);
            setPieChartData(result.data);
            setTotalAmount(result.total);
        } else {
            setPieChartData([]);
            setTotalAmount(0);
        }
    }, [transactions]);

    
    return (
        <div className="card">
            <div className="mb-4">
                <h5 className="text-lg">Category-wise Expenses</h5>
                <p className="text-xs text-gray-400 mt-0.5">
                    Top 5 spending categories
                </p>
            </div>
            <div className="flex-1">
                <CustomPieChart
                    data={pieChartData}
                    label="Total Expenses"
                    totalAmount={`₹${totalAmount.toFixed(2)}`}
                    colors={[
                        "#8884d8",
                        "#82ca9d",
                        "#ffc658",
                        "#ff7c7c",
                        "#8dd1e1",
                        "#d084d0",
                    ]}
                    showTextAnchor={true}
                />
            </div>
        </div>
    );
};

export default CategoryWiseExpenses;
