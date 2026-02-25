import { describe, expect, it } from "vitest";
import { matchDmRule } from "@/server/modules/dm-rules/matcher";
import { DmRule } from "@/types/models";

const baseRule: DmRule = {
  id: "11111111-1111-1111-1111-111111111111",
  keyword: "wifi",
  matchType: "partial",
  reply1: "reply",
  reply2: null,
  delayMinutesForReply2: null,
  targetUrl: "https://example.com",
  cooldownHours: 24,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe("dm rule matcher", () => {
  it("matches partial keyword", () => {
    const matched = matchDmRule("wifi 比較したい", [baseRule]);
    expect(matched?.keyword).toBe("wifi");
  });

  it("respects exact match", () => {
    const exact = { ...baseRule, keyword: "回線", matchType: "exact" as const };
    expect(matchDmRule("回線", [exact])?.id).toBe(exact.id);
    expect(matchDmRule("回線比較", [exact])).toBeNull();
  });
});
