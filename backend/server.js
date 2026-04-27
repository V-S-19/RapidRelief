import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import alertRoutes from "./routes/alertRoutes.js";
import initSocket from "./socket/socket.js";
import { setSocketInstance } from "./controllers/alertController.js";

const app = express();

// ✅ Updated CORS - Allow both Vercel frontend and local development
app.use(cors({
  origin: [
    "https://rapid-relief.vercel.app",           // ← Change this to your actual Vercel URL
    "https://rapidrelief-frontend.vercel.app",   // Add variations if needed
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check route (very useful for testing)
app.get("/", (req, res) => {
  res.json({
    message: "✅ RapidRelief Backend is running successfully!",
    status: "OK",
    mongoConnected: !!connectDB, // rough check
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "production"
  });
});

// Connect to MongoDB
connectDB();

app.use("/api", alertRoutes);

// Socket.io setup
const server = http.createServer(app);
const io = initSocket(server);
setSocketInstance(io);

// Use PORT from environment (Render sets this automatically)
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

// Error handling
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error(`❌ Server error:`, error);
  }
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  // In production, you might want to gracefully shutdown instead of exiting
});