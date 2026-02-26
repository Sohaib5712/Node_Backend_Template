import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/user.model.js";
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
  for (const k of allowedKeys) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
};

export async function getMe(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400, "Invalid user ID");
  return User.findById(userId).select("-password").lean();
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select("+password"); // ensure password is selected if schema sets select:false
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  if (user.status !== "active") {
    throw new ApiError(403, "Account is not active");
  }

  if (user.twoFactorEnabled) {
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
  if (user.loginHistory.length > 20) user.loginHistory = user.loginHistory.slice(-20);

  await user.save();

  const safeUser = await User.findById(user._id).select("-password").lean();
  return { token, user: safeUser };
}

export async function createUser(data) {
  const exists = await User.findOne({ email: data.email }).lean();
  if (exists) throw new ApiError(409, "Email already in use");

  const usernameTaken = await User.findOne({ username: data.username }).lean();
  if (usernameTaken) throw new ApiError(409, "Username already in use");

  const hashed = await bcrypt.hash(data.password, 10);
  const user = await User.create({ ...data, password: hashed });

  const safeUser = await User.findById(user._id).select("-password").lean();
  return safeUser;
}

export async function getUsers({ page = 1, limit = 10, search = "", status }) {
  const pageNum = toInt(page, 1);
  const limitNum = Math.min(toInt(limit, 10), 100); // cap for safety

  const query = {};
  if (search) {
    query.$or = [{ username: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
  }
  if (status) query.status = status;

  const total = await User.countDocuments(query);
  const results = await User.find(query)
    .select("-password")
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .sort({ createdAt: -1 })
    .lean();

  return paginate(results, pageNum, limitNum, total);
}

export async function getUserById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid user ID");
  return User.findById(id).select("-password").lean();
}

export async function getSingleUser(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid user ID");
  const user = await User.findById(id).select("-password").lean();
  if (!user) throw new ApiError(404, "User not found");
  return user;
}

export async function updateUser(id, data) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid user ID");

  // Allowlist fields (prevents accidental privilege escalation)
  const allowed = ["username", "email", "status", "meta", "twoFactorEnabled", "role"];
  const update = pick(data, allowed);

  // If password is present, hash it (only if you explicitly allow password updates here)
  if (data.password) {
    update.password = await bcrypt.hash(data.password, 10);
  }

  const updated = await User.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  })
    .select("-password")
    .lean();

  if (!updated) throw new ApiError(404, "User not found");
  return updated;
}

export async function toggleUserStatus(id, status) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid user ID");

  const allowedStatuses = ["active", "inactive", "suspended"];
  if (!allowedStatuses.includes(status)) throw new ApiError(400, "Invalid status value");

  const updated = await User.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
    .select("-password")
    .lean();

  if (!updated) throw new ApiError(404, "User not found");
  return updated;
}

export async function deleteUser(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid user ID");

  const result = await User.findByIdAndDelete(id).lean();
  if (!result) throw new ApiError(404, "User not found");

  return { deleted: true };
}

export async function changeUserPasswordService(userId, currentPassword, newPassword) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400, "Invalid user ID");

  const user = await User.findById(userId).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new ApiError(400, "Current password is incorrect");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return { message: "Password updated successfully" };
}
