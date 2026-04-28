import jwt from "jsonwebtoken";
import process from "process";
import AdminUser from "../models/admin.model.js";
import ApiError from "../utils/ApiError.js";

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError(401, "Unauthorized", null, "NO_TOKEN");
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      const code = e.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "TOKEN_INVALID";
      throw new ApiError(401, "Unauthorized", null, code);
    }

    req.userId = decoded.id;

    const admin = await AdminUser.findById(decoded.id).select("-password").lean();
    if (!admin) throw new ApiError(401, "Unauthorized", null, "USER_NOT_FOUND");

    req.user = admin;
    return next();
  } catch (err) {
    return next(err);
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, "Unauthorized", null, "NO_USER"));
    if (!roles.includes(req.user.role)) return next(new ApiError(403, "Forbidden", null, "FORBIDDEN"));
    next();
  };
}
