import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  closeJob,
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} from "../controllers/job.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { hasPermission } from "../middlewares/permission.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createJobSchema,
  applyJobSchema,
  updateApplicationStatusSchema,
} from "../validators/job.validator.js";

const router = express.Router();

// Specific routes BEFORE param routes
router.get("/applications/my", protect, getMyApplications);
router.patch("/applications/:id", protect, hasPermission("application:review"), validate(updateApplicationStatusSchema), updateApplicationStatus);

router.post("/", protect, hasPermission("job:manage"), validate(createJobSchema), createJob);
router.get("/", getJobs);

router.get("/:id", getJobById);
router.patch("/:id/close", protect, hasPermission("job:manage"), closeJob);
router.get("/:id/applications", protect, hasPermission("application:review"), getJobApplications);
router.post("/:id/apply", protect, validate(applyJobSchema), applyToJob);

export default router;