import { Prisma } from "@prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";
import { MockDatabase } from "@/types/models";

function asStringArray(value: Prisma.JsonValue | null | undefined): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v));
}

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function toDateOnly(value: Date | string): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function assertPrisma() {
  const prisma = getPrismaClient();
  if (!prisma) throw new Error("Prisma client unavailable. Set ENABLE_MOCK_MODE=false and configure DATABASE_URL.");
  return prisma;
}

export async function readPrismaState(): Promise<MockDatabase> {
  const prisma = assertPrisma();
  const [offers, generatedPosts, dmRules, dmConversations, clickEvents, conversionReports, shortLinks] = await Promise.all([
    prisma.offer.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.generatedPost.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.dmRule.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.dmConversation.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.clickEvent.findMany({ orderBy: { clickedAt: "asc" } }),
    prisma.conversionReport.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.shortLink.findMany({ orderBy: { createdAt: "asc" } })
  ]);

  return {
    offers: offers.map((o) => ({
      id: o.id,
      name: o.name,
      category: o.category,
      aspName: o.aspName,
      destinationUrl: o.destinationUrl,
      referenceUrl: o.referenceUrl,
      targetPersona: o.targetPersona,
      angles: asStringArray(o.angles),
      prLabelRequired: o.prLabelRequired,
      ngWords: asStringArray(o.ngWords),
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString()
    })),
    generatedPosts: generatedPosts.map((p) => ({
      id: p.id,
      offerIds: asStringArray(p.offerIds),
      category: p.category,
      format: p.format,
      hookText: p.hookText,
      scriptText: p.scriptText,
      captionText: p.captionText,
      hashtags: asStringArray(p.hashtags),
      ctaKeyword: p.ctaKeyword,
      prNotationText: p.prNotationText,
      mediaAssetPath: p.mediaAssetPath,
      status: p.status,
      scheduledAt: toIso(p.scheduledAt),
      postedAt: toIso(p.postedAt),
      instagramMediaId: p.instagramMediaId,
      errorMessage: p.errorMessage,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
    })),
    dmRules: dmRules.map((r) => ({
      id: r.id,
      keyword: r.keyword,
      matchType: r.matchType,
      reply1: r.reply1,
      reply2: r.reply2,
      delayMinutesForReply2: r.delayMinutesForReply2,
      targetUrl: r.targetUrl,
      cooldownHours: r.cooldownHours,
      isActive: r.isActive,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString()
    })),
    dmConversations: dmConversations.map((d) => ({
      id: d.id,
      instagramUserIdHash: d.instagramUserIdHash,
      messageText: d.messageText,
      matchedKeyword: d.matchedKeyword,
      ruleId: d.ruleId,
      replied: d.replied,
      generatedPostId: d.generatedPostId,
      createdAt: d.createdAt.toISOString()
    })),
    clickEvents: clickEvents.map((c) => ({
      id: c.id,
      shortCode: c.shortCode,
      generatedPostId: c.generatedPostId,
      offerId: c.offerId,
      keyword: c.keyword,
      utmSource: c.utmSource,
      utmCampaign: c.utmCampaign,
      userAgent: c.userAgent,
      ipHash: c.ipHash,
      clickedAt: c.clickedAt.toISOString()
    })),
    conversionReports: conversionReports.map((c) => ({
      id: c.id,
      date: toDateOnly(c.date),
      offerId: c.offerId,
      cvCount: c.cvCount,
      approvedCount: c.approvedCount,
      revenueAmount: c.revenueAmount,
      source: c.source,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString()
    })),
    shortLinks: shortLinks.map((s) => ({
      shortCode: s.shortCode,
      targetUrl: s.targetUrl,
      generatedPostId: s.generatedPostId,
      offerId: s.offerId,
      keyword: s.keyword,
      utmSource: s.utmSource,
      utmMedium: s.utmMedium,
      utmCampaign: s.utmCampaign,
      createdAt: s.createdAt.toISOString()
    }))
  };
}

export async function writePrismaState(db: MockDatabase): Promise<void> {
  const prisma = assertPrisma();
  await prisma.$transaction(async (tx) => {
    await tx.dmConversation.deleteMany();
    await tx.clickEvent.deleteMany();
    await tx.conversionReport.deleteMany();
    await tx.shortLink.deleteMany();
    await tx.generatedPost.deleteMany();
    await tx.dmRule.deleteMany();
    await tx.offer.deleteMany();

    if (db.offers.length) {
      await tx.offer.createMany({
        data: db.offers.map((o) => ({
          ...o,
          angles: o.angles,
          ngWords: o.ngWords,
          createdAt: new Date(o.createdAt),
          updatedAt: new Date(o.updatedAt)
        }))
      });
    }
    if (db.dmRules.length) {
      await tx.dmRule.createMany({
        data: db.dmRules.map((r) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt)
        }))
      });
    }
    if (db.generatedPosts.length) {
      await tx.generatedPost.createMany({
        data: db.generatedPosts.map((p) => ({
          ...p,
          offerIds: p.offerIds,
          hashtags: p.hashtags,
          scheduledAt: p.scheduledAt ? new Date(p.scheduledAt) : null,
          postedAt: p.postedAt ? new Date(p.postedAt) : null,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }))
      });
    }
    if (db.shortLinks.length) {
      await tx.shortLink.createMany({
        data: db.shortLinks.map((s) => ({
          ...s,
          createdAt: new Date(s.createdAt)
        }))
      });
    }
    if (db.dmConversations.length) {
      await tx.dmConversation.createMany({
        data: db.dmConversations.map((d) => ({
          ...d,
          createdAt: new Date(d.createdAt)
        }))
      });
    }
    if (db.clickEvents.length) {
      await tx.clickEvent.createMany({
        data: db.clickEvents.map((c) => ({
          ...c,
          clickedAt: new Date(c.clickedAt)
        }))
      });
    }
    if (db.conversionReports.length) {
      await tx.conversionReport.createMany({
        data: db.conversionReports.map((c) => ({
          ...c,
          date: new Date(`${c.date}T00:00:00.000Z`),
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt)
        }))
      });
    }
  });
}
