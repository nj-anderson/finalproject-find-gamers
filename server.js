const express = require("express");
const path = require("path");
require("dotenv").config();


// API ROUTES
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const connectionRoutes = require("./routes/connections");


const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve CSS, JavaScript, and images
app.use(express.static(path.join(__dirname, "public")));

// Pages
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/explore", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "explore.html"));
});

app.get("/profile", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "profile.html"));
});

app.get("/connections", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "connections.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});