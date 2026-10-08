const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

// POST /api/users/login
router.post("/login", async (req, res) => {
    const { username, password, region } = req.body;

    try {
        let user = await User.findOne({ username });

        if (!user) {
            // Create a new user with required fields
            user = new User({ 
                username, 
                password,
                region: region || "NA" // Default to "NA" if region isn't passed during quick signup
            });
            await user.save();

            req.session.login = true;
            req.session.username = username;
            return res.json({ success: true, isNewUser: true, message: "New user created!" });
        }

        // Validate password for existing user
        if (user.password === password) {
            req.session.login = true;
            req.session.username = username;
            return res.json({ success: true, isNewUser: false, message: "Logged in successfully!" });
        } else {
            return res.status(401).json({ success: false, message: "Incorrect password." });
        }
    } catch (error) {
        console.error("Login error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({ 
                success: false, 
                message: `Validation Error: ${error.message}` 
            });
        }

        return res.status(500).json({ success: false, message: "Server error during login." });
    }
});

module.exports = router;