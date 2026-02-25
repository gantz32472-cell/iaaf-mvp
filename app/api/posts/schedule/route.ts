import { withApiErrorHandling, jsonOk, parseJson } from "@/lib/api/next";
import { schedulePostSchema } from "@/lib/validation/posts";
import { schedulePost } from "@/server/modules/posts/service";

export const POST = withApiErrorHandling(async (request: Request) => {
  const body = await parseJson(request, schedulePostSchema);
  return jsonOk(await schedulePost(body.generatedPostId, body.scheduledAt));
});
