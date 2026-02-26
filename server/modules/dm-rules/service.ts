import { z } from "zod";
import { getDb, saveDb } from "@/lib/store/repository";
import { DmConversation, DmRule } from "@/types/models";
import { createId, hashText } from "@/lib/utils/id";
import { nowIso } from "@/lib/utils/date";
import { dmRuleInputSchema, dmRulePatchSchema } from "@/lib/validation/dm-rules";
import { matchDmRule } from "@/server/modules/dm-rules/matcher";
import { sendInstagramTextMessage } from "@/lib/meta/messaging";
import { ENABLE_REAL_INSTAGRAM_DM } from "@/lib/constants";

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
  const matchedRule = matchDmRule(input.messageText, db.dmRules);
  const conversation: DmConversation = {
    id: createId(),
    instagramUserIdHash: hashText(input.instagramUserId),
    messageText: input.messageText,
    matchedKeyword: matchedRule?.keyword ?? null,
    ruleId: matchedRule?.id ?? null,
    replied: Boolean(matchedRule),
    generatedPostId: input.generatedPostId ?? null,
    createdAt: nowIso()
  };
  await saveDb((state) => {
    state.dmConversations.push(conversation);
  });
  let delivery: { mode: "mock" | "real"; id?: string } | null = null;
  if (matchedRule) {
    if (ENABLE_REAL_INSTAGRAM_DM) {
      const sent = await sendInstagramTextMessage({ recipientId: input.instagramUserId, text: matchedRule.reply1 });
      delivery = { mode: "real", id: String((sent as { message_id?: string; id?: string }).message_id ?? sent.id ?? "") };
    } else {
      delivery = { mode: "mock" };
    }
  }

  return {
    conversation,
    reply: matchedRule
      ? {
          type: delivery?.mode ?? "mock",
          reply1: matchedRule.reply1,
          reply2: matchedRule.reply2 ?? null,
          deliveryId: delivery?.id ?? null
        }
      : null
  };
}
