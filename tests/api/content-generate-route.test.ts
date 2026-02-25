import { beforeEach, describe, expect, it } from "vitest";
import { resetMockDb } from "@/tests/helpers";
import { createOffer } from "@/server/modules/offers/service";
import { POST } from "@/app/api/content/generate/route";
import { generatedContentSchema } from "@/lib/validation/content";
import { z } from "zod";

describe("POST /api/content/generate", () => {
  beforeEach(async () => {
    await resetMockDb();
  });

  it("returns schema-valid content payload", async () => {
    const offer = await createOffer({
      name: "WiFi比較",
      category: "internet",
      aspName: "A8",
      destinationUrl: "https://example.com",
      angles: ["料金"],
      prLabelRequired: true,
      ngWords: []
    });

    const req = new Request("http://localhost:3000/api/content/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "internet",
        targetPersona: "初心者",
        angles: ["料金", "速度"],
        offerIds: [offer.id],
        format: "carousel",
        objective: "dm"
      })
    });

    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(true);

    const payloadSchema = z.object({
      generatedPostId: z.string().uuid()
    }).and(generatedContentSchema);
    expect(payloadSchema.safeParse(json.data).success).toBe(true);
  });
});
