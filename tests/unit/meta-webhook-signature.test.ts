import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyMetaWebhookSignature } from "@/lib/meta/webhook-signature";

describe("meta webhook signature", () => {
  it("verifies valid signature", () => {
    const appSecret = "secret123";
    const rawBody = JSON.stringify({ hello: "world" });
    const sig = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
    const ok = verifyMetaWebhookSignature({
      appSecret,
      rawBody,
      signatureHeader: `sha256=${sig}`
    });
    expect(ok).toBe(true);
  });

  it("rejects invalid signature", () => {
    const ok = verifyMetaWebhookSignature({
      appSecret: "secret123",
      rawBody: "{}",
      signatureHeader: "sha256=deadbeef"
    });
    expect(ok).toBe(false);
  });
});
