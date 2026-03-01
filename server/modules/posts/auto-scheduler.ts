import { getDb } from "@/lib/store/repository";
import { generateContentDraft, renderCarouselSvg, saveGeneratedPostDraft } from "@/server/modules/content/service";
import { schedulePost } from "@/server/modules/posts/service";
import { logger } from "@/server/services/logger";
import { Offer } from "@/types/models";

type Objective = "dm" | "click";

type AutoScheduleSummary = {
  created: number;
  skipped: number;
  reason?: string;
  scheduledAt?: string;
  offerId?: string;
  postId?: string;
  slotLabel?: string;
};

function parseSlotLabels(raw?: string) {
  const source = raw?.trim() || "09:00,21:00";
  const parsed = source
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((slot) => {
      const m = slot.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
      if (!m) return null;
      const hour = Number(m[1]);
      const minute = Number(m[2]);
      return { hour, minute, label: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}` };
    })
    .filter((v): v is { hour: number; minute: number; label: string } => Boolean(v))
    .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
  return parsed.length ? parsed : [{ hour: 9, minute: 0, label: "09:00" }];
}

function toJstParts(date: Date) {
  const jstMs = date.getTime() + 9 * 60 * 60 * 1000;
  const jst = new Date(jstMs);
  return {
    year: jst.getUTCFullYear(),
    month: jst.getUTCMonth(),
    day: jst.getUTCDate(),
    hour: jst.getUTCHours(),
    minute: jst.getUTCMinutes()
  };
}

function fromJstParts(year: number, month: number, day: number, hour: number, minute: number) {
  const utcMs = Date.UTC(year, month, day, hour - 9, minute, 0, 0);
  return new Date(utcMs);
}

function getNextSlotDate(now = new Date(), slotEnv = process.env.AUTO_POST_SLOTS_JST) {
  const forced = process.env.AUTO_POST_FORCE_SCHEDULED_AT?.trim();
  if (forced) {
    const forcedDate = new Date(forced);
    if (!Number.isNaN(forcedDate.getTime())) {
      return { date: forcedDate, slotLabel: "forced" };
    }
  }

  const slots = parseSlotLabels(slotEnv);
  const p = toJstParts(now);

  for (const slot of slots) {
    if (slot.hour > p.hour || (slot.hour === p.hour && slot.minute > p.minute)) {
      return { date: fromJstParts(p.year, p.month, p.day, slot.hour, slot.minute), slotLabel: slot.label };
    }
  }
  const tomorrow = fromJstParts(p.year, p.month, p.day + 1, slots[0].hour, slots[0].minute);
  return { date: tomorrow, slotLabel: slots[0].label };
}

function findActiveOffer(offers: Offer[]) {
  const active = offers.filter((offer) => offer.status === "active");
  if (!active.length) return null;
  const blog = active.filter((offer) => offer.category === "blog");
  return (blog[0] ?? active[0]) || null;
}

function pickObjective() {
  return (process.env.AUTO_POST_OBJECTIVE === "click" ? "click" : "dm") as Objective;
}

function hasAlreadyScheduledAt(dbScheduledIso: string, slotIso: string) {
  return new Date(dbScheduledIso).getTime() === new Date(slotIso).getTime();
}

export async function autoGenerateAndScheduleNextPost(): Promise<AutoScheduleSummary> {
  const db = await getDb();
  const offer = findActiveOffer(db.offers);
  if (!offer) return { created: 0, skipped: 1, reason: "no_active_offer" };

  const { date: slotDate, slotLabel } = getNextSlotDate();
  const slotIso = slotDate.toISOString();

  const alreadyScheduled = db.generatedPosts.some(
    (post) => post.status === "scheduled" && post.scheduledAt && hasAlreadyScheduledAt(post.scheduledAt, slotIso)
  );
  if (alreadyScheduled) {
    return { created: 0, skipped: 1, reason: "slot_already_reserved", scheduledAt: slotIso, slotLabel };
  }

  const generated = await generateContentDraft({
    category: offer.category,
    targetPersona: offer.targetPersona ?? null,
    angles: offer.angles,
    offerIds: [offer.id],
    format: "carousel",
    objective: pickObjective()
  });

  const mediaAssetPath = await renderCarouselSvg(generated.carouselPages);
  const draft = await saveGeneratedPostDraft({
    offerIds: [offer.id],
    category: offer.category,
    format: "carousel",
    hookText: generated.hookCandidates[0],
    scriptText: generated.scriptText,
    captionText: generated.captionText,
    hashtags: generated.hashtags,
    ctaKeyword: generated.ctaKeyword,
    prNotationText: generated.prNotationText ?? null,
    mediaAssetPath
  });
  const scheduled = await schedulePost(draft.id, slotIso);
  logger.info("autoGenerateAndScheduleNextPost success", { postId: scheduled.id, offerId: offer.id, slotIso, slotLabel });

  return {
    created: 1,
    skipped: 0,
    scheduledAt: slotIso,
    offerId: offer.id,
    postId: scheduled.id,
    slotLabel
  };
}
