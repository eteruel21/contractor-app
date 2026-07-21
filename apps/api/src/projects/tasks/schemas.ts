import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "in_progress", "review", "completed"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "El título de la tarea es requerido"),
  description: z.string().optional().nullable(),
  assignedUserId: z.string().uuid().optional().nullable(),
  status: taskStatusSchema.default("todo"),
  priority: taskPrioritySchema.default("medium"),
  dueDate: z.string().optional().nullable()
});

export const updateTaskSchema = createTaskSchema.partial();
