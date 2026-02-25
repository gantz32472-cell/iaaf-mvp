import { withApiErrorHandling, jsonOk, parseJson } from "@/lib/api/next";
import { dmRuleTestMatchSchema } from "@/lib/validation/dm-rules";
import { testDmRuleMatch } from "@/server/modules/dm-rules/service";

export const POST = withApiErrorHandling(async (request: Request) => {
  const body = await parseJson(request, dmRuleTestMatchSchema);
  return jsonOk(await testDmRuleMatch(body.messageText));
});
