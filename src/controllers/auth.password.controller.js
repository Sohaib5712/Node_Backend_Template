import * as svc from "../services/password.service.js";
import * as validator from "../validations/auth.validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const makeForgotPassword = (role = "user") =>
  asyncHandler(async (req, res) => {
    const { email } = await validator.forgotPasswordSchema.validateAsync(req.body);
    const result = await svc.requestPasswordReset({ email, role });
    res.json(ApiResponse.success(result, "If this email exists, we sent a reset code"));
  });

export const makeResetPassword = (role = "user") =>
  asyncHandler(async (req, res) => {
    const data = await validator.resetPasswordSchema.validateAsync(req.body);
    const result = await svc.resetPassword({ ...data, role });
    res.json(ApiResponse.success(result, "Password reset successful"));
  });
