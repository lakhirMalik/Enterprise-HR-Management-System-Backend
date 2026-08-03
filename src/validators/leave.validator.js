import { z } from "zod";

export const requestLeaveSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(3, "Reason must be at least 3 characters"),
});

export const updateLeaveStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});