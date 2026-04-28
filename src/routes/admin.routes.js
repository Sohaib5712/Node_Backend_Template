import express from "express";
import rateLimit from "express-rate-limit";
import { protect, authorize } from "../middleware/admin.auth.js";
import * as controller from "../controllers/admin.controller.js";
import { makeForgotPassword, makeResetPassword } from "../controllers/auth.password.controller.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many auth attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Public
router.post("/login", authLimiter, controller.login);
router.post("/forgot-password", authLimiter, makeForgotPassword("admin"));
router.post("/reset-password", authLimiter, makeResetPassword("admin"));

// Protected
router.get("/get-me", protect, controller.getMe);
router.post("/add-user", protect, controller.createAdminUser);
router.get("/get-all", protect, controller.getAdminUsers);
router.get("/get/:id", protect, controller.getSingleAdmin);
router.put("/update-user/:id", protect, controller.updateAdminUser);
router.put("/update-status/:id", protect, controller.toggleAdminStatus);
router.put("/change-password/:id", protect, controller.changeAdminPassword);
router.delete("/delete-user/:id", protect, authorize("superadmin", "admin"), controller.deleteAdminUser);

export default router;
