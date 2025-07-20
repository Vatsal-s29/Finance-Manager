import moment from "moment";

export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const getInitials = (name) => {
    if (!name) return "";

    const words = name.split(" ");
    let initials = "";

    for (let i = 0; i < Math.min(words.length, 2); i++) {
        initials += words[i][0];
    }

    return initials.toUpperCase();
};

export const addThousandsSeparator = (num) => {
    if (num === null || isNaN(num)) return "";

    const [integerPart, fractionalPart] = num.toString().split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return fractionalPart
        ? `${formattedInteger}.${fractionalPart}`
        : formattedInteger;
};

export const prepareExpenseBarChartData = (data = []) => {
    const chartData = data.map((item) => ({
        category: item?.category,
        amount: item?.amount,
    }));
    return chartData;
};

export const prepareIncomeBarChartData = (data = []) => {
    const sortedData = [...data].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    const chartData = sortedData.map((item) => ({
        month: moment(item?.date).format("Do MMM"),
        amount: item?.amount,
        source: item?.source,
    }));

    return chartData;
};

export const prepareExpenseLineChartData = (data = []) => {
    const sortedData = [...data].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    const chartData = sortedData.map((item) => ({
        month: moment(item?.date).format("Do MMM"),
        amount: item?.amount,
        category: item?.category,
    }));

    return chartData;
};

export const prepareCategoryWiseExpenseData = (transactions) => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
        return [];
    }

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
        const othersTotal = others.reduce((sum, item) => sum + item.amount, 0);
        top5.push({ name: "Others", amount: othersTotal });
    }

    return top5;
};
