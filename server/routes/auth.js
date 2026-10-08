const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

const SALT_ROUNDS = 10;

// bcrypt hashes start with $2a$, $2b$ or $2y$
function isHashed(password) {
    return /^\$2[aby]\$/.test(password);
}

/*
    Checks a password against the stored one.

    Accounts made before hashing was added still have
    plain-text passwords. Those are compared directly and
    upgraded to a hash the first time the user logs in.
*/
async function checkPassword(user, password) {
    if (isHashed(user.password)) {
        return bcrypt.compare(password, user.password);
    }

    if (user.password !== password) {
        return false;
    }

    user.password = await bcrypt.hash(password, SALT_ROUNDS);
    await user.save();

    return true;
}

/*
    Logs the user in by saving their id in the session.
    A fresh session is made so an old session id can't
    be reused after logging in.
*/
function startSession(req, user) {
    return new Promise((resolve, reject) => {
        req.session.regenerate((error) => {
            if (error) {
                return reject(error);
            }

            req.session.userId = user._id.toString();
            req.session.username = user.username;

            req.session.save((saveError) =>
                saveError ? reject(saveError) : resolve()
            );
        });
    });
}

// The user sent back to the client (never the password)
function publicUser(user) {
    const result = user.toObject();
    delete result.password;
    return result;
}


// POST /api/auth/login
// Logs in, or creates the account if the username is new.
router.post("/login", async (req, res) => {
    const { username, password, region } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Please fill in both username and password"
        });
    }

    try {
        let user = await User.findOne({ username });

        if (!user) {
            // Create a new user with required fields
            user = new User({
                username,
                password: await bcrypt.hash(password, SALT_ROUNDS),
                region: region || "NA" // Default to "NA" if region isn't passed during quick signup
            });
            await user.save();

            await startSession(req, user);
            return res.json({
                success: true,
                isNewUser: true,
                message: "New user created!",
                user: publicUser(user)
            });
        }

        // Validate password for existing user
        if (await checkPassword(user, password)) {
            await startSession(req, user);
            return res.json({
                success: true,
                isNewUser: false,
                message: "Logged in successfully!",
                user: publicUser(user)
            });
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


// POST /api/auth/logout
router.post("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error("Logout error:", error);
            return res.status(500).json({ success: false, message: "Failed to log out." });
        }

        res.clearCookie("connect.sid");
        res.json({ success: true, message: "Logged out." });
    });
});


// GET /api/auth/me
// Tells the client who is logged in (used when the page loads).
router.get("/me", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: "Not logged in" });
    }

    try {
        const user = await User
            .findById(req.session.userId)
            .select("-password");

        // Account was deleted while logged in
        if (!user) {
            req.session.destroy(() => {});
            return res.status(401).json({ message: "Not logged in" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching current user:", error);
        res.status(500).json({ message: "Failed to fetch current user" });
    }
});

module.exports = router;
