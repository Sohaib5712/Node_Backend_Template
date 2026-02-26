// controllers/user.controller.js
import * as service from "../services/user.service.js";
import * as validator from "../validations/user.validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * POST /api/users/login
 */
export const login = asyncHandler(async (req, res) => {
  const data = await validator.loginSchema.validateAsync(req.body);
  const result = await service.login(data);
  res.json(ApiResponse.success(result, "Login successful"));
});

/**
 * GET /api/users/me
 * Requires auth middleware to set req.user
 */
export const getMe = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await service.getMe(req.user.id);
  if (!user) throw new ApiError(404, "User not found");

  return res.json(
    ApiResponse.success({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
        loginHistory: user.loginHistory,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    }),
  );
});

/**
 * POST /api/users
 */
export const createUser = asyncHandler(async (req, res) => {
  const data = await validator.createSchema.validateAsync(req.body);
  const result = await service.createUser(data);
  res.status(201).json(ApiResponse.success(result, "User created successfully", 201));
});

/**
 * GET /api/users
 */
export const getUsers = asyncHandler(async (req, res) => {
  const result = await service.getUsers(req.query);
  res.json(ApiResponse.success(result, "Users fetched"));
});

/**
 * GET /api/users/:id
 */
export const getUserById = asyncHandler(async (req, res) => {
  const result = await service.getUserById(req.params.id);
  if (!result) throw new ApiError(404, "User not found");
  res.json(ApiResponse.success(result, "User fetched"));
});

/**
 * PATCH /api/users/:id
 */
export const updateUser = asyncHandler(async (req, res) => {
  const data = await validator.updateSchema.validateAsync(req.body);
  const result = await service.updateUser(req.params.id, data);
  res.json(ApiResponse.success(result, "User updated"));
});

/**
 * PATCH /api/users/:id/status
 * Body: { status: 'active' | 'inactive' | 'suspended' }
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { status } = await validator.toggleStatusSchema.validateAsync(req.body);
  const updated = await service.toggleUserStatus(req.params.id, status);
  res.json(ApiResponse.success(updated, "User status updated"));
});

/**
 * GET /api/users/single/:id
 * (Parity with your getSingleAdmin)
 */
export const getSingleUser = asyncHandler(async (req, res) => {
  const user = await service.getSingleUser(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  res.json(ApiResponse.success(user, "User fetched"));
});

/**
 * DELETE /api/users/:id
 */
export const deleteUser = asyncHandler(async (req, res) => {
  await service.deleteUser(req.params.id);
  res.json(ApiResponse.success(null, "User deleted"));
});

/**
 * PATCH /api/users/:id/password
 * Body: { currentPassword, newPassword }
 */
export const changeUserPassword = asyncHandler(async (req, res) => {
  const data = await validator.changePasswordSchema.validateAsync(req.body);
  const { currentPassword, newPassword } = data;
  const userId = req.params.id;

  const result = await service.changeUserPasswordService(userId, currentPassword, newPassword);

  res.json(ApiResponse.success(result, "Password changed successfully"));
});
