import { beforeEach, describe, expect, it } from "vitest";
import { resetMockDb } from "@/tests/helpers";
import { saveGeneratedPostDraft } from "@/server/modules/content/service";
import { schedulePost, publishPostNow, publishScheduledPosts } from "@/server/modules/posts/service";
import { getDb, saveDb } from "@/lib/store/repository";

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

  it("is idempotent when publish-now is called for already posted post", async () => {
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

    const first = await publishPostNow(post.id);
    const second = await publishPostNow(post.id);

    expect(first.status).toBe("posted");
    expect(second.status).toBe("posted");
    expect(second.instagramMediaId).toBe(first.instagramMediaId);
  });

  it("counts invalid scheduledAt rows without crashing the batch", async () => {
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

    await saveDb((db) => {
      const idx = db.generatedPosts.findIndex((p) => p.id === post.id);
      db.generatedPosts[idx] = {
        ...db.generatedPosts[idx],
        status: "scheduled",
        scheduledAt: "invalid-date"
      };
    });

    const res = await publishScheduledPosts();
    expect(res.due).toBe(0);
    expect(res.invalidScheduledAtCount).toBe(1);
  });

  it("rejects scheduling already posted items", async () => {
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

    await publishPostNow(post.id);

    await expect(schedulePost(post.id, new Date(Date.now() + 3600_000).toISOString())).rejects.toThrow(
      "Cannot schedule an already posted item"
    );
  });
});
