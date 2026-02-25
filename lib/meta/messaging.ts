import { ENABLE_REAL_INSTAGRAM_DM } from "@/lib/constants";

const META_GRAPH_BASE = "https://graph.facebook.com/v21.0";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export async function sendInstagramTextMessage(input: { recipientId: string; text: string }) {
  if (!ENABLE_REAL_INSTAGRAM_DM) {
    return { id: `mock_dm_${Date.now()}`, mode: "mock" as const };
  }
  const accessToken = requiredEnv("META_PAGE_ACCESS_TOKEN");
  const body = {
    messaging_product: "instagram",
    recipient: { id: input.recipientId },
    message: { text: input.text }
  };
  const res = await fetch(`${META_GRAPH_BASE}/me/messages?access_token=${encodeURIComponent(accessToken)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Meta Messaging API error (${res.status}): ${JSON.stringify(json)}`);
  return { ...(json as Record<string, unknown>), mode: "real" as const };
}
