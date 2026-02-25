import { z } from "zod";

export const instagramMessageWebhookSchema = z.object({
  instagramUserId: z.string().min(1),
  messageText: z.string().min(1),
  generatedPostId: z.string().uuid().optional().nullable()
});

export const instagramCommentWebhookSchema = z.object({
  instagramUserId: z.string().min(1),
  commentText: z.string().min(1),
  mediaId: z.string().optional().nullable()
});
