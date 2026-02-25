import { withApiErrorHandling, jsonOk, parseJson } from "@/lib/api/next";
import { offersCsvImportSchema } from "@/lib/validation/csv";
import { importOffersCsv } from "@/server/modules/offers/service";

export const POST = withApiErrorHandling(async (request: Request) => {
  const body = await parseJson(request, offersCsvImportSchema);
  return jsonOk(await importOffersCsv(body.csvText));
});
