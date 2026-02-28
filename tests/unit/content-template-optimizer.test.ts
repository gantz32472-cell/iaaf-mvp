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

  it("applies blog-specific copy and CTA keyword", async () => {
    const out = await generatePostContent({
      category: "blog",
      targetPersona: "副業ブロガー",
      angles: ["記事構成", "SEO"],
      format: "carousel",
      objective: "dm"
    });

    expect(out.ctaKeyword).toBe("添削");
    expect(out.captionText).toContain("ブログ運営");
    expect(out.captionText).toContain("改善ポイント");
    expect(out.hookCandidates[0]).toContain("記事");
    expect(out.hashtags).toContain("#ブログ運営");
  });

  it("switches to SEO-oriented blog template when angles include SEO terms", async () => {
    const out = await generatePostContent({
      category: "blog",
      targetPersona: "個人ブロガー",
      angles: ["検索意図", "SEO"],
      format: "carousel",
      objective: "dm"
    });

    expect(out.captionText).toContain("検索意図");
    expect(out.scriptText).toContain("SEO軸");
    expect(out.carouselPages[0].body).toContain("検索意図");
  });

  it("switches to monetization-oriented template when angles include revenue terms", async () => {
    const out = await generatePostContent({
      category: "blog",
      targetPersona: "収益化したい人",
      angles: ["収益導線", "CTA設計"],
      format: "carousel",
      objective: "click"
    });

    expect(out.ctaKeyword).toBe("テンプレ");
    expect(out.scriptText).toContain("収益導線軸");
    expect(out.carouselPages[0].body).toContain("再現性");
  });
});
