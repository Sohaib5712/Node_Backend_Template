import Joi from "joi";

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string()
    .trim()
    .length(6)
    .pattern(/^\d{6}$/)
    .required(),
  newPassword: Joi.string().min(6).required(),
});
