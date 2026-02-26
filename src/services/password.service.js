// services/password.service.js
import bcrypt from "bcryptjs";
import crypto from "crypto";
import Admin from "../models/admin.model.js";
import ApiError from "../utils/ApiError.js";
import { sendPasswordResetCodeEmail } from "../utils/email.js";

function generateCode() {
  // cryptographically stronger 6-digit code (000000–999999, zero-padded)
  const n = crypto.randomInt(0, 1_000_000);
  return n.toString().padStart(6, "0");
}

export async function requestPasswordReset({ email }) {
  const user = await Admin.findOne({ email: email.toLowerCase().trim() });
  // To avoid user enumeration, we still respond success even if not found.
  if (!user) return { sent: true };

  const code = generateCode();
  user.resetPasswordToken = code; // store code here (string)
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await user.save();

  await sendPasswordResetCodeEmail(email, code);
  return { sent: true };
}

export async function resetPassword({ email, code, newPassword }) {
  const user = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!user) throw new ApiError(400, "Invalid reset request");

  if (!user.resetPasswordToken || !user.resetPasswordExpires) {
    throw new ApiError(400, "Reset code not requested");
  }

  const now = new Date();
  if (now > user.resetPasswordExpires) {
    throw new ApiError(400, "Reset code expired");
  }

  if (String(user.resetPasswordToken).trim() !== String(code).trim()) {
    throw new ApiError(400, "Invalid reset code");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  // Clear reset fields so the code cannot be reused
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: "Password has been reset" };
}
