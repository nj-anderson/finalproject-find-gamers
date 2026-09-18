const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();


// API routes naming - basically says which file to find the routes in
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const connectionRoutes = require("./routes/connections");


const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/connections", connectionRoutes);


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


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });


// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});