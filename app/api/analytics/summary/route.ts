import { withApiErrorHandling, jsonOk } from "@/lib/api/next";
import { getAnalyticsSummary } from "@/server/modules/analytics/service";

export const GET = withApiErrorHandling(async (request: Request) => {
  const url = new URL(request.url);
  const period = url.searchParams.get("period") as "day" | "week" | "month" | null;
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;
  return jsonOk(await getAnalyticsSummary({ period: period ?? undefined, from, to }));
});
