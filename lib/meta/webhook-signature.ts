import crypto from "node:crypto";

export function verifyMetaWebhookSignature(input: { appSecret: string; rawBody: string; signatureHeader: string | null }) {
  if (!input.signatureHeader) return false;
  const [prefix, provided] = input.signatureHeader.split("=");
  if (prefix !== "sha256" || !provided) return false;
  const expected = crypto.createHmac("sha256", input.appSecret).update(input.rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  } catch {
    return false;
  }
}
