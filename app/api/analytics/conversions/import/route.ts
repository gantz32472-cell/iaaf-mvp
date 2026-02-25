import { withApiErrorHandling, jsonOk, parseJson } from "@/lib/api/next";
import { conversionsCsvImportSchema } from "@/lib/validation/csv";
import { importConversionReportsCsv } from "@/server/modules/analytics/service";

export const POST = withApiErrorHandling(async (request: Request) => {
  const body = await parseJson(request, conversionsCsvImportSchema);
  return jsonOk(await importConversionReportsCsv(body.csvText));
});
