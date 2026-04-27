import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Support both common variable names
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

    console.log("🔄 Attempting to connect to MongoDB...");

    if (!mongoURI) {
      console.warn("⚠️  MONGO_URI / MONGODB_URI is not defined.");
      console.warn("   → Server will start WITHOUT database connection.");
      return;                    // Do NOT crash the app
    }

    console.log("🔄 Connecting to MongoDB Atlas...");

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,   // 10 seconds (good balance)
      socketTimeoutMS: 45000,            // Keep socket alive longer
      retryWrites: true,                 // Recommended for Atlas
      // useNewUrlParser and useUnifiedTopology are no longer needed in recent Mongoose
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name || 'default'}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);

    if (error.name === "MongooseServerSelectionError") {
      console.error("   → Could not reach MongoDB Atlas. Check your MONGO_URI, network access (0.0.0.0/0), and password.");
    } else if (error.message.includes("ECONNREFUSED")) {
      console.error("   → Local MongoDB not running or wrong connection string.");
    }

    console.warn("   → The backend server will continue running without MongoDB.");
    // Do NOT call process.exit(1) in production
  }
};

export default connectDB;
