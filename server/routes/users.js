const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");

const router = express.Router();

/*
    GET ALL USERS

    Used by the Explore page.
*/
router.get("/", async (req, res) => {

    try {

        const users = await User
            .find()
            .select("-password");

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

        res.json(user);

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

module.exports = router;