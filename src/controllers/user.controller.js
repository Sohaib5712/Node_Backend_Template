import * as service from "../services/user.service.js";
import * as validator from "../validations/user.validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const login = asyncHandler(async (req, res) => {
  const data = await validator.loginSchema.validateAsync(req.body);
  const result = await service.login(data);
  res.json(ApiResponse.success(result, "Login successful"));
});

export const getMe = asyncHandler(async (req, res) => {
  const userId = req.userId || req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const user = await service.getMe(userId);
  if (!user) throw new ApiError(404, "User not found");

  res.json(ApiResponse.success({ user }, "User fetched"));
});

export const createUser = asyncHandler(async (req, res) => {
  const data = await validator.createSchema.validateAsync(req.body);
  const result = await service.createUser(data);
  res.status(201).json(ApiResponse.success(result, "User created successfully"));
});

export const getUsers = asyncHandler(async (req, res) => {
  const result = await service.getUsers(req.query);
  res.json(ApiResponse.success(result, "Users fetched"));
});

export const getUserById = asyncHandler(async (req, res) => {
  const result = await service.getUserById(req.params.id);
  if (!result) throw new ApiError(404, "User not found");
  res.json(ApiResponse.success(result, "User fetched"));
});

export const updateUser = asyncHandler(async (req, res) => {
  const data = await validator.updateSchema.validateAsync(req.body);
  const result = await service.updateUser(req.params.id, data);
  res.json(ApiResponse.success(result, "User updated"));
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { status } = await validator.toggleStatusSchema.validateAsync(req.body);
  const updated = await service.toggleUserStatus(req.params.id, status);
  res.json(ApiResponse.success(updated, "User status updated"));
});

export const getSingleUser = asyncHandler(async (req, res) => {
  const user = await service.getSingleUser(req.params.id);
  res.json(ApiResponse.success(user, "User fetched"));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const result = await service.deleteUser(req.params.id);
  res.json(ApiResponse.success(result, "User deleted"));
});

export const changeUserPassword = asyncHandler(async (req, res) => {
  const data = await validator.changePasswordSchema.validateAsync(req.body);
  const { currentPassword, newPassword } = data;

  const result = await service.changeUserPasswordService(req.params.id, currentPassword, newPassword);
  res.json(ApiResponse.success(result, "Password changed successfully"));
});
