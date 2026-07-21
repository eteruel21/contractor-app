import { z } from "zod";

export const addProgressHistorySchema = z.object({
  progressPercentage: z.number().min(0).max(100),
  notes: z.string().optional().nullable()
});
