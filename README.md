# 💰 Personal Finance Assistant App

The Personal Finance Assistant is a full-stack application designed to help
users track, manage, and understand their financial activities. Users can log
income and expenses, categorize transactions, and view summaries of their
spending habits.
✨ Features **AI-powered receipt reading** to automatically extract and process expense details from uploaded receipts.

Note : See [SETUP.md](SETUP.md) for installation and running instructions.

---

## 🚀 **Core Features**

✅ **Basic Features**

-   📥 Add income and expense entries directly via the web app.
-   📅 View all transactions within a selected date range.
-   📊 Interactive graphs (e.g., expenses by category, expenses over time).

✅ **Advanced Features**

-   🧾 **AI-Powered Receipt Processing**: Extract expenses automatically from uploaded receipts (images & PDFs).
-   📂 Upload transaction histories from **CSV** or **Excel** files.
-   📃 Paginated APIs for efficient loading of long transaction lists.
-   👥 Support for multiple user accounts, enabling personalized dashboards.

---

## 🚀 Walkthrough

### 🏠 Dashboard

![Dashboard1](Images/Dashboard1.jpg)
![Dashboard2](Images/Dashboard2.jpg)
![Dashboard3](Images/Dashboard3.jpg)

### 💵 Income Management

![Income1](Images/Income1.jpg)
![Income2](Images/Income2.jpg)
![Income Bulk Insert](Images/Income-Bulk-Insert.jpg)

### 💳 Expense Management

![Expense1](Images/Expense1.jpg)
![Expense2](Images/Expense2.jpg)

### 📄 Add Expenses Using Receipts

![Add Expense Using Receipts](Images/Add-Expense-Using-Receits.jpg)

### 📲 Authentication

![Login](Images/Login.jpg)
![Signup](Images/Signup.jpg)

---

## ⚙️ Components

### 🖥️ Backend

-   API server for expense management
-   Data processing and storage
-   RESTful endpoints

### 📊 Expense Tracker (Frontend)

-   Track daily expenses
-   Categorize transactions
-   View spending analytics
-   Export expense reports
-   User-friendly web interface

### 🤖 AI-Powered Receipt Processor

-   Upload receipt images
-   **AI-powered OCR** (using Tesseract.js) for intelligent receipt data extraction
-   Automatic expense categorization and processing
-   Standalone processing service

---

## 🛠 Technology Stack

### Backend

-   **Express.js** - Web framework
-   **Multer** - File upload handling
-   **Papa Parse** - CSV data processing
-   **XLSX** - Excel file handling
-   **Moment.js** - Date manipulation

### Receipt Processor

-   **Express.js** - Web server
-   **Tesseract.js** - OCR for receipt processing
-   **Multer** - File upload handling
-   **Node-fetch** - HTTP requests
-   **CORS** - Cross-origin resource sharing

### Frontend

-   Modern web interface
-   Responsive design
-   Real-time expense tracking

---

## 🚀 Getting Started

See [SETUP.md](SETUP.md) for installation and running instructions.
