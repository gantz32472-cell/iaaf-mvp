import { withApiErrorHandling, jsonOk, parseJson } from "@/lib/api/next";
import { dmRuleInputSchema } from "@/lib/validation/dm-rules";
import { createDmRule, listDmRules } from "@/server/modules/dm-rules/service";

export const GET = withApiErrorHandling(async () => jsonOk(await listDmRules()));

export const POST = withApiErrorHandling(async (request: Request) => {
  const body = await parseJson(request, dmRuleInputSchema);
  return jsonOk(await createDmRule(body), { status: 201 });
});
