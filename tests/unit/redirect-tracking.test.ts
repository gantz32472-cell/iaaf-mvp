import { beforeEach, describe, expect, it } from "vitest";
import { resetMockDb } from "@/tests/helpers";
import { createShortLink, resolveRedirectAndTrack } from "@/server/modules/redirects/service";
import { getDb } from "@/lib/store/repository";

describe("redirect tracking", () => {
  beforeEach(async () => {
    await resetMockDb();
  });

  it("stores clickEvents on redirect", async () => {
    await createShortLink({
      targetUrl: "https://example.com/landing",
      generatedPostId: null,
      offerId: null,
      keyword: "wifi",
      utmSource: "instagram",
      utmMedium: "dm",
      utmCampaign: "camp1"
    });
    const db = await getDb();
    const code = db.shortLinks[0].shortCode;

    const result = await resolveRedirectAndTrack({ shortCode: code, userAgent: "Vitest", ip: "127.0.0.1" });
    expect(result?.targetUrl).toContain("utm_source=instagram");

    const after = await getDb();
    expect(after.clickEvents).toHaveLength(1);
    expect(after.clickEvents[0].shortCode).toBe(code);
  });
});
