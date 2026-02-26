import AdminUser from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { paginate } from "../utils/pagination.js";
import { send2FACode } from "./opt.service.js";
import { createSecretToken, generateToken } from "../utils/jwt.js";
import ApiError from "../utils/ApiError.js";

const toInt = (v, fallback) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

const pick = (obj, allowedKeys) => {
  const out = {};
  for (const k of allowedKeys) if (obj[k] !== undefined) out[k] = obj[k];
  return out;
};

export async function getMe(adminId) {
  if (!mongoose.Types.ObjectId.isValid(adminId)) throw new ApiError(400, "Invalid admin ID");
  return AdminUser.findById(adminId).select("-password").lean();
}

export async function login({ email, password }) {
  const admin = await AdminUser.findOne({ email: email.toLowerCase().trim() }).select("+password");
  if (!admin) throw new ApiError(401, "Invalid credentials");

  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) throw new ApiError(401, "Invalid credentials");

  if (admin.status && admin.status !== "active") {
    throw new ApiError(403, "Account is not active");
  }

  if (admin.twoFactorEnabled) {
    await send2FACode(admin._id, "admin");
    const tempToken = createSecretToken({ id: admin._id, type: "2fa", role: "admin" }, "10m");
    return { status: "2fa-required", message: "2FA code sent to your email", token: tempToken };
  }

  const token = generateToken({ id: admin._id, role: admin.role });

  admin.lastLogin = new Date();
  admin.loginHistory = admin.loginHistory || [];
  admin.loginHistory.push(admin.lastLogin);
  if (admin.loginHistory.length > 20) admin.loginHistory = admin.loginHistory.slice(-20);

  await admin.save();

  const safeAdmin = await AdminUser.findById(admin._id).select("-password").lean();
  return { token, user: safeAdmin };
}

export async function createAdminUser(data) {
  const email = data.email?.toLowerCase().trim();
  const username = data.username?.trim();

  const emailExists = await AdminUser.findOne({ email }).lean();
  if (emailExists) throw new ApiError(409, "Email already in use");

  if (username) {
    const usernameExists = await AdminUser.findOne({ username }).lean();
    if (usernameExists) throw new ApiError(409, "Username already in use");
  }

  const hashed = await bcrypt.hash(data.password, 10);
  const created = await AdminUser.create({ ...data, email, username, password: hashed });

  return AdminUser.findById(created._id).select("-password").lean();
}

export async function getAdminUsers({ page = 1, limit = 10, search = "", status }) {
  const pageNum = toInt(page, 1);
  const limitNum = Math.min(toInt(limit, 10), 100);

  const query = {};
  if (search) {
    query.$or = [{ username: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
  }
  if (status) query.status = status;

  const total = await AdminUser.countDocuments(query);

  const results = await AdminUser.find(query)
    .select("-password")
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .sort({ createdAt: -1 })
    .lean();

  return paginate(results, pageNum, limitNum, total);
}

export async function getAdminUserById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid admin ID");
  return AdminUser.findById(id).select("-password").lean();
}

export async function updateAdminUser(id, data) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid admin ID");

  // IMPORTANT: allowlist fields to prevent privilege escalation
  const allowed = ["username", "email", "status", "permissions", "meta", "role", "twoFactorEnabled"];
  const update = pick(data, allowed);

  if (data.password) update.password = await bcrypt.hash(data.password, 10);

  const updated = await AdminUser.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  })
    .select("-password")
    .lean();

  if (!updated) throw new ApiError(404, "Admin user not found");
  return updated;
}

export async function toggleAdminStatus(id, status) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid admin ID");

  const allowedStatuses = ["active", "inactive", "suspended"];
  if (!allowedStatuses.includes(status)) throw new ApiError(400, "Invalid status value");

  const updated = await AdminUser.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
    .select("-password")
    .lean();

  if (!updated) throw new ApiError(404, "Admin user not found");
  return updated;
}

export async function getSingleAdmin(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid admin ID");

  const admin = await AdminUser.findById(id).select("-password").lean();
  if (!admin) throw new ApiError(404, "Admin user not found");

  return admin;
}

export async function deleteAdminUser(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid admin ID");

  const deleted = await AdminUser.findByIdAndDelete(id).lean();
  if (!deleted) throw new ApiError(404, "Admin user not found");

  return { deleted: true };
}

export async function changeAdminPasswordService(adminId, currentPassword, newPassword) {
  if (!mongoose.Types.ObjectId.isValid(adminId)) throw new ApiError(400, "Invalid admin ID");

  const admin = await AdminUser.findById(adminId).select("+password");
  if (!admin) throw new ApiError(404, "Admin not found");

  const ok = await bcrypt.compare(currentPassword, admin.password);
  if (!ok) throw new ApiError(400, "Current password is incorrect");

  admin.password = await bcrypt.hash(newPassword, 10);
  await admin.save();

  return { message: "Password updated successfully" };
}
