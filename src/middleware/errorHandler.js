import ApiError from "../utils/ApiError.js";
import process from "process";

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || null;

  // Mongoose invalid ObjectId
  if (err?.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource id";
    errors = { path: err.path, value: err.value };
  }

  // Mongoose validation
  if (err?.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // Mongo duplicate key error
  if (err?.code === 11000) {
    statusCode = 409;
    message = "Duplicate key error";
    errors = err.keyValue;
  }

  // If it’s your own ApiError, keep it clean
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || null;
  }

  // Log (avoid leaking secrets)
  console.error("🔥 Error:", {
    name: err?.name,
    message: err?.message,
    statusCode,
    method: req.method,
    path: req.originalUrl,
    ...(process.env.NODE_ENV === "development" ? { stack: err?.stack } : {}),
  });

  return res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === "production" && statusCode === 500 ? "Internal Server Error" : message,
    errors: process.env.NODE_ENV === "production" && statusCode === 500 ? null : errors,
    ...(process.env.NODE_ENV === "development" ? { stack: err?.stack } : {}),
  });
}
