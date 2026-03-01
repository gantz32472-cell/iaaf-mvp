import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { resetMockDb } from "@/tests/helpers";
import { createOffer } from "@/server/modules/offers/service";
import { autoGenerateAndScheduleNextPost } from "@/server/modules/posts/auto-scheduler";
import { getDb } from "@/lib/store/repository";

describe("autoGenerateAndScheduleNextPost", () => {
  const originalForced = process.env.AUTO_POST_FORCE_SCHEDULED_AT;

  beforeEach(async () => {
    await resetMockDb();
    process.env.AUTO_POST_FORCE_SCHEDULED_AT = "2026-03-01T10:00:00.000Z";
  });

  afterEach(() => {
    process.env.AUTO_POST_FORCE_SCHEDULED_AT = originalForced;
  });

  it("creates and schedules one post for active offer", async () => {
    const offer = await createOffer({
      name: "ブログ自動案件",
      category: "blog",
      aspName: "A8",
      destinationUrl: "https://example.com/blog",
      referenceUrl: null,
      targetPersona: "副業ブロガー",
      angles: ["SEO", "記事構成"],
      prLabelRequired: true,
      ngWords: [],
      status: "active"
    });

    const result = await autoGenerateAndScheduleNextPost();
    expect(result.created).toBe(1);
    expect(result.offerId).toBe(offer.id);
    expect(result.scheduledAt).toBe("2026-03-01T10:00:00.000Z");

    const db = await getDb();
    expect(db.generatedPosts).toHaveLength(1);
    expect(db.generatedPosts[0].status).toBe("scheduled");
    expect(db.generatedPosts[0].mediaAssetPath).toContain("/generated/carousels/");
  });

  it("skips when slot already has a scheduled post", async () => {
    await createOffer({
      name: "ブログ自動案件",
      category: "blog",
      aspName: "A8",
      destinationUrl: "https://example.com/blog",
      angles: ["SEO"],
      prLabelRequired: true,
      ngWords: [],
      status: "active"
    });

    const first = await autoGenerateAndScheduleNextPost();
    const second = await autoGenerateAndScheduleNextPost();

    expect(first.created).toBe(1);
    expect(second.created).toBe(0);
    expect(second.reason).toBe("slot_already_reserved");
  });
});

