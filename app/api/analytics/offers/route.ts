import { withApiErrorHandling, jsonOk } from "@/lib/api/next";
import { getAnalyticsByOffers } from "@/server/modules/analytics/service";

export const GET = withApiErrorHandling(async (request: Request) => {
  const url = new URL(request.url);
  const period = url.searchParams.get("period") as "day" | "week" | "month" | null;
  return jsonOk(await getAnalyticsByOffers({ period: period ?? undefined }));
});

