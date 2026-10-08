const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
// API routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const connectionRoutes = require("./routes/connections");
const app = express();
const PORT = process.env.PORT || 3000;
const session = require("express-session");
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Login sessions. The logged-in user's id is stored in req.session.userId.
if (!process.env.SESSION_SECRET) {
    console.warn("SESSION_SECRET is not set in .env; using an insecure development secret.");
}

app.use(session({
    secret: process.env.SESSION_SECRET || "find-gamers-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}));
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/connections", connectionRoutes);

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