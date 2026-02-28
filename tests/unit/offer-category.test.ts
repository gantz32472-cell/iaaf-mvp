import { describe, expect, it } from "vitest";
import { offerInputSchema } from "@/lib/validation/offers";

describe("offer category validation", () => {
  it("accepts blog category", () => {
    const parsed = offerInputSchema.parse({
      name: "ブログ案件",
      category: "blog",
      aspName: "A8",
      destinationUrl: "https://example.com/blog",
      referenceUrl: null,
      targetPersona: "副業ブロガー",
      angles: ["SEO"],
      prLabelRequired: true,
      ngWords: [],
      status: "active"
    });

    expect(parsed.category).toBe("blog");
  });
});

