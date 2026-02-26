import * as service from "../services/admin.service.js";
import * as validator from "../validations/admin.validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const login = asyncHandler(async (req, res) => {
  const data = await validator.loginSchema.validateAsync(req.body);
  const result = await service.login(data);
  res.json(ApiResponse.success(result, "Login successful"));
});

export const getMe = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  if (!adminId) throw new ApiError(401, "Unauthorized");

  const user = await service.getMe(adminId);
  if (!user) throw new ApiError(404, "Admin not found");

  res.json(ApiResponse.success({ user }, "Admin fetched"));
});

export const createAdminUser = asyncHandler(async (req, res) => {
  const data = await validator.createSchema.validateAsync(req.body);
  const result = await service.createAdminUser(data);
  res.status(201).json(ApiResponse.success(result, "Admin user created successfully"));
});

export const getAdminUsers = asyncHandler(async (req, res) => {
  const result = await service.getAdminUsers(req.query);
  res.json(ApiResponse.success(result, "Admin users fetched"));
});

export const getAdminUserById = asyncHandler(async (req, res) => {
  const result = await service.getAdminUserById(req.params.id);
  if (!result) throw new ApiError(404, "Admin user not found");
  res.json(ApiResponse.success(result, "Admin user fetched"));
});

export const updateAdminUser = asyncHandler(async (req, res) => {
  const data = await validator.updateSchema.validateAsync(req.body);
  const result = await service.updateAdminUser(req.params.id, data);
  res.json(ApiResponse.success(result, "Admin user updated"));
});

export const toggleAdminStatus = asyncHandler(async (req, res) => {
  // Ideally validate with Joi schema like toggleStatusSchema
  const { status } = req.body;
  const updated = await service.toggleAdminStatus(req.params.id, status);
  res.json(ApiResponse.success(updated, "Admin status updated"));
});

export const getSingleAdmin = asyncHandler(async (req, res) => {
  const admin = await service.getSingleAdmin(req.params.id);
  res.json(ApiResponse.success(admin, "Admin fetched"));
});

export const deleteAdminUser = asyncHandler(async (req, res) => {
  const result = await service.deleteAdminUser(req.params.id);
  res.json(ApiResponse.success(result, "Admin user deleted"));
});

export const changeAdminPassword = asyncHandler(async (req, res) => {
  // Ideally validate with Joi schema
  const { currentPassword, newPassword } = req.body;
  const result = await service.changeAdminPasswordService(req.params.id, currentPassword, newPassword);
  res.json(ApiResponse.success(result, "Password changed successfully"));
});
