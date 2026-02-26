// services/user.service.js
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { paginate } from "../utils/pagination.js";
import mongoose from "mongoose";
import { send2FACode } from "./opt.service.js";
import { createSecretToken, generateToken } from "../utils/jwt.js";
import ApiError from "../utils/ApiError.js";

export const getMe = async (userId) => {
  return await User.findById(userId).select("-password");
};

export async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  if (user.twoFactorEnabled) {
    // note the "user" context here (vs "admin")
    await send2FACode(user._id, "user");
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

export async function createUser(data) {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw new ApiError(400, "Email already in use");

  // Optional: also enforce unique username (uncomment if desired)
  // const usernameTaken = await User.findOne({ username: data.username });
  // if (usernameTaken) throw new ApiError(400, "Username already in use");

  const hashed = await bcrypt.hash(data.password, 10);
  const user = new User({ ...data, password: hashed });
  return await user.save();
}

export async function getUsers({ page = 1, limit = 10, search = "", status }) {
  const query = {};
  if (search) {
    query.$or = [{ username: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
  }
  if (status) query.status = status;

  const total = await User.countDocuments(query);
  const results = await User.find(query)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  return paginate(results, page, limit, total);
}

export async function getUserById(id) {
  return await User.findById(id);
}

export async function updateUser(id, data) {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  return await User.findByIdAndUpdate(id, data, { new: true });
}

export const toggleUserStatus = async (id, status) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const allowedStatuses = ["active", "inactive", "suspended"];
  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const updated = await User.findByIdAndUpdate(id, { status }, { new: true });
  if (!updated) throw new ApiError(404, "User not found");
  return updated;
};

export const getSingleUser = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(id).select("-password").lean();
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

export async function deleteUser(id) {
  const result = await User.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(404, "User not found");
  }
  return result;
}

export const changeUserPasswordService = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new ApiError(400, "Current password is incorrect");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return { message: "Password updated successfully" };
};
