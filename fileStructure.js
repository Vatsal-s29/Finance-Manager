// listFiles.js
const fs = require("fs");
const path = require("path");

function listDir(dirPath, indent = "") {
    const items = fs.readdirSync(dirPath);
    items.forEach((item) => {
        // Skip node_modules and .git directories
        if (item === "node_modules" || item === ".git") return;

        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            console.log(indent + "📁 " + item);
            listDir(fullPath, indent + "  ");
        } else {
            console.log(indent + "📄 " + item);
        }
    });
}

console.log("Current Directory Structure:\n");
listDir(".");
