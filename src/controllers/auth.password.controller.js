// controllers/auth.password.controller.js
import * as svc from "../services/password.service.js";
import * as validator from "../validations/auth.validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = await validator.forgotPasswordSchema.validateAsync(req.body);
  const result = await svc.requestPasswordReset({ email });
  res.json(ApiResponse.success(result, "If this email exists, we sent a reset code"));
});

export const resetPassword = asyncHandler(async (req, res) => {
  console.log("Reset Password Request Body:", req.body);
  const data = await validator.resetPasswordSchema.validateAsync(req.body);
  const result = await svc.resetPassword(data);
  res.json(ApiResponse.success(result, "Password reset successful"));
});
