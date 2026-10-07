const express = require("express");
const mongoose = require("mongoose");
const Connection = require("../models/Connection");
const User = require("../models/User");

const router = express.Router();

// Public info shown on a pending request (no gamertags yet)
const PUBLIC_FIELDS = "username profilePicture bio region platforms games";

// Once accepted, gamertags are revealed too
const CONNECTED_FIELDS = `${PUBLIC_FIELDS} gamertags`;


/*
    CURRENT USER

    The x-user-id header is temporary until
    the login system is finished (same as users.js).

*/

router.use((req, res, next) => {

    const currentUserId = req.get("x-user-id");

    if (
        !currentUserId ||
        !mongoose.isValidObjectId(currentUserId)
    ) {

        return res.status(401).json({
            message: "You must be logged in"
        });

    }

    req.currentUserId = currentUserId;

    next();

});


/*
    GET ACCEPTED CONNECTIONS

    Returns the other user in each connection,
    including their gamertags.
*/

router.get("/", async (req, res) => {

    try {

        const me = req.currentUserId;

        const connections = await Connection
            .find({
                status: "accepted",
                $or: [
                    { sender: me },
                    { receiver: me }
                ]
            })
            .populate("sender", CONNECTED_FIELDS)
            .populate("receiver", CONNECTED_FIELDS)
            .sort({ updatedAt: -1 });

        const result = connections
            .map((connection) => {

                const otherUser =
                    connection.sender?._id.equals(me)
                        ? connection.receiver
                        : connection.sender;

                return {
                    _id: connection._id,
                    connectedAt: connection.updatedAt,
                    user: otherUser
                };

            })
            // Skip connections whose other user was deleted
            .filter((connection) => connection.user);

        res.json(result);

    } catch (error) {

        console.error(
            "Error fetching connections:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch connections"
        });

    }

});


/*
    GET PENDING REQUESTS

    Incoming requests the current user
    has not answered yet.
*/

router.get("/pending", async (req, res) => {

    try {

        const requests = await Connection
            .find({
                receiver: req.currentUserId,
                status: "pending"
            })
            .populate("sender", PUBLIC_FIELDS)
            .sort({ createdAt: -1 });

        const result = requests
            .filter((request) => request.sender)
            .map((request) => ({
                _id: request._id,
                sentAt: request.createdAt,
                user: request.sender
            }));

        res.json(result);

    } catch (error) {

        console.error(
            "Error fetching pending requests:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch pending requests"
        });

    }

});


/*
    GET SENT REQUESTS

    Outgoing requests the other user
    has not answered yet.
*/

router.get("/sent", async (req, res) => {

    try {

        const requests = await Connection
            .find({
                sender: req.currentUserId,
                status: "pending"
            })
            .populate("receiver", PUBLIC_FIELDS)
            .sort({ createdAt: -1 });

        const result = requests
            .filter((request) => request.receiver)
            .map((request) => ({
                _id: request._id,
                sentAt: request.createdAt,
                user: request.receiver
            }));

        res.json(result);

    } catch (error) {

        console.error(
            "Error fetching sent requests:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch sent requests"
        });

    }

});


/*
    GET SUGGESTED TEAMMATES

    Players the current user has no connection or
    request with, who are looking for teammates in
    a game the current user also plays.

    Sorted by how many games they share.
*/

const MAX_SUGGESTIONS = 6;

router.get("/suggestions", async (req, res) => {

    try {

        const me = req.currentUserId;

        const currentUser = await User
            .findById(me)
            .select("games");

        if (!currentUser) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        // Game names are compared without caring about capitals
        const myGames = new Set(
            currentUser.games.map((game) =>
                game.name.trim().toLowerCase()
            )
        );

        if (myGames.size === 0) {
            return res.json([]);
        }

        // Skip anyone already connected or with a request either way
        const existing = await Connection.find({
            $or: [
                { sender: me },
                { receiver: me }
            ]
        });

        const excludedIds = existing.map((connection) =>
            connection.sender.equals(me)
                ? connection.receiver
                : connection.sender
        );

        const candidates = await User
            .find({
                _id: { $nin: [me, ...excludedIds] },
                "games.lookingForTeammates": true
            })
            .select(PUBLIC_FIELDS);

        const suggestions = candidates
            .map((user) => ({
                user,
                sharedGames: user.games
                    .filter((game) =>
                        game.lookingForTeammates &&
                        myGames.has(game.name.trim().toLowerCase())
                    )
                    .map((game) => ({
                        name: game.name,
                        rank: game.rank,
                        role: game.role
                    }))
            }))
            .filter((suggestion) => suggestion.sharedGames.length > 0)
            .sort((a, b) => b.sharedGames.length - a.sharedGames.length)
            .slice(0, MAX_SUGGESTIONS);

        res.json(suggestions);

    } catch (error) {

        console.error(
            "Error fetching suggestions:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch suggestions"
        });

    }

});


/*
    GET STATUS WITH ONE USER

    Used by the Connect button on a profile.

    status is one of:
        "none"      - no request either way
        "sent"      - you sent them a request
        "received"  - they sent you a request
        "connected" - request was accepted
*/

router.get("/status/:userId", async (req, res) => {

    try {

        const me = req.currentUserId;
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {

            return res.status(400).json({
                message: "Invalid user id"
            });

        }

        const connection = await Connection.findOne({
            $or: [
                { sender: me, receiver: userId },
                { sender: userId, receiver: me }
            ]
        });

        if (!connection) {

            return res.json({
                status: "none",
                connectionId: null
            });

        }

        let status = "connected";

        if (connection.status === "pending") {
            status = connection.sender.equals(me)
                ? "sent"
                : "received";
        }

        res.json({
            status,
            connectionId: connection._id
        });

    } catch (error) {

        console.error(
            "Error fetching connection status:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch connection status"
        });

    }

});


/*
    SEND REQUEST

    Body: { receiverId }
*/

router.post("/", async (req, res) => {

    try {

        const me = req.currentUserId;
        const { receiverId } = req.body;

        if (!mongoose.isValidObjectId(receiverId)) {

            return res.status(400).json({
                message: "Invalid user id"
            });

        }

        if (receiverId === me) {

            return res.status(400).json({
                message: "You can't connect with yourself"
            });

        }

        const receiverExists = await User.exists({
            _id: receiverId
        });

        if (!receiverExists) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        /*
            Block duplicates in either direction,
            including users who are already connected.
        */

        const existing = await Connection.findOne({
            $or: [
                { sender: me, receiver: receiverId },
                { sender: receiverId, receiver: me }
            ]
        });

        if (existing) {

            return res.status(409).json({
                message:
                    existing.status === "accepted"
                        ? "You are already connected"
                        : "A request between you already exists"
            });

        }

        const connection = await Connection.create({
            sender: me,
            receiver: receiverId
        });

        res.status(201).json(connection);

    } catch (error) {

        console.error(
            "Error sending request:",
            error
        );

        // Unique index caught a duplicate sent at the same moment
        if (error.code === 11000) {

            return res.status(409).json({
                message: "A request between you already exists"
            });

        }

        res.status(500).json({
            message: "Failed to send request"
        });

    }

});


/*
    ACCEPT REQUEST

    Only the receiver can accept.
*/

router.patch("/:id/accept", async (req, res) => {

    try {

        if (!mongoose.isValidObjectId(req.params.id)) {

            return res.status(400).json({
                message: "Invalid request id"
            });

        }

        const connection = await Connection.findOneAndUpdate(
            {
                _id: req.params.id,
                receiver: req.currentUserId,
                status: "pending"
            },
            {
                $set: { status: "accepted" }
            },
            {
                returnDocument: "after"
            }
        ).populate("sender", CONNECTED_FIELDS);

        if (!connection) {

            return res.status(404).json({
                message: "Pending request not found"
            });

        }

        res.json({
            _id: connection._id,
            connectedAt: connection.updatedAt,
            user: connection.sender
        });

    } catch (error) {

        console.error(
            "Error accepting request:",
            error
        );

        res.status(500).json({
            message: "Failed to accept request"
        });

    }

});


/*
    DECLINE REQUEST / REMOVE CONNECTION

    Deletes the document. Either user
    in the connection is allowed to do this.
*/

router.delete("/:id", async (req, res) => {

    try {

        if (!mongoose.isValidObjectId(req.params.id)) {

            return res.status(400).json({
                message: "Invalid request id"
            });

        }

        const me = req.currentUserId;

        const connection = await Connection.findOneAndDelete({
            _id: req.params.id,
            $or: [
                { sender: me },
                { receiver: me }
            ]
        });

        if (!connection) {

            return res.status(404).json({
                message: "Connection not found"
            });

        }

        res.json({
            message: "Connection removed"
        });

    } catch (error) {

        console.error(
            "Error removing connection:",
            error
        );

        res.status(500).json({
            message: "Failed to remove connection"
        });

    }

});

module.exports = router;
