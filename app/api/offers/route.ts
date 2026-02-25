import { withApiErrorHandling, jsonError, jsonOk, parseJson } from "@/lib/api/next";
import { offerInputSchema } from "@/lib/validation/offers";
import { createOffer, listOffers } from "@/server/modules/offers/service";

export const GET = withApiErrorHandling(async () => jsonOk(await listOffers()));

export const POST = withApiErrorHandling(async (request: Request) => {
  const body = await parseJson(request, offerInputSchema);
  const offer = await createOffer(body);
  return jsonOk(offer, { status: 201 });
});
