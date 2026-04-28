import crypto from "crypto";
import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";
import ApiError from "../utils/ApiError.js";
import { hashPassword } from "../utils/password.js";
import { sendPasswordResetCodeEmail } from "../emails/index.js";

const getModel = (role) => (role === "admin" ? Admin : User);

const generateCode = () => crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

const hashCode = (code) => crypto.createHash("sha256").update(String(code)).digest("hex");

export async function requestPasswordReset({ email, role = "user" }) {
  const Model = getModel(role);
  const normalizedEmail = email.toLowerCase().trim();
  const user = await Model.findOne({ email: normalizedEmail });

  // prevent enumeration — always return the same response
  if (!user) return { sent: true };

  const code = generateCode();
  user.resetPasswordToken = hashCode(code);
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendPasswordResetCodeEmail(normalizedEmail, code);
  return { sent: true };
}

export async function resetPassword({ email, code, newPassword, role = "user" }) {
  const Model = getModel(role);
  const normalizedEmail = email.toLowerCase().trim();
  const user = await Model.findOne({ email: normalizedEmail }).select("+password");
  if (!user) throw new ApiError(400, "Invalid reset request");

  if (!user.resetPasswordToken || !user.resetPasswordExpires) {
    throw new ApiError(400, "Reset code not requested");
  }

  if (new Date() > user.resetPasswordExpires) {
    throw new ApiError(400, "Reset code expired");
  }

  if (user.resetPasswordToken !== hashCode(code)) {
    throw new ApiError(400, "Invalid reset code");
  }

  user.password = await hashPassword(newPassword);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: "Password has been reset" };
}
