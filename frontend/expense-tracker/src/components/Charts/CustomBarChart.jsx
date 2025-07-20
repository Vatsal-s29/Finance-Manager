import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";

const CustomBarChart = ({ data = [], xAxisDataKey }) => {
    // Function to alternate bar colors
    const getBarColor = (index) => {
        return index % 2 === 0 ? "#875cf5" : "#cfbefb";
    };

    // Custom Tooltip for BarChart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
                    <p className="text-xs font-semibold text-purple-800 mb-1">
                        {data.source || data.category || data[xAxisDataKey]}
                    </p>
                    <p className="text-sm text-gray-600">
                        Amount:{" "}
                        <span className="text-sm font-medium text-gray-900">
                            ${data.amount}
                        </span>
                    </p>
                </div>
            );
        }
        return null;
    };

    // If no data, show empty state
    if (!data || data.length === 0) {
        return (
            <div className="bg-white mt-6 flex items-center justify-center h-[300px]">
                <p className="text-gray-500">No data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white mt-6">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey={xAxisDataKey}
                        tick={{ fontSize: 12, fill: "#555" }}
                        stroke="#ccc"
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: "#555" }}
                        stroke="#ccc"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={getBarColor(index)}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CustomBarChart;

// import React from "react";
// import {
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip,
//     Legend,
//     ResponsiveContainer,
//     Cell,
// } from "recharts";

// const CustomBarChart = ({ data, xAxisDataKey }) => {
//     // Function to alternate bar colors
//     const getBarColor = (index) => {
//         return index % 2 === 0 ? "#875cf5" : "#cfbefb";
//     };

//     // Custom Tooltip for BarChart
//     const CustomTooltip = ({ active, payload }) => {
//         if (active && payload && payload.length) {
//             return (
//                 <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
//                     <p className="text-xs font-semibold text-purple-800 mb-1">
//                         {payload[0].payload.category}
//                     </p>
//                     <p className="text-sm text-gray-600">
//                         Amount:
//                         <span className="text-sm font-medium text-gray-900">
//                             ${payload[0].payload.amount}
//                         </span>
//                     </p>
//                 </div>
//             );
//         }
//         return null;
//     };

//     return (
//         <div className="bg-white mt-6">
//             <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={data}>
//                     <CartesianGrid stroke="none" />
//                     <XAxis
//                         dataKey={xAxisDataKey}
//                         tick={{ fontSize: 12, fill: "#555" }}
//                         stroke="none"
//                     />
//                     <YAxis
//                         tick={{ fontSize: 12, fill: "#555" }}
//                         stroke="none"
//                     />
//                     <Tooltip content={<CustomTooltip />} />
//                     <Bar
//                         dataKey="amount"
//                         fill="#FF8042"
//                         radius={[10, 10, 0, 0]}
//                         activeDot={{ r: 8, fill: "yellow" }}
//                         activeStyle={{ fill: "green" }}
//                     >
//                         {data.map((entry, index) => (
//                             <Cell key={index} fill={getBarColor(index)} />
//                         ))}
//                     </Bar>
//                 </BarChart>
//             </ResponsiveContainer>
//         </div>
//     );
// };

// export default CustomBarChart;
