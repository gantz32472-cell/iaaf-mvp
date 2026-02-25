import { processIncomingDm } from "@/server/modules/dm-rules/service";
import { logger } from "@/server/services/logger";

export async function handleInstagramMessageWebhook(input: {
  instagramUserId: string;
  messageText: string;
  generatedPostId?: string | null;
}) {
  const result = await processIncomingDm(input);
  logger.info("Mock Instagram message webhook processed", { matched: !!result.reply });
  return result;
}

export async function handleMetaInstagramWebhookEnvelope(payload: unknown) {
  const entries = Array.isArray((payload as { entry?: unknown[] })?.entry)
    ? ((payload as { entry: Array<{ messaging?: Array<{ sender?: { id?: string }; message?: { text?: string } }> }> }).entry ?? [])
    : [];

  const results = [];
  for (const entry of entries) {
    for (const messaging of entry.messaging ?? []) {
      const senderId = messaging.sender?.id;
      const messageText = messaging.message?.text;
      if (!senderId || !messageText) continue;
      const result = await processIncomingDm({ instagramUserId: senderId, messageText });
      results.push(result);
    }
  }
  logger.info("Meta webhook envelope processed", { count: results.length });
  return { processed: results.length, results };
}

export async function handleInstagramCommentWebhook(input: {
  instagramUserId: string;
  commentText: string;
  mediaId?: string | null;
}) {
  logger.info("Mock comment webhook received", input);
  return { ok: true, receivedAt: new Date().toISOString(), input };
}
