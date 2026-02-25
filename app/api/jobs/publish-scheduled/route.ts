import { withApiErrorHandling, jsonOk } from "@/lib/api/next";
import { publishScheduledPosts } from "@/server/modules/posts/service";

const run = withApiErrorHandling(async () => {
  return jsonOk(await publishScheduledPosts());
});

export const POST = run;
export const GET = run;
