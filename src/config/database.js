import mongoose from "mongoose";
import dotenv from "dotenv";
import process from "process";

dotenv.config();

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing in environment variables");

  mongoose.set("strictQuery", true);

  try {
    const conn = await mongoose.connect(uri);

    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on("disconnected", () => {
      console.error("MongoDB disconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    return conn;
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    throw err; // let the caller decide to exit
  }
}
