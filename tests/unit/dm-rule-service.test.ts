import { beforeEach, describe, expect, it } from "vitest";
import { resetMockDb } from "@/tests/helpers";
import { createDmRule, processIncomingDm } from "@/server/modules/dm-rules/service";

describe("dm rule service", () => {
  beforeEach(async () => {
    await resetMockDb();
  });

  it("appends targetUrl to reply text", async () => {
    await createDmRule({
      keyword: "compare",
      matchType: "partial",
      reply1: "Here is the comparison link.",
      targetUrl: "https://example.com/compare",
      cooldownHours: 24,
      isActive: true
    });

    const out = await processIncomingDm({
      instagramUserId: "user_1",
      messageText: "please compare"
    });

    expect(out.reply).not.toBeNull();
    expect(out.reply?.reply1).toContain("Here is the comparison link.");
    expect(out.reply?.reply1).toContain("https://example.com/compare");
  });

  it("suppresses reply within cooldown window for same user and same rule", async () => {
    await createDmRule({
      keyword: "price",
      matchType: "partial",
      reply1: "Check pricing here.",
      targetUrl: "https://example.com/price",
      cooldownHours: 24,
      isActive: true
    });

    const first = await processIncomingDm({
      instagramUserId: "user_2",
      messageText: "price please"
    });
    expect(first.reply).not.toBeNull();
    expect(first.cooldownSuppressed).toBe(false);

    const second = await processIncomingDm({
      instagramUserId: "user_2",
      messageText: "price now"
    });
    expect(second.reply).toBeNull();
    expect(second.cooldownSuppressed).toBe(true);
  });
});

