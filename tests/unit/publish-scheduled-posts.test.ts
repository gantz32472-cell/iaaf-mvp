import { beforeEach, describe, expect, it } from "vitest";
import { resetMockDb } from "@/tests/helpers";
import { saveGeneratedPostDraft } from "@/server/modules/content/service";
import { schedulePost, publishScheduledPosts } from "@/server/modules/posts/service";
import { getDb } from "@/lib/store/repository";

describe("publishScheduledPosts", () => {
  beforeEach(async () => {
    await resetMockDb();
  });

  it("publishes due scheduled posts", async () => {
    const post = await saveGeneratedPostDraft({
      offerIds: [],
      category: "internet",
      format: "carousel",
      hookText: "hook",
      scriptText: "script",
      captionText: "caption",
      hashtags: [],
      ctaKeyword: "wifi",
      prNotationText: "PR",
      mediaAssetPath: "/templates/carousel-template-1.svg"
    });
    await schedulePost(post.id, new Date(Date.now() - 60_000).toISOString());

    const res = await publishScheduledPosts();
    expect(res.due).toBe(1);
    expect(res.published).toBe(1);

    const db = await getDb();
    expect(db.generatedPosts[0].status).toBe("posted");
    expect(db.generatedPosts[0].instagramMediaId).toContain("mock_carousel_");
  });
});
