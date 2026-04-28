import express from "express";
import rateLimit from "express-rate-limit";
import { protect, authorize, authorizeSelfOr } from "../middleware/user.auth.js";
import * as controller from "../controllers/user.controller.js";
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
router.post("/forgot-password", authLimiter, makeForgotPassword("user"));
router.post("/reset-password", authLimiter, makeResetPassword("user"));

// Protected (me)
router.get("/get-me", protect, controller.getMe);

// Admin-only user management
router.post("/add-user", protect, authorize("admin"), controller.createUser);
router.get("/get-all", protect, authorize("admin"), controller.getUsers);
router.get("/get/:id", protect, authorize("admin"), controller.getSingleUser);
router.put("/update-user/:id", protect, authorize("admin"), controller.updateUser);
router.put("/update-status/:id", protect, authorize("admin"), controller.toggleUserStatus);
router.put("/change-password/:id", protect, authorizeSelfOr("admin"), controller.changeUserPassword);
router.delete("/delete-user/:id", protect, authorize("admin"), controller.deleteUser);

export default router;
