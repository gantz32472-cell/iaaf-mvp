import { z } from "zod";

export const postFormatSchema = z.enum(["carousel", "reel"]);
export const generatedPostStatusSchema = z.enum(["draft", "scheduled", "posted", "failed"]);

export const schedulePostSchema = z.object({
  generatedPostId: z.string().uuid(),
  scheduledAt: z.string().datetime()
});
