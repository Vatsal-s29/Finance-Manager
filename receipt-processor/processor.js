const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "uploads/";
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(
            path.extname(file.originalname).toLowerCase()
        );
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// OpenRouter AI configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY not found in environment variables");
    process.exit(1);
}

// AI-powered receipt analysis using OpenRouter
async function analyzeReceiptWithAI(receiptText) {
    try {
        // Log the text being sent to AI
        console.log("=== TEXT BEING SENT TO AI ===");
        console.log(receiptText);
        console.log("=== END OF TEXT ===");

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "http://localhost:5000",
                    "X-Title": "Receipt Processing Server",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "microsoft/mai-ds-r1:free",
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are an expert receipt analyzer. Extract information from receipt text and return ONLY a valid JSON object with these exact fields: category, amount, date. \n\nCategories must be one of: 'Food & Dining', 'Groceries', 'Gas & Fuel', 'Shopping', 'Healthcare', 'Transportation', 'Entertainment', 'Utilities', 'Other'. \n\nFor categorization: \n- 'Food & Dining': restaurants, cafes, fast food, food delivery, bars, coffee shops, bakeries, OR any receipt containing food/drink items like: tea, coffee, beef, chicken, pizza, burger, sandwich, salad, rice, bread, milk, eggs, fruits, vegetables, meat, seafood, beverages, etc.\n- 'Groceries': supermarkets, grocery stores, food markets, OR receipts with multiple food items for home consumption\n- Look for food/drink item names in the receipt text, not just merchant names\n\nAmount should be a number without currency symbols. Date should be in MM/DD/YYYY format if found, or empty string if not found. If any field is unknown or cannot be determined, return empty string for that field.",
                        },
                        {
                            role: "user",
                            content: `Analyze this receipt text and extract the information. Pay special attention to individual food/drink items mentioned (like tea, beef, chicken, coffee, etc.) to determine if this should be categorized as 'Food & Dining' or 'Groceries'. Return empty string for any unknown fields:\n\n${receiptText}`,
                        },
                    ],
                    temperature: 0.1,
                    max_tokens: 200,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content.trim();

        // Also log the AI response for debugging
        console.log("=== AI RESPONSE ===");
        console.log(aiResponse);
        console.log("=== END AI RESPONSE ===");

        // Try to parse the AI response as JSON
        try {
            const parsedResponse = JSON.parse(aiResponse);
            return {
                category: parsedResponse.category || "",
                amount: parsedResponse.amount || "",
                date: parsedResponse.date || "",
            };
        } catch (parseError) {
            console.log(
                "AI response parsing failed, falling back to regex patterns"
            );
            // Fallback to regex patterns if AI response isn't valid JSON
            return {
                category: fallbackCategorizeReceipt(receiptText) || "",
                amount: fallbackExtractAmount(receiptText) || "",
                date: fallbackExtractDate(receiptText) || "",
            };
        }
    } catch (error) {
        console.log(
            "AI analysis failed, using fallback methods:",
            error.message
        );
        // Fallback to regex patterns if AI fails
        return {
            category: fallbackCategorizeReceipt(receiptText) || "",
            amount: fallbackExtractAmount(receiptText) || "",
            date: fallbackExtractDate(receiptText) || "",
        };
    }
}

// Fallback function to extract date from text (regex patterns)
function fallbackExtractDate(text) {
    const datePatterns = [
        /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
        /\b\d{1,2}-\d{1,2}-\d{2,4}\b/g,
        /\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/g,
        /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}\b/gi,
        /\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}\b/gi,
    ];

    for (let pattern of datePatterns) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
            return matches[0];
        }
    }

    return "";
}

// Fallback function to extract amount from text (regex patterns)
function fallbackExtractAmount(text) {
    const amountPatterns = [
        /\$\s*\d+\.?\d{0,2}/g,
        /\b\d+\.\d{2}\b/g,
        /(?:total|amount|sum)[\s:]*\$?\s*(\d+\.?\d{0,2})/gi,
        /\b\d+\.\d{2}(?=\s*(?:total|$|\n))/gi,
    ];

    const amounts = [];

    for (let pattern of amountPatterns) {
        const matches = text.match(pattern);
        if (matches) {
            amounts.push(...matches);
        }
    }

    if (amounts.length > 0) {
        // Return the largest amount found (likely the total)
        const amount = amounts
            .map((amount) => parseFloat(amount.replace(/[^0-9.]/g, "")))
            .filter((amount) => !isNaN(amount))
            .sort((a, b) => b - a)[0];
        return amount || "";
    }

    return "";
}

// Fallback function to categorize receipt based on text content (keyword matching)
function fallbackCategorizeReceipt(text) {
    const categories = {
        "Food & Dining": [
            // Restaurants and food places
            "restaurant",
            "cafe",
            "food",
            "pizza",
            "burger",
            "coffee",
            "starbucks",
            "mcdonalds",
            "subway",
            "dominos",
            "kfc",
            "taco bell",
            "wendys",
            "chipotle",
            "panera",
            "dunkin",
            "bakery",
            "bistro",
            "deli",
            // Food items
            "tea",
            "beef",
            "chicken",
            "pork",
            "fish",
            "seafood",
            "salmon",
            "shrimp",
            "lamb",
            "turkey",
            "rice",
            "bread",
            "pasta",
            "noodles",
            "soup",
            "salad",
            "sandwich",
            "wrap",
            "burger",
            "pizza",
            "fries",
            "wings",
            "tacos",
            "burrito",
            "quesadilla",
            "nachos",
            "coffee",
            "tea",
            "juice",
            "soda",
            "beer",
            "wine",
            "cocktail",
            "smoothie",
            "shake",
            "dessert",
            "cake",
            "pie",
            "cookie",
            "ice cream",
            "donut",
            "muffin",
            "breakfast",
            "lunch",
            "dinner",
            "brunch",
            "appetizer",
            "entree",
            "main course",
        ],
        Groceries: [
            "grocery",
            "supermarket",
            "walmart",
            "target",
            "costco",
            "safeway",
            "kroger",
            "whole foods",
            "market",
            "fresh",
            "organic",
            "produce",
            "dairy",
            "frozen",
            "canned goods",
            // When multiple food items suggest grocery shopping
            "milk",
            "eggs",
            "butter",
            "cheese",
            "yogurt",
            "fruits",
            "vegetables",
            "meat",
            "deli",
        ],
        "Gas & Fuel": [
            "gas",
            "fuel",
            "shell",
            "exxon",
            "chevron",
            "bp",
            "mobil",
            "station",
            "petrol",
            "diesel",
        ],
        Shopping: [
            "mall",
            "store",
            "shop",
            "amazon",
            "ebay",
            "clothing",
            "electronics",
            "retail",
        ],
        Healthcare: [
            "pharmacy",
            "hospital",
            "clinic",
            "medical",
            "cvs",
            "walgreens",
            "doctor",
            "medicine",
        ],
        Transportation: [
            "uber",
            "lyft",
            "taxi",
            "bus",
            "train",
            "airline",
            "parking",
            "metro",
            "transit",
        ],
        Entertainment: [
            "movie",
            "theater",
            "cinema",
            "concert",
            "show",
            "netflix",
            "spotify",
            "game",
        ],
        Utilities: [
            "electric",
            "water",
            "gas bill",
            "internet",
            "phone",
            "cable",
            "utility",
        ],
    };

    const lowerText = text.toLowerCase();

    // Count matches for each category
    const categoryScores = {};

    for (let [category, keywords] of Object.entries(categories)) {
        categoryScores[category] = 0;
        for (let keyword of keywords) {
            if (lowerText.includes(keyword)) {
                categoryScores[category]++;
                // Give extra weight to food items for better detection
                if (
                    category === "Food & Dining" &&
                    [
                        "tea",
                        "beef",
                        "chicken",
                        "coffee",
                        "rice",
                        "bread",
                    ].includes(keyword)
                ) {
                    categoryScores[category] += 2;
                }
            }
        }
    }

    // Return the category with the highest score
    const bestCategory = Object.entries(categoryScores).sort(
        ([, a], [, b]) => b - a
    )[0];

    return bestCategory[1] > 0 ? bestCategory[0] : "";
}

// Main OCR processing function with AI analysis
async function processReceipt(imagePath) {
    try {
        console.log("Starting OCR processing...");
        const {
            data: { text },
        } = await Tesseract.recognize(imagePath, "eng", {
            logger: (m) => console.log(m),
        });

        console.log("OCR completed, analyzing with AI...");
        const aiAnalysis = await analyzeReceiptWithAI(text);

        const extractedData = {
            category: aiAnalysis.category,
            amount: aiAnalysis.amount,
            date: aiAnalysis.date,
        };

        return extractedData;
    } catch (error) {
        throw new Error(`OCR processing failed: ${error.message}`);
    }
}

// API endpoint to process receipt image
app.post("/api/process-receipt", upload.single("receipt"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No image file provided",
            });
        }

        console.log("Processing receipt:", req.file.filename);

        const extractedData = await processReceipt(req.file.path);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json(extractedData);
    } catch (error) {
        console.error("Error processing receipt:", error);

        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            error: error.message,
        });
    }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Receipt processing server is running",
        timestamp: new Date().toISOString(),
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                error: "File too large. Maximum size is 5MB.",
            });
        }
    }

    res.status(500).json({
        error: error.message,
    });
});

app.listen(PORT, () => {
    console.log(`Receipt processing server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(
        `Upload endpoint: http://localhost:${PORT}/api/process-receipt`
    );
});
