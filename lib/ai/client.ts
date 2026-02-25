import { z } from "zod";
import { generatedContentSchema } from "@/lib/validation/content";
import { ENABLE_MOCK_MODE } from "@/lib/constants";

const complianceResultSchema = z.object({
  level: z.enum(["pass", "warn", "fail"]),
  reasons: z.array(z.string()),
  suggestedFixes: z.array(z.string())
});

export async function generatePostContent(input: {
  category: string;
  targetPersona?: string | null;
  angles: string[];
  format: "carousel" | "reel";
  objective: "dm" | "click";
}) {
  if (!process.env.OPENAI_API_KEY || ENABLE_MOCK_MODE) {
    const mocked = {
      hookCandidates: [
        `失敗しない${input.category}比較 3分でわかる`,
        `${input.targetPersona ?? "初心者"}向け ${input.category}選び方`,
        `${input.category}で損しないための比較ポイント`
      ],
      carouselPages: [
        { title: "結論", body: `${input.category}は用途で選ぶのが最短です` },
        { title: "比較軸", body: (input.angles[0] ?? "料金・速度・サポート") + " を確認" },
        { title: "CTA", body: `DMで「比較」と送ると一覧リンクを返します` }
      ],
      scriptText: `${input.category}比較の台本です。導入→比較軸→おすすめパターン→CTA`,
      captionText: `${input.category}を比較する時は、料金だけでなく条件差も確認。DMで「比較」と送ってください。`,
      hashtags: ["#比較", "#インスタ運用", "#アフィリエイト"],
      ctaKeyword: "比較",
      prNotationText: "PR"
    };
    return generatedContentSchema.parse(mocked);
  }
  // TODO(v1): implement actual OpenAI call
  throw new Error("OpenAI integration not implemented in this MVP build");
}

export async function checkComplianceText(input: { text: string }) {
  if (!process.env.OPENAI_API_KEY || ENABLE_MOCK_MODE) {
    return complianceResultSchema.parse({
      level: "pass",
      reasons: [],
      suggestedFixes: []
    });
  }
  throw new Error("OpenAI compliance integration not implemented in this MVP build");
}

export async function generateDmReplies(input: { keyword: string; targetUrl: string }) {
  if (!process.env.OPENAI_API_KEY || ENABLE_MOCK_MODE) {
    return {
      reply1: `${input.keyword}の比較リンクです。${input.targetUrl}`,
      reply2: "不明点があれば、用途（自宅/一人暮らし/仕事用）を送ってください。"
    };
  }
  throw new Error("OpenAI DM reply integration not implemented in this MVP build");
}
