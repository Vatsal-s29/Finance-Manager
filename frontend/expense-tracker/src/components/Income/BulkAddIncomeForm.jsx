import React, { useState } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";

const BulkAddIncomeForm = ({ onBulkAddIncome }) => {
    const [bulkData, setBulkData] = useState("");
    const [parseMethod, setParseMethod] = useState("json");
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [error, setError] = useState("");

    // Validate income entry
    const validateIncomeEntry = (income, index) => {
        if (!income.source || !income.amount || !income.date) {
            throw new Error(
                `Entry ${
                    index + 1
                }: Missing required fields (source, amount, date)`
            );
        }

        if (
            isNaN(parseFloat(income.amount)) ||
            parseFloat(income.amount) <= 0
        ) {
            throw new Error(
                `Entry ${index + 1}: Amount must be a valid positive number`
            );
        }

        const date = new Date(income.date);
        if (isNaN(date.getTime())) {
            throw new Error(`Entry ${index + 1}: Invalid date format`);
        }
    };

    // Parse JSON data
    const parseJSON = (data) => {
        try {
            const parsed = JSON.parse(data);
            const incomes = Array.isArray(parsed) ? parsed : [parsed];

            return incomes.map((income, index) => {
                validateIncomeEntry(income, index);
                return {
                    icon: income.icon || "",
                    source: income.source.trim(),
                    amount: parseFloat(income.amount),
                    date: income.date,
                };
            });
        } catch (error) {
            throw new Error(`JSON Parse Error: ${error.message}`);
        }
    };

    // Handle file upload (CSV/Excel)
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        setError("");

        const fileExtension = file.name.split(".").pop().toLowerCase();

        if (fileExtension === "csv") {
            // Parse CSV
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    try {
                        const incomes = results.data.map((row, index) => {
                            // Map common CSV headers
                            const income = {
                                source:
                                    row.source ||
                                    row.Source ||
                                    row.income_source ||
                                    row["Income Source"],
                                amount: row.amount || row.Amount,
                                date: row.date || row.Date,
                                icon:
                                    row.icon ||
                                    row.Icon ||
                                    row.emoji ||
                                    row.Emoji,
                            };

                            validateIncomeEntry(income, index);
                            return {
                                ...income,
                                icon: income.icon || "",
                                source: income.source.trim(),
                                amount: parseFloat(income.amount),
                            };
                        });

                        setPreviewData(incomes);
                        setShowPreview(true);
                        setBulkData(JSON.stringify(incomes, null, 2));
                        setParseMethod("json");
                    } catch (error) {
                        setError(error.message);
                    }
                    setIsProcessing(false);
                },
                error: (error) => {
                    setError(`CSV Parse Error: ${error.message}`);
                    setIsProcessing(false);
                },
            });
        } else if (fileExtension === "xlsx" || fileExtension === "xls") {
            // Parse Excel
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    const incomes = jsonData.map((row, index) => {
                        // Map common Excel headers
                        const income = {
                            source:
                                row.source ||
                                row.Source ||
                                row.income_source ||
                                row["Income Source"],
                            amount: row.amount || row.Amount,
                            date: row.date || row.Date,
                            icon:
                                row.icon || row.Icon || row.emoji || row.Emoji,
                        };

                        validateIncomeEntry(income, index);
                        return {
                            ...income,
                            icon: income.icon || "",
                            source: income.source.trim(),
                            amount: parseFloat(income.amount),
                        };
                    });

                    setPreviewData(incomes);
                    setShowPreview(true);
                    setBulkData(JSON.stringify(incomes, null, 2));
                    setParseMethod("json");
                } catch (error) {
                    setError(`Excel Parse Error: ${error.message}`);
                }
                setIsProcessing(false);
            };
            reader.readAsArrayBuffer(file);
        } else {
            setError("Unsupported file format. Please use CSV or Excel files.");
            setIsProcessing(false);
        }
    };

    // Preview data from text input
    const handlePreview = () => {
        try {
            setError("");
            let incomes = [];

            if (parseMethod === "json") {
                incomes = parseJSON(bulkData);
            } else if (parseMethod === "csv") {
                // Parse CSV from text
                const results = Papa.parse(bulkData, {
                    header: true,
                    skipEmptyLines: true,
                });

                incomes = results.data.map((row, index) => {
                    const income = {
                        source: row.source || row.Source,
                        amount: row.amount || row.Amount,
                        date: row.date || row.Date,
                        icon: row.icon || row.Icon,
                    };

                    validateIncomeEntry(income, index);
                    return {
                        ...income,
                        icon: income.icon || "💵",
                        source: income.source.trim(),
                        amount: parseFloat(income.amount),
                    };
                });
            }

            setPreviewData(incomes);
            setShowPreview(true);
        } catch (error) {
            setError(error.message);
            setShowPreview(false);
        }
    };

    // Submit bulk data
    const handleSubmit = () => {
        if (previewData.length === 0) {
            setError("No valid data to submit. Please preview first.");
            return;
        }

        onBulkAddIncome(previewData);
    };

    // Sample data templates
    const sampleJSON = `[
  {
    "source": "Job",
    "amount": 4500,
    "date": "2025-07-01"
  },
  {
    "source": "YouTube",
    "amount": 850,
    "date": "2025-07-03"
  }
]`;

    const sampleCSV = `source,amount,date
Job,4500,2025-07-01
YouTube,850,2025-07-03
Freelancing,1200,2025-07-05`;

    return (
        <div className={`flex gap-6 ${showPreview ? "min-w-[900px]" : ""}`}>
            {/* Left Panel - Form */}
            <div
                className={`space-y-6 ${
                    showPreview ? "flex-shrink-0 w-96" : "w-full"
                }`}
            >
                {/* Parse Method Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Format
                    </label>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="parseMethod"
                                value="json"
                                checked={parseMethod === "json"}
                                onChange={(e) => setParseMethod(e.target.value)}
                                className="mr-2"
                            />
                            JSON
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="parseMethod"
                                value="csv"
                                checked={parseMethod === "csv"}
                                onChange={(e) => setParseMethod(e.target.value)}
                                className="mr-2"
                            />
                            CSV Text
                        </label>
                    </div>
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload File (CSV/Excel)
                    </label>
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                {/* Text Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Or Paste Data
                    </label>
                    <textarea
                        value={bulkData}
                        onChange={(e) => setBulkData(e.target.value)}
                        placeholder={
                            parseMethod === "json" ? sampleJSON : sampleCSV
                        }
                        rows={showPreview ? 8 : 10}
                        className="w-full p-3 border border-gray-300 rounded-md text-sm font-mono"
                    />
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                    <button
                        type="button"
                        onClick={handlePreview}
                        disabled={isProcessing || !bulkData.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                    >
                        {isProcessing ? "Processing..." : "Preview"}
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isProcessing || !bulkData.trim()}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300"
                    >
                        Add {previewData.length} Incomes
                    </button>
                </div>
            </div>

            {/* Right Panel - Preview Table */}
            {showPreview && previewData.length > 0 && (
                <div className="flex-1 border-l border-gray-200 pl-6">
                    <h3 className="text-lg font-medium mb-3">
                        Preview ({previewData.length} entries)
                    </h3>
                    <div className="h-96 overflow-y-auto border border-gray-300 rounded-lg">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">
                                        Icon
                                    </th>
                                    <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">
                                        Source
                                    </th>
                                    <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">
                                        Amount
                                    </th>
                                    <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.map((income, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-2 border-b text-center text-xl">
                                            💵
                                        </td>

                                        <td className="px-4 py-2 border-b text-sm">
                                            {income.source}
                                        </td>
                                        <td className="px-4 py-2 border-b text-sm font-medium text-green-600">
                                            ${income.amount}
                                        </td>
                                        <td className="px-4 py-2 border-b text-sm">
                                            {income.date}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkAddIncomeForm;
