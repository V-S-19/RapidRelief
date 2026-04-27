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

app.use(cors());
app.use(express.json({ limit: "10mb" }));

connectDB();

app.use("/api", alertRoutes);

const server = http.createServer(app);

const io = initSocket(server);
setSocketInstance(io);

const PORT = 5000;

// Error handling for server
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error(`❌ Server error:`, error);
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});