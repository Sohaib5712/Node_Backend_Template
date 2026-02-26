import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import routes from "./routes/index.js";
import connectDB from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import mongoose from "mongoose";
import process from "process";

dotenv.config();

const app = express();

// Security
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.disable("x-powered-by");
app.set("trust proxy", 1);

// Performance
app.use(compression());

// Logging
const logFormat = process.env.NODE_ENV === "development" ? "dev" : "combined";
app.use(morgan(logFormat));

// CORS
const whitelist = [
  "http://localhost:8080",
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true); // allow server-to-server/curl
    if (whitelist.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Rate limiting (global)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Body parsing (Express built-in)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// HTTPS redirect (place BEFORE routes)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && req.protocol !== "https") {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Routes
app.use("/api/v1", routes);

// Health check
app.get("/", (req, res) => res.send("✅ Server is Working Fine & Secure."));

// Error handler (last)
app.use(errorHandler);

// Start server after DB connects
const PORT = process.env.PORT || 8080;

let server;

connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running securely on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  });

// Graceful shutdown
async function shutdown(signal) {
  try {
    console.log(`🛑 ${signal} received, shutting down...`);

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Shutdown error:", err);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
