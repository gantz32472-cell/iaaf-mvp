import { withApiErrorHandling, jsonOk, parseJson } from "@/lib/api/next";
import { offerPatchSchema } from "@/lib/validation/offers";
import { patchOffer } from "@/server/modules/offers/service";

export const PATCH = withApiErrorHandling(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const body = await parseJson(request, offerPatchSchema);
  return jsonOk(await patchOffer(id, body));
});
