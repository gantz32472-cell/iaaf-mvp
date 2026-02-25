import fs from "node:fs/promises";
import path from "node:path";
import { createId } from "@/lib/utils/id";
import { nowIso } from "@/lib/utils/date";
import { getDb, saveDb } from "@/lib/store/repository";
import { generatePostContent } from "@/lib/ai/client";
import { GeneratedPost } from "@/types/models";

export async function generateContentDraft(input: {
  category: string;
  targetPersona?: string | null;
  angles: string[];
  offerIds: string[];
  format: "carousel" | "reel";
  objective: "dm" | "click";
}) {
  return generatePostContent(input);
}

export async function saveGeneratedPostDraft(input: {
  offerIds: string[];
  category: string;
  format: "carousel" | "reel";
  hookText: string;
  scriptText: string;
  captionText: string;
  hashtags: string[];
  ctaKeyword: string;
  prNotationText?: string | null;
  mediaAssetPath?: string | null;
}) {
  const now = nowIso();
  const post: GeneratedPost = {
    id: createId(),
    status: "draft",
    createdAt: now,
    updatedAt: now,
    scheduledAt: null,
    postedAt: null,
    instagramMediaId: null,
    errorMessage: null,
    ...input
  };
  await saveDb((db) => db.generatedPosts.push(post));
  return post;
}

export async function renderCarouselSvg(pages: Array<{ title: string; body: string }>) {
  const width = 1080;
  const height = 1080;
  const filename = `${createId()}.svg`;
  const outDir = path.join(process.cwd(), "public", "generated", "carousels");
  await fs.mkdir(outDir, { recursive: true });
  const first = pages[0];
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#12322c" />
      <stop offset="100%" stop-color="#2f7c6d" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)" />
  <rect x="60" y="60" width="${width - 120}" height="${height - 120}" rx="28" fill="#f2f7f6" opacity="0.95" />
  <text x="110" y="220" font-size="72" font-family="sans-serif" fill="#12322c" font-weight="700">${escapeXml(first.title)}</text>
  <text x="110" y="340" font-size="42" font-family="sans-serif" fill="#1f574d">${escapeXml(first.body)}</text>
  <text x="110" y="${height - 140}" font-size="28" font-family="sans-serif" fill="#2f7c6d">IAAF MVP carousel mock (${pages.length}p)</text>
</svg>`;
  await fs.writeFile(path.join(outDir, filename), svg, "utf8");
  return `/generated/carousels/${filename}`;
}

function escapeXml(text: string) {
  return text.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
}
