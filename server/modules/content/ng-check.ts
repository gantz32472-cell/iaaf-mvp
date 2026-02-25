import { getDb } from "@/lib/store/repository";
import { DUPLICATE_SIMILARITY_THRESHOLD } from "@/lib/constants";
import { jaccardSimilarity } from "@/lib/utils/text";

const bannedClaims = ["絶対", "必ず", "100%", "最強", "No.1", "no.1", "No1"];

export async function runNgCheck(input: {
  text: string;
  prNotationText?: string | null;
  offerIds?: string[];
  hookText?: string;
  captionText?: string;
}) {
  const reasons: string[] = [];
  const suggestedFixes: string[] = [];
  let level: "pass" | "warn" | "fail" = "pass";

  for (const claim of bannedClaims) {
    if (input.text.includes(claim)) {
      level = "fail";
      reasons.push(`過度な断定表現を検出: ${claim}`);
      suggestedFixes.push(`「${claim}」を避け、条件付き表現に変更`);
    }
  }

  const db = await getDb();
  const requiresPr = input.offerIds?.some((offerId) => db.offers.find((o) => o.id === offerId)?.prLabelRequired) ?? false;
  if (requiresPr && !input.prNotationText?.trim()) {
    level = level === "fail" ? "fail" : "warn";
    reasons.push("PR表記が必要な案件を含むが PR表記が未入力");
    suggestedFixes.push("prNotationText に `PR` などの表記を設定");
  }

  const compareText = `${input.hookText ?? ""} ${input.captionText ?? ""}`.trim();
  if (compareText) {
    const recent = db.generatedPosts.slice(-10);
    for (const post of recent) {
      const score = Math.max(
        jaccardSimilarity(compareText, `${post.hookText} ${post.captionText}`),
        jaccardSimilarity(input.text, post.captionText)
      );
      if (score >= DUPLICATE_SIMILARITY_THRESHOLD) {
        level = level === "fail" ? "fail" : "warn";
        reasons.push(`直近投稿との類似度が高い (${score.toFixed(2)})`);
        suggestedFixes.push("フック文・比較軸・CTAの表現を変更");
        break;
      }
    }
  }

  return { level, reasons, suggestedFixes };
}
