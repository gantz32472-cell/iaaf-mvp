import { withApiErrorHandling, jsonOk, parseJson } from "@/lib/api/next";
import { renderCarouselInputSchema } from "@/lib/validation/content";
import { renderCarouselSvg } from "@/server/modules/content/service";

export const POST = withApiErrorHandling(async (request: Request) => {
  const body = await parseJson(request, renderCarouselInputSchema);
  const mediaAssetPath = await renderCarouselSvg(body.pages);
  return jsonOk({ mediaAssetPath });
});
