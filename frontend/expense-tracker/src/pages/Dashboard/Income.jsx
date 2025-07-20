import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import IncomeOverview from "../../components/Income/IncomeOverview";
import axiosInstance from "../../utils/axiosInstance";
import Modal from "../../components/Modal";
import AddIncomeForm from "../../components/Income/AddIncomeForm";
import IncomeList from "../../components/Income/IncomeList";
import DeleteAlert from "../../components/DeleteAlert";
import toast from "react-hot-toast";
import { useUserAuth } from "../../hooks/useUserAuth";

import { API_PATHS } from "../../utils/apiPaths";

const Income = () => {
    useUserAuth();

    const [incomeData, setIncomeData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState({
        show: false,
        data: null,
    });
    const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);

    // Reference to trigger refresh in IncomeList
    const incomeListRef = useRef(null);

    // Get All Income Details (for overview only - not paginated)
    const fetchIncomeDetails = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get(
                API_PATHS.INCOME.GET_ALL_INCOME
            );
            if (response.data) {
                setIncomeData(response.data);
            }
        } catch (error) {
            console.log("Something went wrong. Please try again.", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle Add Income
    const handleAddIncome = async (income) => {
        const { source, amount, date, icon } = income;

        // Validation Checks
        if (!source.trim()) {
            toast.error("Source is required.");
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
            await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, {
                source,
                amount,
                date,
                icon,
            });
            setOpenAddIncomeModal(false);
            toast.success("Income added successfully");

            // Refresh both overview and list
            fetchIncomeDetails();
            if (incomeListRef.current) {
                incomeListRef.current.refreshData();
            }
        } catch (error) {
            console.error(
                "Error adding income:",
                error.response?.data?.message || error.message
            );
        }
    };

    // bulk add income
    const bulkAddIncome = async (incomes) => {
        try {
            const response = await axiosInstance.post(
                API_PATHS.INCOME.BULK_ADD,
                {
                    incomes,
                }
            );

            setOpenAddIncomeModal(false);
            toast.success("Income added successfully");

            // Refresh both overview and list
            fetchIncomeDetails();
            if (incomeListRef.current) {
                incomeListRef.current.refreshData();
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    };

    // Delete Income
    const deleteIncome = async (id) => {
        try {
            await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));
            setOpenDeleteAlert({ show: false, data: null });
            toast.success("Income details deleted successfully");

            // Refresh both overview and list
            fetchIncomeDetails();
            if (incomeListRef.current) {
                incomeListRef.current.refreshData();
            }
        } catch (error) {
            console.error(
                "Error deleting income:",
                error.response?.data?.message || error.message
            );
            toast.error("Failed to delete income. Please try again.");
        }
    };

    // handle download income details
    const handleDownloadIncomeDetails = async () => {
        try {
            const response = await axiosInstance.get(
                API_PATHS.INCOME.DOWNLOAD_INCOME,
                { responseType: "blob" }
            );

            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "income_details.xlsx");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading income details:", error);
            toast.error("Failed to download income details. Please try again.");
        }
    };

    useEffect(() => {
        fetchIncomeDetails();
        return () => {};
    }, []);
    // console.log("Parent component - incomeData:", incomeData);

    return (
        <DashboardLayout activeMenu="Income">
            <div className="my-5 mx-auto">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <IncomeOverview
                            transactions={incomeData.transactions || []}
                            onAddIncome={() => setOpenAddIncomeModal(true)}
                        />
                    </div>

                    <IncomeList
                        ref={incomeListRef}
                        onDelete={(id) => {
                            setOpenDeleteAlert({
                                show: true,
                                data: id,
                            });
                        }}
                        onDownload={handleDownloadIncomeDetails}
                    />
                </div>

                <Modal
                    isOpen={openAddIncomeModal}
                    onClose={() => setOpenAddIncomeModal(false)}
                    title="Add Income"
                >
                    <AddIncomeForm
                        onAddIncome={handleAddIncome}
                        onBulkAddIncome={bulkAddIncome}
                        fetchIncomes={fetchIncomeDetails}
                    />
                </Modal>

                <Modal
                    isOpen={openDeleteAlert.show}
                    onClose={() =>
                        setOpenDeleteAlert({ show: false, data: null })
                    }
                    title="Delete Income"
                >
                    <DeleteAlert
                        content="Are you sure you want to delete this income and its details?"
                        onDelete={() => deleteIncome(openDeleteAlert.data)}
                    />
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default Income;

// import React, { useState, useEffect } from "react";
// import DashboardLayout from "../../components/layouts/DashboardLayout";
// import IncomeOverview from "../../components/Income/IncomeOverview";
// import axiosInstance from "../../utils/axiosInstance";
// import Modal from "../../components/Modal";
// import AddIncomeForm from "../../components/Income/AddIncomeForm";
// import IncomeList from "../../components/Income/IncomeList";
// import DeleteAlert from "../../components/DeleteAlert";
// import toast from "react-hot-toast";
// import { useUserAuth } from "../../hooks/useUserAuth";

// import { API_PATHS } from "../../utils/apiPaths";

// const Income = () => {
//     useUserAuth();

//     const [incomeData, setIncomeData] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [openDeleteAlert, setOpenDeleteAlert] = useState({
//         show: false,
//         data: null,
//     });
//     const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);

//     // Get All Income Details
//     const fetchIncomeDetails = async () => {
//         if (loading) return;
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(
//                 API_PATHS.INCOME.GET_ALL_INCOME
//             );
//             if (response.data) {
//                 setIncomeData(response.data);
//             }
//         } catch (error) {
//             console.log("Something went wrong. Please try again.", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Handle Add Income
//     const handleAddIncome = async (income) => {
//         const { source, amount, date, icon } = income;

//         // Validation Checks
//         if (!source.trim()) {
//             toast.error("Source is required.");
//             return;
//         }

//         if (!amount || isNaN(amount) || Number(amount) <= 0) {
//             toast.error("Amount should be a valid number greater than 0.");
//             return;
//         }

//         if (!date) {
//             toast.error("Date is required.");
//             return;
//         }

//         try {
//             await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, {
//                 source,
//                 amount,
//                 date,
//                 icon,
//             });
//             setOpenAddIncomeModal(false);
//             toast.success("Income added successfully");
//             fetchIncomeDetails();
//         } catch (error) {
//             console.error(
//                 "Error adding income:",
//                 error.response?.data?.message || error.message
//             );
//         }
//     };

//     // bulk add income
//     const bulkAddIncome = async (incomes) => {
//         try {
//             const response = await axiosInstance.post(
//                 API_PATHS.INCOME.BULK_ADD,
//                 {
//                     incomes,
//                 }
//             );

//             setOpenAddIncomeModal(false);
//             toast.success("Income added successfully");
//             fetchIncomeDetails();

//             return response.data;
//         } catch (error) {
//             throw error;
//         }
//     };

//     // Delete Income
//     const deleteIncome = async (id) => {
//         try {
//             await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));
//             setOpenDeleteAlert({ show: false, data: null });
//             toast.success("Income details deleted successfully");
//             fetchIncomeDetails();
//         } catch (error) {
//             console.error(
//                 "Error deleting income:",
//                 error.response?.data?.message || error.message
//             );
//         }
//     };

//     // handle download income details
//     const handleDownloadIncomeDetails = async () => {
//         try {
//             const response = await axiosInstance.get(
//                 API_PATHS.INCOME.DOWNLOAD_INCOME,
//                 { responseType: "blob" }
//             );

//             // Create a URL for the blob
//             const url = window.URL.createObjectURL(new Blob([response.data]));
//             const link = document.createElement("a");
//             link.href = url;
//             link.setAttribute("download", "income_details.xlsx");
//             document.body.appendChild(link);
//             link.click();
//             link.parentNode.removeChild(link);
//             window.URL.revokeObjectURL(url);
//         } catch (error) {
//             console.error("Error downloading income details:", error);
//             toast.error("Failed to download income details. Please try again.");
//         }
//     };

//     useEffect(() => {
//         fetchIncomeDetails();
//         return () => {};
//     }, []);

//     return (
//         <DashboardLayout activeMenu="Income">
//             <div className="my-5 mx-auto">
//                 <div className="grid grid-cols-1 gap-6">
//                     <div>
//                         <IncomeOverview
//                             transactions={incomeData}
//                             onAddIncome={() => setOpenAddIncomeModal(true)}
//                         />
//                     </div>

//                     <IncomeList
//                         transactions={incomeData}
//                         onDelete={(id) => {
//                             setOpenDeleteAlert({
//                                 show: true,
//                                 data: id,
//                             });
//                         }}
//                         onDownload={handleDownloadIncomeDetails}
//                     />
//                 </div>

//                 <Modal
//                     isOpen={openAddIncomeModal}
//                     onClose={() => setOpenAddIncomeModal(false)}
//                     title="Add Income"
//                 >
//                     <AddIncomeForm
//                         onAddIncome={handleAddIncome}
//                         onBulkAddIncome={bulkAddIncome}
//                         fetchIncomes={fetchIncomeDetails}
//                     />
//                 </Modal>

//                 <Modal
//                     isOpen={openDeleteAlert.show}
//                     onClose={() =>
//                         setOpenDeleteAlert({ show: false, data: null })
//                     }
//                     title="Delete Income"
//                 >
//                     <DeleteAlert
//                         content="Are you sure you want to delete this income and its details?"
//                         onDelete={() => deleteIncome(openDeleteAlert.data)}
//                     />
//                 </Modal>
//             </div>
//         </DashboardLayout>
//     );
// };

// export default Income;
