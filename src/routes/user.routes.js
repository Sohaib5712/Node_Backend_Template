// routes/user.routes.js
import express from "express";
import { protect, authorize } from "../middleware/user.auth.js"; // user-specific middleware
import * as controller from "../controllers/user.controller.js";

const router = express.Router();

// Public route
router.post("/login", controller.login);

// Protected routes
router.get("/get-me", protect, controller.getMe);
router.post("/add-user", controller.createUser); // You can wrap with protect/authorize if only certain roles can create
router.get("/get-all", protect, controller.getUsers);
router.get("/get/:id", protect, controller.getSingleUser);
router.get("/get-user/:id", protect, controller.getUserById);
router.put("/update-user/:id", protect, controller.updateUser);
router.put("/update-status/:id", protect, controller.toggleUserStatus);
router.put("/change-password/:id", protect, controller.changeUserPassword);
router.delete(
  "/delete-user/:id",
  protect,
  authorize("admin"), // adjust roles as needed, e.g., authorize("admin", "superadmin")
  controller.deleteUser,
);

export default router;
