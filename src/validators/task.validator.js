import { z } from "zod";

export const assignTaskSchema = z.object({
    title: z.string().min(2, "Title is required"),
    description: z.string().optional(),
    assignedTo: z.string().min(1, "assignedTo is required"),
    dueDate: z.string().optional(),
});

export const updateTaskStatusSchema = z.object({
    status: z.enum(["pending", "in_progress", "completed"]),
});