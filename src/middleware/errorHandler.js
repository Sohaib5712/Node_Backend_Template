import ApiError from "../utils/ApiError.js";

export function errorHandler(err, req, res, next) {
  console.error("🔥 Error:", err);

  const statusCode = err.statusCode || 500;

  if (err instanceof ApiError) {
    return res.status(statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: "Internal Server Error",
  });
}
