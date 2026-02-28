import { describe, expect, it } from "vitest";
import { generatePostContent } from "@/lib/ai/client";

describe("content template optimizer", () => {
  it("selects DM-oriented CTA keyword for internet category", async () => {
    const out = await generatePostContent({
      category: "internet",
      targetPersona: "一人暮らし",
      angles: ["料金", "速度"],
      format: "carousel",
      objective: "dm"
    });

    expect(out.ctaKeyword).toBe("比較");
    expect(out.captionText).toContain("DMで");
    expect(out.hashtags.length).toBeGreaterThan(0);
    expect(new Set(out.hashtags).size).toBe(out.hashtags.length);
  });

  it("selects click-oriented CTA keyword when objective is click", async () => {
    const out = await generatePostContent({
      category: "server",
      targetPersona: null,
      angles: ["安定性"],
      format: "carousel",
      objective: "click"
    });

    expect(out.ctaKeyword).toBe("導入");
    expect(out.captionText).toContain("プロフィールリンク");
  });
});

