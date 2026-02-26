import express from "express";
import { protect, authorize } from "../middleware/admin.auth.js";
import * as controller from "../controllers/admin.controller.js";

const router = express.Router();

// Public route
router.post("/login", controller.login);

// Protected routes
router.get("/get-me", protect, controller.getMe);
router.post("/add-user", controller.createAdminUser);
router.get("/get-all", protect, controller.getAdminUsers);
router.get("/get/:id", protect, controller.getSingleAdmin);
router.get("/get-user/:id", protect, controller.getAdminUserById);
router.put("/update-user/:id", protect, controller.updateAdminUser);
router.put("/update-status/:id", protect, controller.toggleAdminStatus);
router.put("/change-password/:id", protect, controller.changeAdminPassword);
router.delete("/delete-user/:id", protect, authorize("superadmin", "admin"), controller.deleteAdminUser);

export default router;
