const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Connection = require("../models/Connection");

const router = express.Router();

/*
    GET ALL USERS

    Used by the Explore page.
    Gamertags are left out; they are only
    revealed to accepted connections.
*/
router.get("/", async (req, res) => {

    try {

        const users = await User
            .find()
            .select("-password -gamertags");

        res.json(users);

    } catch (error) {

        console.error(
            "Error fetching users:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch users"
        });

    }

});


/*
    GET ONE USER

    Used when opening somebody's profile.

    Gamertags are only included if the viewer
    (x-user-id, temporary until login is done)
    is this user or an accepted connection.
*/

router.get("/:id", async (req, res) => {

    try {

        if (
            !mongoose.isValidObjectId(
                req.params.id
            )
        ) {

            return res.status(400).json({
                message: "Invalid user id"
            });

        }

        const user = await User
            .findById(req.params.id)
            .select("-password");

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        const currentUserId =
            req.get("x-user-id");

        let canSeeGamertags =
            currentUserId === req.params.id;

        if (
            !canSeeGamertags &&
            mongoose.isValidObjectId(currentUserId)
        ) {

            canSeeGamertags = Boolean(
                await Connection.exists({
                    status: "accepted",
                    $or: [
                        { sender: currentUserId, receiver: req.params.id },
                        { sender: req.params.id, receiver: currentUserId }
                    ]
                })
            );

        }

        const result = user.toObject();

        if (!canSeeGamertags) {
            delete result.gamertags;
        }

        res.json(result);

    } catch (error) {

        console.error(
            "Error fetching profile:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch profile"
        });

    }

});


/*
    UPDATE PROFILE

    The x-user-id part is temporary until
    your authentication teammate finishes
    the login system.

    Later you can replace this with req.user.id.
*/

router.put("/:id", async (req, res) => {

    try {

        const currentUserId =
            req.get("x-user-id");

        /*
            Prevent somebody from editing
            another person's profile.
        */

        if (
            !currentUserId ||
            currentUserId !== req.params.id
        ) {

            return res.status(403).json({
                message:
                    "You can only edit your own profile"
            });

        }

        if (
            !mongoose.isValidObjectId(
                req.params.id
            )
        ) {

            return res.status(400).json({
                message: "Invalid user id"
            });

        }

        /*
            Only these fields are allowed
            to be changed.
        */

        const allowedFields = [
            "username",
            "profilePicture",
            "bio",
            "region",
            "platforms",
            "gamertags",
            "games"
        ];

        const updates = {};

        for (const field of allowedFields) {

            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }

        }

        const user =
            await User.findByIdAndUpdate(

                req.params.id,

                {
                    $set: updates
                },

                {
                    new: true,
                    runValidators: true
                }

            ).select("-password");


        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.json(user);

    } catch (error) {

        console.error(
            "Error updating profile:",
            error
        );

        if (error.code === 11000) {

            return res.status(409).json({
                message:
                    "That username is already taken"
            });

        }

        res.status(500).json({
            message: "Failed to update profile"
        });

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