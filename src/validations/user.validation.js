// validations/user.validation.js
import Joi from "joi";

export const createSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("user", "premium", "banned"), // adapted from admin roles
  status: Joi.string().valid("active", "inactive", "suspended"),
  meta: Joi.object().optional(), // optional metadata
});

export const updateSchema = createSchema.fork(["email", "password", "username"], (field) => field.optional());

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).unknown(true);

export const toggleStatusSchema = Joi.object({
  status: Joi.string().valid("active", "inactive", "suspended").required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});
