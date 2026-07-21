import { z } from "zod";

export const activityTypeSchema = z.enum(["visit", "meeting", "work", "payment", "other"]);
export const activityStatusSchema = z.enum(["scheduled", "confirmed", "completed", "cancelled"]);

export const createActivitySchema = z.object({
  companyId: z.string().uuid(),
  clientId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
  assignedUserId: z.string().uuid().optional().nullable(),
  title: z.string().min(1, "El título es requerido"),
  type: activityTypeSchema.default("visit"),
  status: activityStatusSchema.default("scheduled"),
  date: z.string().min(1, "La fecha es requerida"),
  startTime: z.string().default("09:00"),
  endTime: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  reminderMinutes: z.number().int().nonnegative().default(15)
});

export const updateActivitySchema = createActivitySchema.partial();
