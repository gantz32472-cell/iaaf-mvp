import { withApiErrorHandling, jsonOk, parseJson } from "@/lib/api/next";
import { dmRulePatchSchema } from "@/lib/validation/dm-rules";
import { patchDmRule } from "@/server/modules/dm-rules/service";

export const PATCH = withApiErrorHandling(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const body = await parseJson(request, dmRulePatchSchema);
  return jsonOk(await patchDmRule(id, body));
});
