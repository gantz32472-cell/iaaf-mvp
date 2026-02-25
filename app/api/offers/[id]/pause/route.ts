import { withApiErrorHandling, jsonOk } from "@/lib/api/next";
import { pauseOffer } from "@/server/modules/offers/service";

export const POST = withApiErrorHandling(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  return jsonOk(await pauseOffer(id));
});
