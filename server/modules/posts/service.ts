import { getDb, saveDb } from "@/lib/store/repository";
import { nowIso } from "@/lib/utils/date";
import { instagramPublisher } from "@/server/modules/posts/publisher";

export async function listPosts() {
  return (await getDb()).generatedPosts;
}

export async function schedulePost(generatedPostId: string, scheduledAt: string) {
  let updated;
  await saveDb((db) => {
    const idx = db.generatedPosts.findIndex((p) => p.id === generatedPostId);
    if (idx < 0) throw new Error("Post not found");
    updated = { ...db.generatedPosts[idx], status: "scheduled" as const, scheduledAt, updatedAt: nowIso() };
    db.generatedPosts[idx] = updated!;
  });
  return updated!;
}

export async function publishPostNow(postId: string) {
  const db = await getDb();
  const post = db.generatedPosts.find((p) => p.id === postId);
  if (!post) throw new Error("Post not found");
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
  const targets = db.generatedPosts.filter(
    (p) => p.status === "scheduled" && p.scheduledAt && new Date(p.scheduledAt).getTime() <= now
  );

  const results: Array<{ postId: string; ok: boolean; mediaId?: string; error?: string }> = [];
  for (const post of targets) {
    try {
      const updated = await publishPostNow(post.id);
      results.push({ postId: post.id, ok: true, mediaId: updated.instagramMediaId ?? undefined });
    } catch (error) {
      results.push({ postId: post.id, ok: false, error: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  return {
    scanned: db.generatedPosts.length,
    due: targets.length,
    published: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results
  };
}
