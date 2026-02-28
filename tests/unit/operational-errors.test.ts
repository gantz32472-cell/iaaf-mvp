import { beforeEach, describe, expect, it } from "vitest";
import { resetMockDb } from "@/tests/helpers";
import { saveDb } from "@/lib/store/repository";
import { getOperationalErrors } from "@/server/modules/analytics/service";

describe("getOperationalErrors", () => {
  beforeEach(async () => {
    await resetMockDb();
  });

  it("returns failed publish and invalid schedule rows", async () => {
    await saveDb((db) => {
      db.generatedPosts.push(
        {
          id: "11111111-1111-1111-1111-111111111111",
          offerIds: [],
          category: "internet",
          format: "carousel",
          hookText: "failed hook",
          scriptText: "script",
          captionText: "caption",
          hashtags: [],
          ctaKeyword: "wifi",
          prNotationText: "PR",
          mediaAssetPath: null,
          status: "failed",
          scheduledAt: null,
          postedAt: null,
          instagramMediaId: null,
          errorMessage: "Meta API error",
          createdAt: "2026-02-28T00:00:00.000Z",
          updatedAt: "2026-02-28T01:00:00.000Z"
        },
        {
          id: "22222222-2222-2222-2222-222222222222",
          offerIds: [],
          category: "internet",
          format: "carousel",
          hookText: "scheduled hook",
          scriptText: "script",
          captionText: "caption",
          hashtags: [],
          ctaKeyword: "wifi",
          prNotationText: "PR",
          mediaAssetPath: null,
          status: "scheduled",
          scheduledAt: "invalid-date",
          postedAt: null,
          instagramMediaId: null,
          errorMessage: null,
          createdAt: "2026-02-28T00:00:00.000Z",
          updatedAt: "2026-02-28T02:00:00.000Z"
        }
      );
    });

    const out = await getOperationalErrors({ limit: 10 });
    expect(out.total).toBe(2);
    expect(out.rows[0].source).toBe("post_schedule");
    expect(out.rows[1].source).toBe("post_publish");
  });
});

