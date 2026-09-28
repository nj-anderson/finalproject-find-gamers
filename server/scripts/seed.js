// THIS SCRIPT CLEARS THE DATABASE !!!!!!!!

// DO NOT RUN THIS SCRIPT UNLESS YOU WANT TO CLEAR YOUR DATABASE AND SEED IT WITH INITIAL DATA


const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

const users = [
    {
        username: "ValorantQueen",
        password: "dummy",
        profilePicture: null,
        bio: "Looking for some chill Valorant games!",
        region: "North America East",
        platforms: ["PC"],
        gamertags: {
            discord: "ValorantQueen",
            steam: "ValorantQueen",
            xbox: null,
            playstation: null
        },
        games: [
            {
                name: "Valorant",
                rank: "Diamond",
                role: "Duelist",
                playstyle: "Competitive",
                lookingForTeammates: true
            }
        ]
    },

    {
        username: "ChillGamer22",
        password: "dummy",
        profilePicture: null,
        bio: "Mostly play after class. Down for pretty much anything.",
        region: "North America East",
        platforms: ["PC", "PlayStation"],
        gamertags: {
            discord: "ChillGamer22",
            steam: "ChillGamer22",
            xbox: null,
            playstation: "ChillGamer22"
        },
        games: [
            {
                name: "Valorant",
                rank: "Platinum",
                role: "Controller",
                playstyle: "Chill",
                lookingForTeammates: true
            },
            {
                name: "Minecraft",
                rank: null,
                role: null,
                playstyle: "Chill",
                lookingForTeammates: true
            }
        ]
    },

    {
        username: "RocketPro",
        password: "dummy",
        profilePicture: null,
        bio: "Competitive Rocket League player.",
        region: "North America West",
        platforms: ["PC"],
        gamertags: {
            discord: "RocketPro",
            steam: "RocketPro",
            xbox: null,
            playstation: null
        },
        games: [
            {
                name: "Rocket League",
                rank: "Champion",
                role: null,
                playstyle: "Competitive",
                lookingForTeammates: true
            }
        ]
    },

    {
        username: "MinecraftMatt",
        password: "dummy",
        profilePicture: null,
        bio: "Building stuff and exploring.",
        region: "North America East",
        platforms: ["PC"],
        gamertags: {
            discord: "MinecraftMatt",
            steam: "MinecraftMatt",
            xbox: null,
            playstation: null
        },
        games: [
            {
                name: "Minecraft",
                rank: null,
                role: null,
                playstyle: "Chill",
                lookingForTeammates: false
            }
        ]
    },

    {
        username: "OverwatchAmy",
        password: "dummy",
        profilePicture: null,
        bio: "Support main looking for a regular group.",
        region: "North America East",
        platforms: ["PC"],
        gamertags: {
            discord: "OverwatchAmy",
            steam: "OverwatchAmy",
            xbox: null,
            playstation: null
        },
        games: [
            {
                name: "Overwatch 2",
                rank: "Master",
                role: "Support",
                playstyle: "Competitive",
                lookingForTeammates: true
            },
            {
                name: "Valorant",
                rank: "Gold",
                role: "Controller",
                playstyle: "Chill",
                lookingForTeammates: false
            }
        ]
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("Connected to MongoDB");

        await User.deleteMany({});

        await User.insertMany(users);

        console.log(`Added ${users.length} users`);

        await mongoose.connection.close();

        console.log("Database connection closed");
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

seedDatabase();