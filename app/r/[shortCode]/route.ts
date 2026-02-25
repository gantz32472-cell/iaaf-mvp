import { NextResponse } from "next/server";
import { resolveRedirectAndTrack } from "@/server/modules/redirects/service";

export async function GET(request: Request, context: { params: Promise<{ shortCode: string }> }) {
  const { shortCode } = await context.params;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = request.headers.get("user-agent");
  const result = await resolveRedirectAndTrack({ shortCode, userAgent, ip });
  if (!result) {
    return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Short code not found" } }, { status: 404 });
  }
  return NextResponse.redirect(result.targetUrl, 302);
}
