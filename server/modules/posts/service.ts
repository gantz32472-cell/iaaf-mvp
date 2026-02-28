import { getDb, saveDb } from "@/lib/store/repository";
import { nowIso } from "@/lib/utils/date";
import { instagramPublisher } from "@/server/modules/posts/publisher";
import { logger } from "@/server/services/logger";

export async function listPosts() {
  return (await getDb()).generatedPosts;
}

export async function schedulePost(generatedPostId: string, scheduledAt: string) {
  const scheduledTime = new Date(scheduledAt).getTime();
  if (Number.isNaN(scheduledTime)) {
    throw new Error("Invalid scheduledAt");
  }

  let updated;
  await saveDb((db) => {
    const idx = db.generatedPosts.findIndex((p) => p.id === generatedPostId);
    if (idx < 0) throw new Error("Post not found");
    if (db.generatedPosts[idx].status === "posted") throw new Error("Cannot schedule an already posted item");
    updated = { ...db.generatedPosts[idx], status: "scheduled" as const, scheduledAt, updatedAt: nowIso() };
    db.generatedPosts[idx] = updated!;
  });
  return updated!;
}

export async function publishPostNow(postId: string) {
  const db = await getDb();
  const post = db.generatedPosts.find((p) => p.id === postId);
  if (!post) throw new Error("Post not found");

  // Make publish-now idempotent for operational safety.
  if (post.status === "posted") {
    logger.info("publishPostNow skipped: already posted", { postId, instagramMediaId: post.instagramMediaId ?? null });
    return post;
  }

  try {
    const result =
      post.format === "reel"
        ? await instagramPublisher.publishReel({ postId, caption: post.captionText })
        : await instagramPublisher.publishCarousel({
            postId,
            mediaAssetPath: post.mediaAssetPath,
            caption: post.captionText
          });
    let updated;
    await saveDb((state) => {
      const idx = state.generatedPosts.findIndex((p) => p.id === postId);
      updated = {
        ...state.generatedPosts[idx],
        status: "posted" as const,
        postedAt: nowIso(),
        instagramMediaId: result.mediaId,
        errorMessage: null,
        updatedAt: nowIso()
      };
      state.generatedPosts[idx] = updated!;
    });
    logger.info("publishPostNow success", { postId, mediaId: result.mediaId, format: post.format });
    return updated!;
  } catch (error) {
    const message = error instanceof Error ? error.message : "publish failed";
    let failed;
    await saveDb((state) => {
      const idx = state.generatedPosts.findIndex((p) => p.id === postId);
      if (idx < 0) return;
      failed = {
        ...state.generatedPosts[idx],
        status: "failed" as const,
        errorMessage: message,
        updatedAt: nowIso()
      };
      state.generatedPosts[idx] = failed!;
    });
    logger.error("publishPostNow failed", { postId, message });
    throw error;
  }
}

export async function retryPost(postId: string) {
  let updated;
  await saveDb((db) => {
    const idx = db.generatedPosts.findIndex((p) => p.id === postId);
    if (idx < 0) throw new Error("Post not found");
    updated = { ...db.generatedPosts[idx], status: "draft" as const, errorMessage: null, updatedAt: nowIso() };
    db.generatedPosts[idx] = updated!;
  });
  return updated!;
}

export async function duplicatePost(postId: string) {
  const db = await getDb();
  const post = db.generatedPosts.find((p) => p.id === postId);
  if (!post) throw new Error("Post not found");
  const { saveGeneratedPostDraft } = await import("@/server/modules/content/service");
  return saveGeneratedPostDraft({
    offerIds: post.offerIds,
    category: post.category,
    format: post.format,
    hookText: `${post.hookText}（複製）`,
    scriptText: post.scriptText,
    captionText: post.captionText,
    hashtags: post.hashtags,
    ctaKeyword: post.ctaKeyword,
    prNotationText: post.prNotationText,
    mediaAssetPath: post.mediaAssetPath
  });
}

export async function publishScheduledPosts() {
  const db = await getDb();
  const now = Date.now();
  let invalidScheduledAtCount = 0;
  const targets = db.generatedPosts.filter(
    (p) => {
      if (p.status !== "scheduled" || !p.scheduledAt) return false;
      const ts = new Date(p.scheduledAt).getTime();
      if (Number.isNaN(ts)) {
        invalidScheduledAtCount += 1;
        return false;
      }
      return ts <= now;
    }
  );
  targets.sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());

  const results: Array<{ postId: string; ok: boolean; mediaId?: string; error?: string }> = [];
  for (const post of targets) {
    try {
      const updated = await publishPostNow(post.id);
      results.push({ postId: post.id, ok: true, mediaId: updated.instagramMediaId ?? undefined });
    } catch (error) {
      results.push({ postId: post.id, ok: false, error: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  const summary = {
    scanned: db.generatedPosts.length,
    due: targets.length,
    published: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    invalidScheduledAtCount,
    results
  };
  logger.info("publishScheduledPosts summary", summary);
  return summary;
}
