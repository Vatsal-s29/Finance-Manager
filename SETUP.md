# Setup

## Prerequisites

-   Node.js (v16+)
-   npm

## Project Structure

```
project/
├── backend/
├── frontend/
│   └── expense-tracker/
└── receipt-processor/
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Vatsal-s29/Finance-Manager
cd Finance-Manager
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd frontend/expense-tracker
npm install
```

4. Install receipt processor dependencies:

```bash
cd receipt-processor
npm install express multer tesseract.js cors node-fetch dotenv
```

## Running the Application

1. Start the backend:

```bash
cd backend
npm start
```

2. Start the expense tracker (in a new terminal):

```bash
cd frontend/expense-tracker
npm run dev
```

3. Start the receipt processor (in a new terminal):

```bash
cd receipt-processor
node processor.js
```

## Dependencies

Backend includes:

-   Express.js for server
-   Multer for file uploads
-   Tesseract.js for OCR
-   Papa Parse for CSV processing
-   XLSX for Excel files
