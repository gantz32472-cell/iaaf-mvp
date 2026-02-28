import { beforeEach, describe, expect, it } from "vitest";
import { resetMockDb } from "@/tests/helpers";
import { createOffer } from "@/server/modules/offers/service";
import { saveDb } from "@/lib/store/repository";
import { getAnalyticsByOffers } from "@/server/modules/analytics/service";

describe("getAnalyticsByOffers", () => {
  beforeEach(async () => {
    await resetMockDb();
  });

  it("aggregates clicks, dms, conversions and top keywords by offer", async () => {
    const offer1 = await createOffer({
      name: "ブログ案件A",
      category: "blog",
      aspName: "A8",
      destinationUrl: "https://example.com/a",
      angles: ["SEO"],
      prLabelRequired: true,
      ngWords: []
    });
    const offer2 = await createOffer({
      name: "ブログ案件B",
      category: "blog",
      aspName: "A8",
      destinationUrl: "https://example.com/b",
      angles: ["収益導線"],
      prLabelRequired: true,
      ngWords: []
    });

    await saveDb((db) => {
      db.generatedPosts.push({
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        offerIds: [offer1.id],
        category: "blog",
        format: "carousel",
        hookText: "hook",
        scriptText: "script",
        captionText: "caption",
        hashtags: [],
        ctaKeyword: "添削",
        prNotationText: "PR",
        mediaAssetPath: null,
        status: "posted",
        scheduledAt: null,
        postedAt: "2026-02-28T00:00:00.000Z",
        instagramMediaId: "mid",
        errorMessage: null,
        createdAt: "2026-02-28T00:00:00.000Z",
        updatedAt: "2026-02-28T00:00:00.000Z"
      });

      db.dmConversations.push({
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        instagramUserIdHash: "u1",
        messageText: "添削お願いします",
        matchedKeyword: "添削",
        ruleId: null,
        replied: true,
        generatedPostId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        createdAt: "2026-02-28T00:10:00.000Z"
      });

      db.clickEvents.push(
        {
          id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
          shortCode: "code1",
          generatedPostId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          offerId: offer1.id,
          keyword: "添削",
          utmSource: "ig",
          utmCampaign: null,
          userAgent: null,
          ipHash: null,
          clickedAt: "2026-02-28T00:20:00.000Z"
        },
        {
          id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
          shortCode: "code2",
          generatedPostId: null,
          offerId: offer1.id,
          keyword: "SEO",
          utmSource: "ig",
          utmCampaign: null,
          userAgent: null,
          ipHash: null,
          clickedAt: "2026-02-28T00:30:00.000Z"
        }
      );

      db.conversionReports.push({
        id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        date: "2026-02-28",
        offerId: offer1.id,
        cvCount: 2,
        approvedCount: 1,
        revenueAmount: 8000,
        source: "manual",
        createdAt: "2026-02-28T00:40:00.000Z",
        updatedAt: "2026-02-28T00:40:00.000Z"
      });
    });

    const rows = await getAnalyticsByOffers({ from: "2026-02-27", to: "2026-03-01" });
    const top = rows[0];
    const second = rows.find((row) => row.offerId === offer2.id);

    expect(top.offerId).toBe(offer1.id);
    expect(top.clicks).toBe(2);
    expect(top.dms).toBe(1);
    expect(top.cvCount).toBe(2);
    expect(top.revenueAmount).toBe(8000);
    expect(top.topKeywords).toContain("添削");
    expect(second?.clicks).toBe(0);
    expect(second?.dms).toBe(0);
  });
});

