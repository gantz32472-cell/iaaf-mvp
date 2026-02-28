import { z } from "zod";
import { getDb, saveDb } from "@/lib/store/repository";
import { DmConversation, DmRule } from "@/types/models";
import { createId, hashText } from "@/lib/utils/id";
import { nowIso } from "@/lib/utils/date";
import { dmRuleInputSchema, dmRulePatchSchema } from "@/lib/validation/dm-rules";
import { matchDmRule } from "@/server/modules/dm-rules/matcher";
import { sendInstagramTextMessage } from "@/lib/meta/messaging";
import { ENABLE_REAL_INSTAGRAM_DM } from "@/lib/constants";

function buildReplyText(input: { reply1: string; targetUrl: string }) {
  const base = input.reply1.trim();
  if (!base) return input.targetUrl;
  if (base.includes(input.targetUrl)) return base;
  return `${base}\n${input.targetUrl}`;
}

function isWithinCooldown(lastSentAtIso: string, cooldownHours: number, now = Date.now()) {
  const last = new Date(lastSentAtIso).getTime();
  if (Number.isNaN(last)) return false;
  return now - last < cooldownHours * 60 * 60 * 1000;
}

export function getDmReplyTemplates() {
  return [
    {
      id: "compare-basic",
      label: "比較リンク即返し",
      keyword: "比較",
      matchType: "partial" as const,
      reply1: "比較ありがとうございます。まずはこの一覧を見れば最短で判断できます。",
      reply2: "迷ったら利用目的（在宅/動画/ゲーム）を返信してください。最適な選び方を返します。",
      delayMinutesForReply2: 10,
      targetUrl: "https://example.com/compare",
      cooldownHours: 24,
      isActive: true
    },
    {
      id: "price-first",
      label: "料金重視向け",
      keyword: "料金",
      matchType: "partial" as const,
      reply1: "料金優先なら、まず実質月額の比較表を見てください。",
      reply2: "初期費用まで含めた条件比較が必要なら「詳細」と返信してください。",
      delayMinutesForReply2: 15,
      targetUrl: "https://example.com/price",
      cooldownHours: 24,
      isActive: true
    },
    {
      id: "switch-support",
      label: "乗り換え相談",
      keyword: "乗り換え",
      matchType: "partial" as const,
      reply1: "乗り換え手順はこのページにまとめています。違約金の有無だけ先に確認してください。",
      reply2: "契約中サービス名を送ってもらえれば、次に見るべきポイントを返します。",
      delayMinutesForReply2: 30,
      targetUrl: "https://example.com/switch",
      cooldownHours: 48,
      isActive: true
    }
  ];
}

export async function listDmRules() {
  return (await getDb()).dmRules;
}

export async function createDmRule(input: z.input<typeof dmRuleInputSchema>): Promise<DmRule> {
  const parsed = dmRuleInputSchema.parse(input);
  const now = nowIso();
  const item: DmRule = { id: createId(), createdAt: now, updatedAt: now, ...parsed };
  await saveDb((db) => {
    db.dmRules.push(item);
  });
  return item;
}

export async function patchDmRule(id: string, input: z.input<typeof dmRulePatchSchema>) {
  const parsed = dmRulePatchSchema.parse(input);
  let updated: DmRule | undefined;
  await saveDb((db) => {
    const idx = db.dmRules.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error("DM rule not found");
    updated = { ...db.dmRules[idx], ...parsed, updatedAt: nowIso() };
    db.dmRules[idx] = updated!;
  });
  return updated!;
}

export async function testDmRuleMatch(messageText: string) {
  const rules = await listDmRules();
  const matched = matchDmRule(messageText, rules);
  return { matched, messageText };
}

export async function processIncomingDm(input: {
  instagramUserId: string;
  messageText: string;
  generatedPostId?: string | null;
}) {
  const db = await getDb();
  const userHash = hashText(input.instagramUserId);
  const matchedRule = matchDmRule(input.messageText, db.dmRules);
  const lastReply = matchedRule
    ? [...db.dmConversations]
        .reverse()
        .find((row) => row.instagramUserIdHash === userHash && row.ruleId === matchedRule.id && row.replied)
    : null;
  const cooldownActive =
    Boolean(matchedRule && lastReply) && isWithinCooldown(lastReply!.createdAt, matchedRule!.cooldownHours);
  const shouldReply = Boolean(matchedRule) && !cooldownActive;

  const conversation: DmConversation = {
    id: createId(),
    instagramUserIdHash: userHash,
    messageText: input.messageText,
    matchedKeyword: matchedRule?.keyword ?? null,
    ruleId: matchedRule?.id ?? null,
    replied: shouldReply,
    generatedPostId: input.generatedPostId ?? null,
    createdAt: nowIso()
  };
  await saveDb((state) => {
    state.dmConversations.push(conversation);
  });
  let delivery: { mode: "mock" | "real"; id?: string } | null = null;
  const replyText = matchedRule ? buildReplyText({ reply1: matchedRule.reply1, targetUrl: matchedRule.targetUrl }) : null;

  if (matchedRule && shouldReply && replyText) {
    if (ENABLE_REAL_INSTAGRAM_DM) {
      const sent = await sendInstagramTextMessage({ recipientId: input.instagramUserId, text: replyText });
      delivery = { mode: "real", id: String((sent as { message_id?: string; id?: string }).message_id ?? sent.id ?? "") };
    } else {
      delivery = { mode: "mock" };
    }
  }

  return {
    conversation,
    reply: matchedRule && shouldReply
      ? {
          type: delivery?.mode ?? "mock",
          reply1: replyText,
          reply2: matchedRule.reply2 ?? null,
          deliveryId: delivery?.id ?? null
        }
      : null,
    cooldownSuppressed: Boolean(matchedRule && cooldownActive)
  };
}
