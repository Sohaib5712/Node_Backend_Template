import bcrypt from "bcryptjs";
import crypto from "crypto";
import Admin from "../models/admin.model.js";
import ApiError from "../utils/ApiError.js";
import { sendPasswordResetCodeEmail } from "../utils/email.js";

function generateCode() {
  const n = crypto.randomInt(0, 1_000_000);
  return n.toString().padStart(6, "0");
}

function hashCode(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

export async function requestPasswordReset({ email }) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await Admin.findOne({ email: normalizedEmail });

  // prevent enumeration
  if (!user) return { sent: true };

  const code = generateCode();

  user.resetPasswordToken = hashCode(code); // HASHED
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendPasswordResetCodeEmail(normalizedEmail, code);
  return { sent: true };
}

export async function resetPassword({ email, code, newPassword }) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await Admin.findOne({ email: normalizedEmail }).select("+password");
  if (!user) throw new ApiError(400, "Invalid reset request");

  if (!user.resetPasswordToken || !user.resetPasswordExpires) {
    throw new ApiError(400, "Reset code not requested");
  }

  if (new Date() > user.resetPasswordExpires) {
    throw new ApiError(400, "Reset code expired");
  }

  const provided = hashCode(code);
  if (user.resetPasswordToken !== provided) {
    throw new ApiError(400, "Invalid reset code");
  }

  user.password = await bcrypt.hash(newPassword, 10);

  // clear fields (single use)
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return { message: "Password has been reset" };
}
