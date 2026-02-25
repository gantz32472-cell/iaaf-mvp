import crypto from "node:crypto";

export const createId = () => crypto.randomUUID();

export const createShortCode = (length = 7) =>
  crypto.randomBytes(length).toString("base64url").slice(0, length);

export const hashText = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");
