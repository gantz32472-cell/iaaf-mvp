import { getDb, saveDb } from "@/lib/store/repository";
import { parseCsv } from "@/server/services/csv";
import { createId } from "@/lib/utils/id";
import { nowIso, todayDateString } from "@/lib/utils/date";
import { ConversionReport } from "@/types/models";

type RangeInput = { from?: string; to?: string; period?: "day" | "week" | "month" };

function getRange(range?: RangeInput) {
  const now = new Date();
  if (!range?.from && !range?.to && !range?.period) return null;
  let from = range.from ? new Date(range.from) : new Date(now);
  let to = range.to ? new Date(range.to) : new Date(now);
  if (range.period) {
    to = new Date(now);
    from = new Date(now);
    if (range.period === "day") from.setDate(now.getDate() - 1);
    if (range.period === "week") from.setDate(now.getDate() - 7);
    if (range.period === "month") from.setDate(now.getDate() - 30);
  }
  return { from: from.getTime(), to: to.getTime() + 24 * 60 * 60 * 1000 };
}

function inRange(iso: string, range?: ReturnType<typeof getRange>) {
  if (!range) return true;
  const t = new Date(iso).getTime();
  return t >= range.from && t <= range.to;
}

export async function getAnalyticsSummary(rangeInput?: RangeInput) {
  const db = await getDb();
  const range = getRange(rangeInput);
  const today = todayDateString();
  const todayPosts = db.generatedPosts.filter((p) => (range ? inRange(p.createdAt, range) : p.createdAt.startsWith(today))).length;
  const todayDms = db.dmConversations.filter((d) => (range ? inRange(d.createdAt, range) : d.createdAt.startsWith(today))).length;
  const todayClicks = db.clickEvents.filter((c) => (range ? inRange(c.clickedAt, range) : c.clickedAt.startsWith(today))).length;
  const estimatedCv = db.conversionReports
    .filter((c) => (range ? inRange(`${c.date}T00:00:00.000Z`, range) : c.date === today))
    .reduce((sum, row) => sum + row.cvCount, 0);
  const errorCount = db.generatedPosts.filter((p) => p.status === "failed").length;
  const ranking = db.generatedPosts
    .filter((p) => inRange(p.createdAt, range))
    .map((p) => ({
      postId: p.id,
      hookText: p.hookText,
      clicks: db.clickEvents.filter((c) => c.generatedPostId === p.id).length,
      dms: db.dmConversations.filter((d) => d.generatedPostId === p.id).length
    }))
    .sort((a, b) => b.clicks + b.dms - (a.clicks + a.dms))
    .slice(0, 5);
  return { todayPosts, todayDms, todayClicks, estimatedCv, errorCount, ranking };
}

export async function getAnalyticsByPosts(rangeInput?: RangeInput) {
  const db = await getDb();
  const range = getRange(rangeInput);
  return db.generatedPosts.map((p) => ({
    postId: p.id,
    hookText: p.hookText,
    status: p.status,
    clicks: db.clickEvents.filter((c) => c.generatedPostId === p.id && inRange(c.clickedAt, range)).length,
    dms: db.dmConversations.filter((d) => d.generatedPostId === p.id && inRange(d.createdAt, range)).length
  }));
}

export async function getAnalyticsByKeywords(rangeInput?: RangeInput) {
  const db = await getDb();
  const range = getRange(rangeInput);
  const counter = new Map<string, { keyword: string; clicks: number; dms: number }>();
  for (const dm of db.dmConversations) {
    if (!inRange(dm.createdAt, range)) continue;
    if (!dm.matchedKeyword) continue;
    const row = counter.get(dm.matchedKeyword) ?? { keyword: dm.matchedKeyword, clicks: 0, dms: 0 };
    row.dms += 1;
    counter.set(dm.matchedKeyword, row);
  }
  for (const click of db.clickEvents) {
    if (!inRange(click.clickedAt, range)) continue;
    if (!click.keyword) continue;
    const row = counter.get(click.keyword) ?? { keyword: click.keyword, clicks: 0, dms: 0 };
    row.clicks += 1;
    counter.set(click.keyword, row);
  }
  return [...counter.values()].sort((a, b) => b.clicks + b.dms - (a.clicks + a.dms));
}

export async function importConversionReportsCsv(csvText: string) {
  const rows = parseCsv(csvText);
  const errors: Array<{ row: number; message: string }> = [];
  const created: ConversionReport[] = [];
  const db = await getDb();
  for (const [index, row] of rows.entries()) {
    try {
      if (!db.offers.some((o) => o.id === row.offerId)) throw new Error("offerId not found");
      const now = nowIso();
      const item: ConversionReport = {
        id: createId(),
        date: row.date,
        offerId: row.offerId,
        cvCount: Number(row.cvCount),
        approvedCount: Number(row.approvedCount),
        revenueAmount: Number(row.revenueAmount),
        source: row.source === "csv" ? "csv" : "manual",
        createdAt: now,
        updatedAt: now
      };
      if ([item.cvCount, item.approvedCount, item.revenueAmount].some(Number.isNaN)) {
        throw new Error("numeric columns are invalid");
      }
      created.push(item);
    } catch (error) {
      errors.push({ row: index + 2, message: error instanceof Error ? error.message : "Invalid row" });
    }
  }
  if (created.length) {
    await saveDb((state) => state.conversionReports.push(...created));
  }
  return { importedCount: created.length, errors, items: created };
}
