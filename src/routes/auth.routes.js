import express from "express";
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import { loginLimiter } from "../middlewares/rateLimit.middleware.js";
import { checkAccountStatus } from "../middlewares/account.middleware.js";
import { hasPermission } from "../middlewares/permission.middleware.js";
import { isOwner } from "../middlewares/owner.middleware.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", loginLimiter, validate(loginSchema), loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/me", protect, checkAccountStatus, (req, res) => {
  res.status(200).json({ message: "You are authenticated", user: req.user });
});

router.get("/hr-only", protect, authorize("hr", "super_admin"), (req, res) => {
  res.status(200).json({ message: "Welcome, HR or Super Admin!" });
});
router.delete("/test-delete-employee", protect, hasPermission("employee:delete"), (req, res) => {
  res.status(200).json({message: "You have permission to delete employees"})
});

router.get("/profile/:id", protect, isOwner("id"), (req, res) => {
  res.status(200).json({message: "This is your own profile", userId: req.params.id});
});

export default router;