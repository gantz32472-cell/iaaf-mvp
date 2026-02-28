import { withApiErrorHandling, jsonError, jsonOk } from "@/lib/api/next";
import { publishScheduledPosts } from "@/server/modules/posts/service";
import { notifyPublishScheduledAnomalies } from "@/server/services/ops-alert";

const run = withApiErrorHandling(async (request: Request) => {
  const expectedKey = process.env.CRON_PUBLISH_SECRET?.trim();
  if (expectedKey) {
    const url = new URL(request.url);
    const key = url.searchParams.get("key") ?? request.headers.get("x-cron-key") ?? "";
    if (key !== expectedKey) {
      return jsonError("UNAUTHORIZED", "Invalid cron key", 401);
    }
  }
  const summary = await publishScheduledPosts();
  const alert = await notifyPublishScheduledAnomalies(summary);
  return jsonOk({ ...summary, alert });
});

export const POST = run;
export const GET = run;
