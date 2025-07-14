// server/server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");

require("./service/offerService");

// Load environment variables
dotenv.config();

const app = express();
app.set("trust proxy", 1);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://maps.googleapis.com",
          "https://maps.gstatic.com",
          "https://www.google.com",
          "https://www.gstatic.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        frameSrc: [
          "'self'",
          "https://www.google.com",
          "https://www.google.com/maps/embed",
          "https://maps.googleapis.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://maps.gstatic.com",
          "https://maps.googleapis.com",
          "https://*.googleapis.com",
          "https://*.ggpht.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: [
          "'self'",
          "https://maps.googleapis.com",
          "https://*.googleapis.com",
          "https://*.ggpht.com",
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 25 * 60 * 1000,
  max: 200,
  skip: (req) => req.path === "/api/auth",
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// CORS configuration

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/contact", require("./routes/contact"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Fish E-commerce API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Error handling middleware
app.use((err, req, res) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use(/(.*)/, (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
