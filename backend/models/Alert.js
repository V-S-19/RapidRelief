import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
  },
  image: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: "Unknown",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Alert", alertSchema);