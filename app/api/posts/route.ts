import { withApiErrorHandling, jsonOk } from "@/lib/api/next";
import { listPosts } from "@/server/modules/posts/service";

export const GET = withApiErrorHandling(async () => jsonOk(await listPosts()));
