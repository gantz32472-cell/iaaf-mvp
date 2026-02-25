import { z } from "zod";

export const analyticsRangeSchema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  period: z.enum(["day", "week", "month"]).optional()
});
