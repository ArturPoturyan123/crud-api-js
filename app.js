const express = require("express");
const mongoose = require("mongoose");

// Import routes
const authRoutes = require("./routes/authRoutes.js");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set view engine
app.set('view engine', 'ejs');

// Home route
app.get("/", (req, res) => {
  res.render("home");
});

// Simple routes for login and register
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/profile", (req, res) => {
  res.render("profile");
});

// Auth routes
app.use("/", authRoutes);

// Health check route
app.get("/health", (req, res) => {
  // Map mongoose.readyState to human readable status
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const dbState = states[mongoose.connection.readyState] || 'unknown';
  res.status(200).json({ message: "Server is running", status: "OK", db: { readyState: mongoose.connection.readyState, state: dbState } });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Database connection — use MONGO_URI from environment or local fallback
require('dotenv').config();
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/crud-db';

// Try to connect to MongoDB but don't block server start on failure
mongoose
  .connect(mongoUri)
  .then(() => console.log("Connected to database"))
  .catch((error) => console.log("Database connection failed:", error && error.message ? error.message : error));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 