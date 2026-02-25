import { withApiErrorHandling, jsonOk, parseJson } from "@/lib/api/next";
import { ngCheckInputSchema } from "@/lib/validation/content";
import { runNgCheck } from "@/server/modules/content/ng-check";

export const POST = withApiErrorHandling(async (request: Request) => {
  const body = await parseJson(request, ngCheckInputSchema);
  return jsonOk(await runNgCheck(body));
});
