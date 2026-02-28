import { z } from "zod";
import { generatedContentSchema } from "@/lib/validation/content";
import { ENABLE_MOCK_MODE } from "@/lib/constants";

const complianceResultSchema = z.object({
  level: z.enum(["pass", "warn", "fail"]),
  reasons: z.array(z.string()),
  suggestedFixes: z.array(z.string())
});

type GenerateInput = {
  category: string;
  targetPersona?: string | null;
  angles: string[];
  format: "carousel" | "reel";
  objective: "dm" | "click";
};

function normalizeTagWord(text: string) {
  return text.replace(/\s+/g, "").replace(/[!-/:-@[-`{-~]/g, "");
}

function toHashtag(text: string) {
  const cleaned = normalizeTagWord(text);
  return cleaned ? `#${cleaned}` : null;
}

function pickCtaKeyword(input: GenerateInput) {
  if (input.objective === "dm") {
    if (input.category === "internet") return "比較";
    if (input.category === "server") return "診断";
    if (input.category === "blog") return "相談";
    return "相談";
  }

  if (input.category === "internet") return "詳細";
  if (input.category === "server") return "導入";
  if (input.category === "blog") return "記事";
  return "確認";
}

function buildHashtags(input: GenerateInput) {
  const base = ["インスタ運用", "アフィリエイト", "PR"];
  const categoryTags: Record<string, string[]> = {
    internet: ["回線比較", "WiFi", "固定費見直し"],
    server: ["サーバー", "クラウド", "運用改善"],
    blog: ["ブログ運営", "SEO", "記事作成"],
    other: ["比較検討", "サービス選び"]
  };

  const objectiveTags = input.objective === "dm" ? ["DM相談", "無料相談"] : ["詳細はこちら", "今すぐチェック"];
  const fromAngles = input.angles.slice(0, 3);
  const raw = [...base, ...(categoryTags[input.category] ?? categoryTags.other), ...objectiveTags, ...fromAngles];

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const tag = toHashtag(item);
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(tag);
  }
  return unique.slice(0, 8);
}

function buildCaption(input: GenerateInput, ctaKeyword: string) {
  const persona = input.targetPersona?.trim() ? input.targetPersona.trim() : "迷っている方";
  const angleLine = input.angles.length > 0 ? `特に「${input.angles.slice(0, 2).join(" / ")}」を重視して整理しました。` : "";
  const ctaLine =
    input.objective === "dm"
      ? `DMで「${ctaKeyword}」と送ってください。条件別の比較リンクを返します。`
      : `プロフィールリンクから「${ctaKeyword}」をチェックしてください。`;
  return `${persona}向けに${input.category}の選び方を短くまとめました。${angleLine}${ctaLine}`;
}

function buildMockGeneratedContent(input: GenerateInput) {
  const ctaKeyword = pickCtaKeyword(input);
  const hashtags = buildHashtags(input);

  const hookCandidates = [
    `${input.category}選びで失敗しない3つの基準`,
    `${input.targetPersona ?? "初心者向け"}でも迷わない${input.category}比較`,
    `${input.category}のコスパを最短で見抜くポイント`
  ];

  return generatedContentSchema.parse({
    hookCandidates,
    carouselPages: [
      { title: "結論", body: `${input.category}は条件の見える化で選ぶと失敗しにくい` },
      { title: "比較軸", body: (input.angles[0] ?? "料金・速度・サポート") + " を最優先で確認" },
      { title: "CTA", body: input.objective === "dm" ? `DMで「${ctaKeyword}」と送信` : "プロフィールリンクから詳細確認" }
    ],
    scriptText: `${input.category}比較の台本: 結論 -> 比較軸 -> 失敗例 -> CTA`,
    captionText: buildCaption(input, ctaKeyword),
    hashtags,
    ctaKeyword,
    prNotationText: "PR"
  });
}

export async function generatePostContent(input: GenerateInput) {
  if (!process.env.OPENAI_API_KEY || ENABLE_MOCK_MODE) {
    return buildMockGeneratedContent(input);
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
      reply2: "用途（在宅/動画/ゲーム）を返信いただければ、優先ポイントを案内します。"
    };
  }
  throw new Error("OpenAI DM reply integration not implemented in this MVP build");
}
