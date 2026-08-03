import express from "express";
import {
  requestLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} from "../controllers/leave.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { hasPermission } from "../middlewares/permission.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { requestLeaveSchema, updateLeaveStatusSchema } from "../validators/leave.validator.js";

const router = express.Router();

router.post("/", protect, hasPermission("leave:request"), validate(requestLeaveSchema), requestLeave);
router.get("/my", protect, hasPermission("leave:request"), getMyLeaves);
router.get("/", protect, hasPermission("leave:approve"), getAllLeaves);
router.patch("/:id", protect, hasPermission("leave:approve"), validate(updateLeaveStatusSchema), updateLeaveStatus);

export default router;