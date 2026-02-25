import { z } from "zod";

export const dmMatchTypeSchema = z.enum(["partial", "exact"]);

export const dmRuleInputSchema = z.object({
  keyword: z.string().min(1),
  matchType: dmMatchTypeSchema,
  reply1: z.string().min(1),
  reply2: z.string().optional().nullable(),
  delayMinutesForReply2: z.number().int().min(0).optional().nullable(),
  targetUrl: z.string().url(),
  cooldownHours: z.number().int().min(1).default(24),
  isActive: z.boolean().default(true)
});

export const dmRulePatchSchema = dmRuleInputSchema.partial();

export const dmRuleTestMatchSchema = z.object({
  messageText: z.string().min(1)
});
