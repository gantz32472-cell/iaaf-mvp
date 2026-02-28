import { withApiErrorHandling, jsonOk } from "@/lib/api/next";
import { getOperationalErrors } from "@/server/modules/analytics/service";

export const GET = withApiErrorHandling(async (request: Request) => {
  const url = new URL(request.url);
  const limitRaw = Number(url.searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(limitRaw) ? limitRaw : 50;
  return jsonOk(await getOperationalErrors({ limit }));
});

