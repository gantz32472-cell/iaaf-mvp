import { withApiErrorHandling, jsonError, jsonOk } from "@/lib/api/next";
import { instagramMessageWebhookSchema } from "@/lib/validation/webhooks";
import { handleInstagramMessageWebhook, handleMetaInstagramWebhookEnvelope } from "@/server/modules/webhooks/service";
import { verifyMetaWebhookSignature } from "@/lib/meta/webhook-signature";

export const GET = withApiErrorHandling(async (request: Request) => {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.META_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return jsonError("WEBHOOK_VERIFY_FAILED", "Invalid webhook verification", 403);
});

export const POST = withApiErrorHandling(async (request: Request) => {
  const rawBody = await request.text();
  const contentType = request.headers.get("content-type") ?? "";
  const signatureHeader = request.headers.get("x-hub-signature-256");

  if (signatureHeader && process.env.META_APP_SECRET) {
    const ok = verifyMetaWebhookSignature({
      appSecret: process.env.META_APP_SECRET,
      rawBody,
      signatureHeader
    });
    if (!ok) return jsonError("INVALID_SIGNATURE", "Invalid Meta webhook signature", 401);
  }

  const body = JSON.parse(rawBody || "{}");
  if (contentType.includes("application/json") && body?.entry) {
    return jsonOk(await handleMetaInstagramWebhookEnvelope(body));
  }

  const parsed = instagramMessageWebhookSchema.parse(body);
  return jsonOk(await handleInstagramMessageWebhook(parsed));
});
