import { metaCreateContainerResponseSchema, metaPublishMediaResponseSchema } from "@/lib/meta/types";

const META_GRAPH_BASE = "https://graph.facebook.com/v21.0";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function getAccessToken() {
  return requiredEnv("META_PAGE_ACCESS_TOKEN");
}

function getIgUserId() {
  return requiredEnv("META_IG_USER_ID");
}

async function metaFetch<T>(url: string, init?: RequestInit, parser?: (json: unknown) => T): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Meta API error (${res.status}): ${JSON.stringify(json)}`);
  }
  return parser ? parser(json) : (json as T);
}

export async function createImageContainer(input: { imageUrl: string; caption?: string }) {
  const params = new URLSearchParams({
    image_url: input.imageUrl,
    access_token: getAccessToken()
  });
  if (input.caption) params.set("caption", input.caption);
  return metaFetch(
    `${META_GRAPH_BASE}/${getIgUserId()}/media`,
    { method: "POST", body: params },
    (json) => metaCreateContainerResponseSchema.parse(json)
  );
}

export async function createCarouselItemContainer(input: { imageUrl: string }) {
  const params = new URLSearchParams({
    image_url: input.imageUrl,
    is_carousel_item: "true",
    access_token: getAccessToken()
  });
  return metaFetch(
    `${META_GRAPH_BASE}/${getIgUserId()}/media`,
    { method: "POST", body: params },
    (json) => metaCreateContainerResponseSchema.parse(json)
  );
}

export async function createCarouselContainer(input: { children: string[]; caption?: string }) {
  const params = new URLSearchParams({
    media_type: "CAROUSEL",
    children: input.children.join(","),
    access_token: getAccessToken()
  });
  if (input.caption) params.set("caption", input.caption);
  return metaFetch(
    `${META_GRAPH_BASE}/${getIgUserId()}/media`,
    { method: "POST", body: params },
    (json) => metaCreateContainerResponseSchema.parse(json)
  );
}

export async function createReelContainer(input: { videoUrl: string; caption?: string }) {
  const params = new URLSearchParams({
    media_type: "REELS",
    video_url: input.videoUrl,
    access_token: getAccessToken()
  });
  if (input.caption) params.set("caption", input.caption);
  return metaFetch(
    `${META_GRAPH_BASE}/${getIgUserId()}/media`,
    { method: "POST", body: params },
    (json) => metaCreateContainerResponseSchema.parse(json)
  );
}

export async function publishContainer(creationId: string) {
  const params = new URLSearchParams({
    creation_id: creationId,
    access_token: getAccessToken()
  });
  return metaFetch(
    `${META_GRAPH_BASE}/${getIgUserId()}/media_publish`,
    { method: "POST", body: params },
    (json) => metaPublishMediaResponseSchema.parse(json)
  );
}
