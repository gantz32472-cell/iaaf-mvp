import { DmRule } from "@/types/models";
import { normalizeText } from "@/lib/utils/text";

export function matchDmRule(messageText: string, rules: DmRule[]): DmRule | null {
  const message = normalizeText(messageText);
  return (
    rules
      .filter((r) => r.isActive)
      .find((rule) => {
        const keyword = normalizeText(rule.keyword);
        if (rule.matchType === "exact") return message === keyword;
        return message.includes(keyword);
      }) ?? null
  );
}
