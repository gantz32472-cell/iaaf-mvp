import { withApiErrorHandling, jsonOk } from "@/lib/api/next";
import { getDmReplyTemplates } from "@/server/modules/dm-rules/service";

export const GET = withApiErrorHandling(async () => {
  return jsonOk({ templates: getDmReplyTemplates() });
});

