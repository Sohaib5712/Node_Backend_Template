import crypto from "crypto";
import userModel from "../models/user.model.js";
import AdminUser from "../models/admin.model.js";
import { send2FAEmail } from "../utils/email.js";
import { generateSixDigitCode } from "../utils/jwt.js";
import ApiError from "../utils/ApiError.js";

const getModelByRole = (role) => (role === "admin" ? AdminUser : userModel);

const hashCode = (code) => crypto.createHash("sha256").update(String(code)).digest("hex");

export async function findUserByEmail(email, role = "user") {
  const model = getModelByRole(role);
  return model.findOne({ email: email.toLowerCase().trim() });
}

export const getUserById = async (userId, role = "user") => {
  const model = getModelByRole(role);
  const user = await model.findById(userId);
  if (!user) throw new ApiError(404, `${role} not found`);
  return user;
};

export const toggleTwoFA = async (userId, enable, role = "user") => {
  const user = await getUserById(userId, role);
  user.twoFactorEnabled = !!enable;

  // clear any existing code when disabling
  if (!enable) {
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpiresAt = undefined;
    user.twoFactorCodeUsed = false;
  }

  await user.save();
  return { twoFactorEnabled: user.twoFactorEnabled };
};

export const send2FACode = async (userId, role = "user") => {
  const user = await getUserById(userId, role);

  if (!user.twoFactorEnabled) throw new ApiError(400, "2FA is not enabled for this user");

  const code = generateSixDigitCode(); // e.g. "123456"
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  user.twoFactorCode = hashCode(code); // STORE HASHED
  user.twoFactorCodeExpiresAt = expiresAt;
  user.twoFactorCodeUsed = false;

  await user.save();
  await send2FAEmail(user.email, code);

  return { email: user.email, expiresAt };
};

export const verify2FACode = async (userId, code, role = "user") => {
  const user = await getUserById(userId, role);

  if (!user.twoFactorEnabled) throw new ApiError(400, "2FA not enabled");
  if (user.twoFactorCodeUsed) throw new ApiError(400, "This code has already been used");
  if (!user.twoFactorCode || !user.twoFactorCodeExpiresAt) throw new ApiError(400, "2FA code not requested");

  if (new Date() > user.twoFactorCodeExpiresAt) throw new ApiError(410, "2FA code has expired");

  const provided = hashCode(code);
  if (user.twoFactorCode !== provided) throw new ApiError(401, "Invalid 2FA code");

  user.twoFactorCodeUsed = true;
  await user.save();

  return { verified: true };
};
