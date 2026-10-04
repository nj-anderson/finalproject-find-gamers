const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
// API routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const connectionRoutes = require("./routes/connections");
const accounts = [
    {username: 'Rashi', password: 'test'}
]
const app = express();
const PORT = process.env.PORT || 3000;
const session = require("express-session");
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
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
app.post( '/login', (req, res) => {
  const { username, password } = req.body

  //console.log("Password entered:", password)
  let correct = false
  let exists = false
  for (let item of accounts) {
    if (username === item.username) {
        if (item.password === password) {
            correct = true
        }
        exists = true
        break
    }
  }
  if (!exists) {
    accounts.push({username: username, password: password})
    correct = true
  }
  if( correct && exists ) {
    req.session.login = true
    req.session.username = username
    res.json({ success: true, isNewUser: false, message: "Logged in successfully!" })
  } else if (correct && !exists ) {
    req.session.login = true
    req.session.username = username
    res.json({ success: true, isNewUser: true, message: "New user created!" })
  } else {
    res.status(401).json({ success: false, message: "Incorrect password." })
  }
})
// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});