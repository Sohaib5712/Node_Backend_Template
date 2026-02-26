import AdminUser from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import { paginate } from "../utils/pagination.js";
import mongoose from "mongoose";
import { send2FACode } from "./opt.service.js";
import { createSecretToken, generateToken } from "../utils/jwt.js";
import ApiError from "../utils/ApiError.js";

export const getMe = async (userId) => {
  return await AdminUser.findById(userId).select("-password");
};

export async function login({ email, password }) {
  const user = await AdminUser.findOne({ email });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  if (user.twoFactorEnabled) {
    await send2FACode(user._id, "admin");
    const tempToken = createSecretToken({ id: user._id, type: "2fa" }, "10m");

    return {
      status: "2fa-required",
      message: "2FA code sent to your email",
      token: tempToken,
    };
  }
  const token = generateToken({ id: user._id, role: user.role });

  user.lastLogin = new Date();
  user.loginHistory.push(user.lastLogin);
  if (user.loginHistory.length > 20) {
    user.loginHistory = user.loginHistory.slice(-20);
  }

  await user.save();
  return { token, user };
}

export async function createAdminUser(data) {
  const exists = await AdminUser.findOne({ email: data.email });
  if (exists) throw new ApiError(400, "Email already in use");

  const hashed = await bcrypt.hash(data.password, 10);
  const user = new AdminUser({ ...data, password: hashed });
  return await user.save();
}

export async function getAdminUsers({ page = 1, limit = 10, search = "", status }) {
  const query = {};
  if (search) {
    query.$or = [{ username: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
  }
  if (status) query.status = status;

  const total = await AdminUser.countDocuments(query);
  const results = await AdminUser.find(query)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  return paginate(results, page, limit, total);
}

export async function getAdminUserById(id) {
  return await AdminUser.findById(id);
}

export async function updateAdminUser(id, data) {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  return await AdminUser.findByIdAndUpdate(id, data, { new: true });
}

export const toggleAdminStatus = async (id, status) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid admin ID");
  }

  const allowedStatuses = ["active", "inactive", "suspended"];
  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const updated = await AdminUser.findByIdAndUpdate(id, { status }, { new: true });
  if (!updated) throw new ApiError(404, "Admin user not found");
  return updated;
};

export const getSingleAdmin = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid admin ID");
  }

  const admin = await AdminUser.findById(id).select("-password").lean();
  if (!admin) {
    throw new ApiError(404, "Admin user not found");
  }

  return admin;
};

export async function deleteAdminUser(id) {
  const result = await AdminUser.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(404, "Admin user not found");
  }
  return result;
}

export const changeAdminPasswordService = async (adminId, currentPassword, newPassword) => {
  const admin = await AdminUser.findById(adminId);
  if (!admin) throw new ApiError(404, "Admin not found");

  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) throw new ApiError(400, "Current password is incorrect");

  admin.password = await bcrypt.hash(newPassword, 10);
  await admin.save();

  return { message: "Password updated successfully" };
};
