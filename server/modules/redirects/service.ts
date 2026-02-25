import { getDb, saveDb } from "@/lib/store/repository";
import { createId, createShortCode, hashText } from "@/lib/utils/id";
import { nowIso } from "@/lib/utils/date";
import { ShortLink, ClickEvent } from "@/types/models";

export async function createShortLink(input: Omit<ShortLink, "shortCode" | "createdAt"> & { shortCode?: string }) {
  const shortCode = input.shortCode ?? createShortCode();
  const link: ShortLink = {
    ...input,
    shortCode,
    createdAt: nowIso()
  };
  await saveDb((db) => {
    db.shortLinks = db.shortLinks.filter((l) => l.shortCode !== shortCode);
    db.shortLinks.push(link);
  });
  return link;
}

export async function resolveRedirectAndTrack(input: {
  shortCode: string;
  userAgent?: string | null;
  ip?: string | null;
}) {
  const db = await getDb();
  const link = db.shortLinks.find((l) => l.shortCode === input.shortCode);
  if (!link) return null;

  const url = new URL(link.targetUrl);
  if (link.utmSource) url.searchParams.set("utm_source", link.utmSource);
  if (link.utmMedium) url.searchParams.set("utm_medium", link.utmMedium);
  if (link.utmCampaign) url.searchParams.set("utm_campaign", link.utmCampaign);

  const clickEvent: ClickEvent = {
    id: createId(),
    shortCode: link.shortCode,
    generatedPostId: link.generatedPostId ?? null,
    offerId: link.offerId ?? null,
    keyword: link.keyword ?? null,
    utmSource: link.utmSource ?? null,
    utmCampaign: link.utmCampaign ?? null,
    userAgent: input.userAgent ?? null,
    ipHash: input.ip ? hashText(input.ip) : null,
    clickedAt: nowIso()
  };
  await saveDb((state) => state.clickEvents.push(clickEvent));
  return { targetUrl: url.toString(), clickEvent };
}
