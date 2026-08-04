import express from "express";
import {
    assignTask,
    getMyTasks,
    getAllTasks,
    upadteTaskStatus,
} from "../controllers/task.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { hasPermission } from "../middlewares/permission.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { assignTaskSchema, updateTaskStatusSchema } from "../validators/task.validator.js";

const router = express.Router();

router.post("/", protect, hasPermission("task:assign"), validate(assignTaskSchema), assignTask);
router.get("/my", protect, hasPermission("task:view"), getMyTasks);
router.get("/", protect, hasPermission("task:assign"), getAllTasks);
router.patch("/:id", protect, hasPermission("task:view"), validate(updateTaskStatusSchema), upadteTaskStatus);

export default router;