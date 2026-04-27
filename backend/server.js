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

// ✅ Improved CORS Configuration
app.use(cors({
  origin: [
    "https://rapid-relief.vercel.app",                    // Main Vercel URL
    "https://rapidrelief.vercel.app",                     // without hyphen
    "https://*.vercel.app",                               // Allow all Vercel preview URLs (very useful)
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check routes
app.get("/", (req, res) => {
  res.json({
    message: "✅ RapidRelief Backend is running successfully!",
    status: "OK",
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    mongoConnected: true, // You can improve this later
  });
});

// Connect to MongoDB
connectDB();

app.use("/api", alertRoutes);

// Socket.io setup
const server = http.createServer(app);
const io = initSocket(server);
setSocketInstance(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Backend URL: https://rapidrelief-backend.onrender.com`);
  console.log(`🔗 Health check: /health`);
});

server.on("error", (error) => {
  console.error("❌ Server error:", error);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});