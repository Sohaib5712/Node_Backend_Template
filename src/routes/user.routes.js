import express from "express";
import { protect, authorize, authorizeSelfOr } from "../middleware/user.auth.js";
import * as controller from "../controllers/user.controller.js";

const router = express.Router();

// Public
router.post("/login", controller.login);

// Protected (me)
router.get("/get-me", protect, controller.getMe);

// Admin-only user management
router.post("/add-user", protect, authorize("admin"), controller.createUser);
router.get("/get-all", protect, authorize("admin"), controller.getUsers);

// Read user
router.get("/get/:id", protect, authorize("admin"), controller.getSingleUser);
router.get("/get-user/:id", protect, authorize("admin"), controller.getUserById);

// Update user (admin)
router.put("/update-user/:id", protect, authorize("admin"), controller.updateUser);
router.put("/update-status/:id", protect, authorize("admin"), controller.toggleUserStatus);

// Change password: self or admin
router.put("/change-password/:id", protect, authorizeSelfOr("admin"), controller.changeUserPassword);

// Delete (admin)
router.delete("/delete-user/:id", protect, authorize("admin"), controller.deleteUser);

export default router;
