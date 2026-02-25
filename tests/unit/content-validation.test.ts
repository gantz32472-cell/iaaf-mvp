import { describe, expect, it } from "vitest";
import { generatePostContent } from "@/lib/ai/client";
import { generatedContentSchema } from "@/lib/validation/content";

describe("content generate mock validation", () => {
  it("returns schema-valid response", async () => {
    const res = await generatePostContent({
      category: "internet",
      targetPersona: "初心者",
      angles: ["料金", "速度"],
      format: "carousel",
      objective: "dm"
    });
    const parsed = generatedContentSchema.safeParse(res);
    expect(parsed.success).toBe(true);
    expect(res.hookCandidates).toHaveLength(3);
  });
});
