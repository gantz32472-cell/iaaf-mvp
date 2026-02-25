export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "IAAF";
export const ENABLE_MOCK_MODE = (process.env.ENABLE_MOCK_MODE ?? "true") === "true";
export const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000";
export const DUPLICATE_SIMILARITY_THRESHOLD = 0.82;
export const ENABLE_REAL_INSTAGRAM_PUBLISH = (process.env.ENABLE_REAL_INSTAGRAM_PUBLISH ?? "false") === "true";
export const ENABLE_REAL_INSTAGRAM_DM = (process.env.ENABLE_REAL_INSTAGRAM_DM ?? "false") === "true";
export const ENABLE_AUTH = (process.env.ENABLE_AUTH ?? "false") === "true";
