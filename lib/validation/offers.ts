import { z } from "zod";

export const offerCategorySchema = z.enum(["internet", "server", "blog", "other"]);
export const offerStatusSchema = z.enum(["active", "paused", "ended"]);

export const offerInputSchema = z.object({
  name: z.string().min(1),
  category: offerCategorySchema,
  aspName: z.string().min(1),
  destinationUrl: z.string().url(),
  referenceUrl: z.string().url().optional().nullable(),
  targetPersona: z.string().optional().nullable(),
  angles: z.array(z.string()).default([]),
  prLabelRequired: z.boolean().default(false),
  ngWords: z.array(z.string()).default([]),
  status: offerStatusSchema.optional()
});

export const offerPatchSchema = offerInputSchema.partial();
