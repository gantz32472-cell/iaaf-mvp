import { processIncomingDm } from "@/server/modules/dm-rules/service";
import { logger } from "@/server/services/logger";

type InstagramDmEvent = {
  senderId: string;
  messageText: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function readTextMessage(value: unknown): string | null {
  const record = asRecord(value);
  if (!record) return null;

  const directText = record.text;
  if (typeof directText === "string" && directText.trim().length > 0) return directText;

  // Some payloads wrap text in { text: { body: "..." } }.
  const wrappedText = asRecord(record.text);
  if (typeof wrappedText?.body === "string" && wrappedText.body.trim().length > 0) return wrappedText.body;

  // Some payloads wrap text in { message: { text: "..." } }.
  const message = asRecord(record.message);
  if (typeof message?.text === "string" && message.text.trim().length > 0) return message.text;

  return null;
}

export function extractInstagramDmEvents(payload: unknown): InstagramDmEvent[] {
  const envelope = asRecord(payload);
  const entries = Array.isArray(envelope?.entry) ? envelope.entry : [];
  const events: InstagramDmEvent[] = [];

  for (const rawEntry of entries) {
    const entry = asRecord(rawEntry);
    if (!entry) continue;

    // Standard Meta messaging shape: entry[].messaging[].message.text
    const messagingEvents = Array.isArray(entry.messaging) ? entry.messaging : [];
    for (const rawMessageEvent of messagingEvents) {
      const messageEvent = asRecord(rawMessageEvent);
      if (!messageEvent) continue;
      const sender = asRecord(messageEvent.sender);
      const senderId = typeof sender?.id === "string" ? sender.id : null;
      const messageText = readTextMessage(messageEvent.message);
      if (!senderId || !messageText) continue;
      events.push({ senderId, messageText });
    }

    // Alternate shape: entry[].changes[] with field=messages
    const changes = Array.isArray(entry.changes) ? entry.changes : [];
    for (const rawChange of changes) {
      const change = asRecord(rawChange);
      if (!change || change.field !== "messages") continue;

      const value = asRecord(change.value);
      if (!value) continue;

      const from = asRecord(value.from);
      const topLevelSenderId = typeof from?.id === "string" ? from.id : null;
      const topLevelText = readTextMessage(value);
      if (topLevelSenderId && topLevelText) {
        events.push({ senderId: topLevelSenderId, messageText: topLevelText });
      }

      const nestedMessages = Array.isArray(value.messages) ? value.messages : [];
      for (const rawNestedMessage of nestedMessages) {
        const nestedMessage = asRecord(rawNestedMessage);
        if (!nestedMessage) continue;
        const senderId =
          typeof nestedMessage.from === "string"
            ? nestedMessage.from
            : typeof topLevelSenderId === "string"
              ? topLevelSenderId
              : null;
        const messageText = readTextMessage(nestedMessage);
        if (!senderId || !messageText) continue;
        events.push({ senderId, messageText });
      }
    }
  }

  return events;
}

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
  const dmEvents = extractInstagramDmEvents(payload);
  const results = [];
  for (const event of dmEvents) {
    const result = await processIncomingDm({ instagramUserId: event.senderId, messageText: event.messageText });
    results.push(result);
  }
  if (results.length === 0) {
    const objectType = asRecord(payload)?.object;
    logger.warn("Meta webhook envelope received but no DM events extracted", {
      objectType: typeof objectType === "string" ? objectType : "unknown"
    });
  }
  logger.info("Meta webhook envelope processed", { count: results.length });
  return { processed: results.length, results };
}

export async function handleMetaInstagramCommentWebhookEnvelope(payload: unknown) {
  const entries = Array.isArray((payload as { entry?: unknown[] })?.entry)
    ? ((payload as { entry: Array<{ changes?: Array<{ field?: string; value?: Record<string, unknown> }> }> }).entry ?? [])
    : [];

  const results = [];
  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "comments") continue;
      const value = change.value ?? {};
      const from = (value.from as { id?: string } | undefined) ?? undefined;
      const commentText = typeof value.text === "string" ? value.text : undefined;
      const media = (value.media as { id?: string } | undefined) ?? undefined;
      if (!from?.id || !commentText) continue;
      const result = await handleInstagramCommentWebhook({
        instagramUserId: from.id,
        commentText,
        mediaId: media?.id ?? null
      });
      results.push(result);
    }
  }
  logger.info("Meta comment webhook envelope processed", { count: results.length });
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
