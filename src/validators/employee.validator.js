import { z } from "zod";

export const createEmployeeSchema = z.object({
    user: z.string().min(1, "User ID is required"),
    department: z.string().min(2, "Department is required"),
    position: z.string().min(2, "Position is required"),
    salary: z.number().positive("salary must be a positive number"),
    manager: z.string().optional().nullable(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();