const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rank: {
        type: String,
        default: null
    },
    role: {
        type: String,
        default: null
    },
    playstyle: {
        type: String,
        default: null
    },
    lookingForTeammates: {
        type: Boolean,
        default: false
    }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: ""
    },
    region: {
        type: String,
        required: true
    },
    platforms: {
        type: [String],
        default: []
    },
    gamertags: {
        discord: {
            type: String,
            default: null
        },
        steam: {
            type: String,
            default: null
        },
        xbox: {
            type: String,
            default: null
        },
        playstation: {
            type: String,
            default: null
        }
    },
    games: {
        type: [gameSchema],
        default: []
    }
});

module.exports = mongoose.model("User", userSchema);