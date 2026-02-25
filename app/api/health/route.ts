import { jsonOk } from "@/lib/api/next";

export async function GET() {
  return jsonOk({
    status: "ok",
    time: new Date().toISOString(),
    mockMode: (process.env.ENABLE_MOCK_MODE ?? "true") === "true"
  });
}
