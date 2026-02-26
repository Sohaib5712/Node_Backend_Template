import userModel from "../models/user.model.js";
import AdminUser from "../models/admin.model.js";
import { send2FAEmail } from "../utils/email.js";
import { generateSixDigitCode } from "../utils/jwt.js";
import ApiError from "../utils/ApiError.js";

// Utility to switch model by role
const getModelByRole = (role) => {
  if (role === "admin") return AdminUser;
  return userModel;
};

// 🔍 Find user by email (generic)
export async function findUserByEmail(email) {
  return userModel.findOne({ email });
}

// ✅ Get a user by ID and role
export const getUserById = async (userId, role = "user") => {
  const model = getModelByRole(role);
  const user = await model.findById(userId);
  if (!user) throw new ApiError(404, `${role} not found`);
  return user;
};

// ✅ Enable or disable 2FA
export const toggleTwoFA = async (userId, enable, role = "user") => {
  const user = await getUserById(userId, role);
  user.twoFactorEnabled = enable;
  await user.save();
  return user;
};

// ✅ Send a 2FA Code via Email
export const send2FACode = async (userId, role = "user") => {
  const user = await getUserById(userId, role);

  if (!user.twoFactorEnabled) {
    throw new ApiError(400, "2FA is not enabled for this user");
  }

  const code = generateSixDigitCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.twoFactorCode = code;
  user.twoFactorCodeExpiresAt = expiresAt;
  user.twoFactorCodeUsed = false;
  await user.save();

  await send2FAEmail(user.email, code);
  return { email: user.email };
};

// ✅ Verify 2FA Code
export const verify2FACode = async (userId, code, role = "user") => {
  const user = await getUserById(userId, role);

  if (!user.twoFactorEnabled) {
    throw new ApiError(400, "2FA not enabled");
  }

  if (user.twoFactorCodeUsed) {
    throw new ApiError(400, "This code has already been used");
  }

  if (user.twoFactorCode !== code) {
    throw new ApiError(401, "Invalid 2FA code");
  }

  if (new Date() > user.twoFactorCodeExpiresAt) {
    throw new ApiError(410, "2FA code has expired");
  }

  user.twoFactorCodeUsed = true;
  await user.save();
};
