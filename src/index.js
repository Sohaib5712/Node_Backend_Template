import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import process from "process";
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

dotenv.config();

const app = express();

// ----------------------
// 🔒 1. Security Middlewares
// ----------------------

// Helmet — secure HTTP headers
app.use(helmet());

// Mongo sanitize — prevent NoSQL injection
app.use(mongoSanitize());

// XSS clean — prevent cross-site scripting
app.use(xss());

// HPP — prevent HTTP parameter pollution
app.use(hpp());

// Disable “X-Powered-By” header
app.disable("x-powered-by");

// Trust proxy (for Nginx, Render, Vercel, etc.)
app.set("trust proxy", 1);

// ----------------------
// ⚡ 2. Performance
// ----------------------

// Compression — smaller, faster responses
app.use(compression());

// ----------------------
// 🚦 3. Logging
// ----------------------
const logFormat = process.env.NODE_ENV === "development" ? "dev" : "combined";
app.use(morgan(logFormat));

// ----------------------
// 🌐 4. CORS Configuration
// ----------------------
const whitelist = [
  "http://localhost:8080",
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.CLIENT_URL,
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ----------------------
// 📊 5. Rate Limiting
// ----------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ----------------------
// 🧩 6. Body Parser
// ----------------------
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// ----------------------
// 🚀 7. Routes
// ----------------------
app.use("/api", routes);

// Health Check Route
app.get("/", (req, res) => {
  res.send("✅ Server is Working Fine & Secure.");
});

// ----------------------
// 🔐 8. HTTPS Redirect (Production)
// ----------------------
app.use((req, res, next) => {
  if (req.protocol !== "https" && process.env.NODE_ENV === "production") {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// ----------------------
// 🧱 9. Global Error Handler
// ----------------------
app.use(errorHandler);

// ----------------------
// 🛑 10. Graceful Shutdown
// ----------------------
process.on("SIGINT", async () => {
  console.log("🛑 Gracefully shutting down...");
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🛑 Termination signal received, closing DB...");
  await mongoose.connection.close();
  process.exit(0);
});

// ----------------------
// 🔌 11. Start Server
// ----------------------
const PORT = process.env.PORT || 8080;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running securely on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`❌ Failed to start server: ${error.message}`);
  });
