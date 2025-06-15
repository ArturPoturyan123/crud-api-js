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
  res.status(200).json({ message: "Server is running", status: "OK" });
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

// Database connection
mongoose
  .connect(
    "mongodb+srv://poturyan:8FQzQNWl0OHMuuvp@backenddb.ddridhj.mongodb.net/?retryWrites=true&w=majority&appName=BackendDB"
  )
  .then(() => {
    console.log("Connected to database");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => {
    console.log("Database connection failed:", error);
  });

module.exports = app; 