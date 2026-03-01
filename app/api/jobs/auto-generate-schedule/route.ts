import { withApiErrorHandling, jsonError, jsonOk } from "@/lib/api/next";
import { autoGenerateAndScheduleNextPost } from "@/server/modules/posts/auto-scheduler";

const run = withApiErrorHandling(async (request: Request) => {
  const expectedKey = process.env.CRON_PUBLISH_SECRET?.trim();
  if (expectedKey) {
    const url = new URL(request.url);
    const key = url.searchParams.get("key") ?? request.headers.get("x-cron-key") ?? "";
    if (key !== expectedKey) {
      return jsonError("UNAUTHORIZED", "Invalid cron key", 401);
    }
  }

  return jsonOk(await autoGenerateAndScheduleNextPost());
});

export const POST = run;
export const GET = run;

