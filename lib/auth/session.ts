import { cookies } from "next/headers";
import crypto from "node:crypto";

export const SESSION_COOKIE_NAME = "iaaf_session";

function secret() {
  return process.env.SESSION_SECRET || "dev-session-secret";
}

export function createSessionToken(username: string) {
  const payload = `${username}:${Date.now()}`;
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [username, issuedAt, sig] = decoded.split(":");
    if (!username || !issuedAt || !sig) return false;
    const payload = `${username}:${issuedAt}`;
    const expected = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
    const maxAgeMs = 1000 * 60 * 60 * 24 * 7;
    if (Date.now() - Number(issuedAt) > maxAgeMs) return false;
    return true;
  } catch {
    return false;
  }
}

export async function isAuthenticatedOnServer() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE_NAME)?.value);
}
