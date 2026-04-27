import axios from "axios";
import Alert from "../models/Alert.js";

let io;

export const setSocketInstance = (socketIo) => {
  io = socketIo;
};

export const detectDanger = async (req, res) => {
  try {
    console.log("📥 Incoming:", req.body);

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image missing",
      });
    }

    const aiResponse = await axios.post(process.env.AI_SERVICE_URL + "/analyze", {
      image,
    });

    console.log("🤖 Raw AI Response:", aiResponse.data);

    const alertData = aiResponse.data.alert || {};
    const type = String(alertData.status || "unknown");
    const confidence = Number(alertData.confidence || 0);
    const message = aiResponse.data.message || "";

    const data = {
      danger: type !== "normal" && type !== "safe",
      type,
      confidence,
      message,
    };

    console.log("✅ Processed AI Response:", data);

    const newAlert = await Alert.create({
      type: type,
      image: image,
    });

    if (io) {
      io.emit("alert", {
        ...newAlert.toObject(),
        aiResult: data,
      });
    }

    res.status(200).json({
      success: true,
      alert: newAlert,
      aiResult: data,
    });
  } catch (error) {
    console.error("❌ ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      alerts,
    });
  } catch (error) {
    console.error("❌ ERROR FETCHING ALERTS:", error.message);

    res.status(500).json({
      success: false,
      message: "Error fetching alerts",
      error: error.message,
    });
  }
};

export const handleEmergencyNotification = async (req, res) => {
  try {
    console.log("🚨 Emergency Notification Received:", req.body);

    const {
      reportId,
      type,
      description,
      location,
      phone,
      aiAnalysis,
      timestamp,
    } = req.body;

    // Validate required fields
    if (!reportId || !type || !description || !location || !phone) {
      return res.status(400).json({
        success: false,
        message: "Missing required emergency fields",
      });
    }

    // Create emergency alert in database
    const newAlert = await Alert.create({
      type: type,
      message: description,
      location: location,
      phone: phone,
      aiResult: aiAnalysis,
      reportId: reportId,
      createdAt: timestamp,
    });

    console.log("✅ Emergency Alert Created:", newAlert._id);

    // Broadcast emergency notification via WebSocket
    if (io) {
      const emergencyData = {
        id: newAlert._id,
        reportId,
        type,
        description,
        location,
        phone,
        aiAnalysis,
        priority: aiAnalysis?.confidence > 0.7 ? "high" : "medium",
        status: "new",
        timestamp: new Date().toISOString(),
      };

      // Emit to all connected clients
      io.emit("emergency", emergencyData);
      console.log("📡 Emergency notification broadcasted via WebSocket");
    }

    res.status(200).json({
      success: true,
      message: "Emergency notification processed and broadcasted",
      alertId: newAlert._id,
    });
  } catch (error) {
    console.error("❌ Emergency notification error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to process emergency notification",
      error: error.message,
    });
  }
};