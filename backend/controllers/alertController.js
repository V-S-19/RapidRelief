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

    const aiResponse = await axios.post("http://127.0.0.1:8000/analyze", {
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