import { z } from "zod";

export const contentGenerateInputSchema = z.object({
  category: z.string().min(1),
  targetPersona: z.string().optional().nullable(),
  angles: z.array(z.string()).default([]),
  offerIds: z.array(z.string().uuid()).min(1),
  format: z.enum(["carousel", "reel"]),
  objective: z.enum(["dm", "click"])
});

export const generatedContentSchema = z.object({
  hookCandidates: z.array(z.string()).length(3),
  carouselPages: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
  scriptText: z.string(),
  captionText: z.string(),
  hashtags: z.array(z.string()),
  ctaKeyword: z.string(),
  prNotationText: z.string().nullable().optional()
});

export const ngCheckInputSchema = z.object({
  text: z.string().min(1),
  prNotationText: z.string().optional().nullable(),
  offerIds: z.array(z.string().uuid()).optional().default([]),
  hookText: z.string().optional().default(""),
  captionText: z.string().optional().default("")
});

export const renderCarouselInputSchema = z.object({
  pages: z.array(z.object({ title: z.string(), body: z.string() })).min(1)
});
