import axios from "axios";
import Alert from "../models/Alert.js";

let io;

export const setSocketInstance = (socketIo) => {
  io = socketIo;
};

export const detectDanger = async (req, res) => {
  try {
    console.log("📥 Incoming image for AI analysis");

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image base64 data is required",
      });
    }

    // Check if AI service URL is configured
    if (!process.env.AI_SERVICE_URL) {
      console.error("❌ AI_SERVICE_URL is not defined in environment variables");
      return res.status(500).json({
        success: false,
        message: "AI Service is not configured on the server",
      });
    }

    console.log(`🤖 Calling AI Service: ${process.env.AI_SERVICE_URL}/analyze`);

    // Call AI Service with timeout
    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/analyze`,
      { image },
      { 
        timeout: 30000, // 30 seconds timeout
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("🤖 Raw AI Response:", aiResponse.data);

    const alertData = aiResponse.data.alert || aiResponse.data || {};
    
    const type = String(alertData.status || alertData.type || "unknown").toLowerCase();
    const confidence = Number(alertData.confidence || 0);
    const message = aiResponse.data.message || "AI analysis completed";

    const processedData = {
      danger: type !== "normal" && type !== "safe",
      type,
      confidence,
      message,
    };

    console.log("✅ Processed AI Result:", processedData);

    // Save alert to database
    const newAlert = await Alert.create({
      type: type,
      image: image,
      message: message,
      confidence: confidence,
    });

    // Broadcast via Socket.io to all connected clients
    if (io) {
      io.emit("alert", {
        ...newAlert.toObject(),
        aiResult: processedData,
      });
      console.log("📡 Alert broadcasted via WebSocket");
    }

    res.status(200).json({
      success: true,
      alert: newAlert,
      aiResult: processedData,
    });

  } catch (error) {
    console.error("❌ Error in detectDanger:", error.message);

    // Specific error handling
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message.includes('Network Error')) {
      return res.status(503).json({
        success: false,
        message: "AI Analysis Service is currently unavailable. Please try again later.",
      });
    }

    if (error.response) {
      // AI service returned an error
      return res.status(error.response.status || 500).json({
        success: false,
        message: "AI Service returned an error",
        details: error.response.data,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to process image with AI",
      error: error.message,
    });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error("❌ Error fetching alerts:", error.message);
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

    if (!reportId || !type || !description || !location || !phone) {
      return res.status(400).json({
        success: false,
        message: "Missing required emergency fields",
      });
    }

    const newAlert = await Alert.create({
      type: type,
      message: description,
      location: location,
      phone: phone,
      aiResult: aiAnalysis,
      reportId: reportId,
      createdAt: timestamp || new Date(),
    });

    console.log("✅ Emergency Alert Created:", newAlert._id);

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