const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted"],
        default: "pending"
    }
}, {
    timestamps: true
});

// Only one request per sender/receiver pair
connectionSchema.index(
    { sender: 1, receiver: 1 },
    { unique: true }
);

module.exports = mongoose.model("Connection", connectionSchema);
