import express from "express";
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
} from "../controllers/attendance.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { hasPermission } from "../middlewares/permission.middleware.js";

const router = express.Router();

router.post("/check-in", protect, hasPermission("attendance:mark"), checkIn);
router.post("/check-out", protect, hasPermission("attendance:mark"), checkOut);
router.get("/my", protect, hasPermission("attendance:mark"), getMyAttendance);
router.get("/", protect, hasPermission("attendance:view"), getAllAttendance);

export default router;