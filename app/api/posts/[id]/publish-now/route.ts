import { withApiErrorHandling, jsonOk } from "@/lib/api/next";
import { publishPostNow } from "@/server/modules/posts/service";

export const POST = withApiErrorHandling(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  return jsonOk(await publishPostNow(id));
});
