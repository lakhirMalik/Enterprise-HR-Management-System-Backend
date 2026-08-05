import express from "express";
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getSalary,
  updateSalary,
  getMyTeam,
  restoreEmployee,
} from "../controllers/employee.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { hasPermission } from "../middlewares/permission.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createEmployeeSchema, updateEmployeeSchema } from "../validators/employee.validator.js";

const router = express.Router();

router.post("/", protect, hasPermission("employee:create"), validate(createEmployeeSchema), createEmployee);
router.get("/team", protect, authorize("manager", "hr", "super_admin"), getMyTeam);
router.get("/", protect, hasPermission("employee:read"), getEmployees);
router.get("/:id", protect, hasPermission("employee:read"), getEmployeeById);
router.patch("/:id", protect, hasPermission("employee:update"), validate(updateEmployeeSchema), updateEmployee);
router.delete("/:id", protect, hasPermission("employee:delete"), deleteEmployee);
router.patch("/:id/restore", protect, authorize("hr", "super_admin"), restoreEmployee);

router.get("/:id/salary", protect, getSalary);
router.patch("/:id/salary", protect, hasPermission("salary:update"), updateSalary);

export default router;