import { describe, expect, it, beforeEach } from "vitest";
import { resetMockDb } from "@/tests/helpers";
import { createOffer } from "@/server/modules/offers/service";
import { runNgCheck } from "@/server/modules/content/ng-check";

describe("NG check", () => {
  beforeEach(async () => {
    await resetMockDb();
  });

  it("fails for strong claims and warns for missing PR", async () => {
    const offer = await createOffer({
      name: "offer",
      category: "internet",
      aspName: "A8",
      destinationUrl: "https://example.com",
      angles: [],
      prLabelRequired: true,
      ngWords: []
    });

    const res = await runNgCheck({
      text: "絶対おすすめ 100%満足",
      offerIds: [offer.id],
      prNotationText: ""
    });

    expect(res.level).toBe("fail");
    expect(res.reasons.join(" ")).toContain("絶対");
  });
});
