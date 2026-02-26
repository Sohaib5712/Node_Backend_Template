import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import process from "process";

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

    // Keep a quick id reference
    req.userId = decoded.id;

    const user = await User.findById(decoded.id).select("-password").lean();
    if (!user) throw new ApiError(401, "Unauthorized", null, "USER_NOT_FOUND");

    req.user = user;
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

/**
 * Optional helper: allow the user themselves OR admin-like roles.
 * Usage in route/controller when needed.
 */
export function authorizeSelfOr(...roles) {
  return (req, res, next) => {
    const targetId = req.params.id;
    const isSelf = req.user?._id?.toString() === targetId;
    const isRoleAllowed = req.user && roles.includes(req.user.role);

    if (!isSelf && !isRoleAllowed) return next(new ApiError(403, "Forbidden", null, "FORBIDDEN"));
    next();
  };
}
