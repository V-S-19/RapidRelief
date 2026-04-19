import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.error("❌ MONGO_URI is not defined in .env file");
      process.exit(1);
    }

    console.log("🔄 Connecting to MongoDB...");

    const conn = await mongoose.connect(mongoURI, {
      // Optional but helpful settings
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);

    if (error.message.includes("ECONNREFUSED")) {
      console.error("   → Make sure MongoDB server is running on 127.0.0.1:27017");
    }

    // Don't exit immediately — let nodemon restart
    console.log("   → App will restart when you save a file (nodemon)");
  }
};

export default connectDB;