import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  message: {
    type: String,
  },
  description: {
    type: String,
  },
  location: {
    type: String,
    default: "Unknown",
  },
  phone: {
    type: String,
  },
  reportId: {
    type: String,
    sparse: true,
  },
  aiResult: {
    status: String,
    confidence: Number,
    message: String,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  status: {
    type: String,
    enum: ["new", "assigned", "in-progress", "resolved"],
    default: "new",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Alert", alertSchema);