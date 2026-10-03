const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const net = require("net");

const vendorRoutes = require("./routes/vendorRoutes");
const firmRoutes = require("./routes/firmRoutes");
const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const publicRoutes = require("./routes/publicRoutes");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const uploadDir = path.join(__dirname, "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(uploadDir));

app.use("/vendor", vendorRoutes);
app.use("/firm", firmRoutes);
app.use("/product", productRoutes);
app.use("/customer", customerRoutes);
app.use("/public", publicRoutes);
app.use("/orders", orderRoutes);

// ==========================================
// SMTP CONNECTIVITY TEST
// ==========================================

app.get("/debug-smtp", (req, res) => {
  const socket = new net.Socket();

  socket.setTimeout(10000);

  socket.on("connect", () => {
    socket.destroy();

    console.log("SMTP TCP CONNECTED: smtp.gmail.com:587");

    res.json({
      status: "TCP CONNECTED",
      host: "smtp.gmail.com",
      port: 587
    });
  });

  socket.on("timeout", () => {
    socket.destroy();

    console.error("SMTP TCP TIMEOUT: smtp.gmail.com:587");

    res.status(504).json({
      status: "TCP TIMEOUT",
      host: "smtp.gmail.com",
      port: 587
    });
  });

  socket.on("error", (err) => {
    socket.destroy();

    console.error("SMTP TCP ERROR:", err.message);

    res.status(500).json({
      status: "TCP ERROR",
      error: err.message,
      code: err.code || null
    });
  });

  socket.connect(587, "smtp.gmail.com");
});

// ==========================================
// ROOT
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Ranaveer",
    status: "Backend is running"
  });
});

// ==========================================
// ENVIRONMENT CHECKS
// ==========================================

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing in backend/.env");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing in backend/.env");
  process.exit(1);
}

// ==========================================
// MONGODB + SERVER
// ==========================================

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server started running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:");
    console.error(error.message);
    process.exit(1);
  });