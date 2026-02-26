import { withApiErrorHandling, jsonOk, parseJson } from "@/lib/api/next";
import { contentGenerateInputSchema } from "@/lib/validation/content";
import { generateContentDraft, saveGeneratedPostDraft } from "@/server/modules/content/service";

export const POST = withApiErrorHandling(async (request: Request) => {
  const body = await parseJson(request, contentGenerateInputSchema);
  const generated = await generateContentDraft({
    category: body.category,
    targetPersona: body.targetPersona ?? null,
    angles: body.angles ?? [],
    offerIds: body.offerIds,
    format: body.format,
    objective: body.objective
  });
  const draft = await saveGeneratedPostDraft({
    offerIds: body.offerIds,
    category: body.category,
    format: body.format,
    hookText: generated.hookCandidates[0],
    scriptText: generated.scriptText,
    captionText: generated.captionText,
    hashtags: generated.hashtags,
    ctaKeyword: generated.ctaKeyword,
    prNotationText: generated.prNotationText ?? null
  });
  return jsonOk({ ...generated, generatedPostId: draft.id });
});
