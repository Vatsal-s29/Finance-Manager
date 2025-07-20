import React, { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import CustomLineChart from "../charts/CustomLineChart";
import { prepareExpenseLineChartData } from "../../utils/helper";

const ExpenseOverview = ({ transactions, onAddExpense }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        // Check if transactions is a valid array before processing
        if (Array.isArray(transactions)) {
            const result = prepareExpenseLineChartData(transactions);
            setChartData(result);
        } else {
            // If transactions is not an array, set empty array
            setChartData([]);
        }
    }, [transactions]);

    return (
        <div className="card h-125">
            <div className="flex items-center justify-between">
                <div>
                    <h5 className="text-lg">Expense Overview</h5>
                    <h4 className="text-lg">(Temporal) </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Track your spending trends over time and gain insights
                        into where your money goes.
                    </p>
                </div>
                <button className="add-btn" onClick={onAddExpense}>
                    <LuPlus className="text-lg" /> Add Expense
                </button>
            </div>
            <div className="mt-10">
                <CustomLineChart data={chartData} />
            </div>
        </div>
    );
};

export default ExpenseOverview;

// import React, { useEffect, useState } from "react";
// import { LuPlus } from "react-icons/lu";
// import CustomLineChart from "../charts/CustomLineChart";
// import { prepareExpenseLineChartData } from "../../utils/helper";

// const ExpenseOverview = ({ transactions, onAddExpense }) => {
//     const [chartData, setChartData] = useState([]);

//     useEffect(() => {
//         const result = prepareExpenseLineChartData(transactions);
//         setChartData(result);
//         return () => {};
//     }, [transactions]);

//     return (
//         <div className="card">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h5 className="text-lg">Expense Overview</h5>
//                     <p className="text-xs text-gray-400 mt-0.5">
//                         Track your spending trends over time and gain insights int where your money goes.
//                     </p>
//                 </div>
//                 <button className="add-btn" onClick={onAddExpense}>
//                     <LuPlus className="text-lg" /> Add Expense
//                 </button>
//             </div>
//             <div className="mt-10">
//                 <CustomLineChart data={chartData} />
//             </div>
//         </div>
//     );
// };

// export default ExpenseOverview;
