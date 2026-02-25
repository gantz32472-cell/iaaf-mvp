import { z } from "zod";

export const metaCreateContainerResponseSchema = z.object({
  id: z.string()
});

export const metaPublishMediaResponseSchema = z.object({
  id: z.string()
});

export const metaWebhookEnvelopeSchema = z.object({
  object: z.string().optional(),
  entry: z
    .array(
      z.object({
        id: z.string().optional(),
        time: z.number().optional(),
        messaging: z
          .array(
            z.object({
              sender: z.object({ id: z.string() }).optional(),
              message: z.object({ text: z.string().optional() }).optional()
            })
          )
          .optional()
      })
    )
    .optional()
});
