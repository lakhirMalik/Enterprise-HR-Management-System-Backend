import express from "express";
import { getAuditLogs } from "../controllers/auditLog.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", protect, authorize("hr", "super_admin"), getAuditLogs);

export default router;