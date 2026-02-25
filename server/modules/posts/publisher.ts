import { APP_BASE_URL, ENABLE_REAL_INSTAGRAM_PUBLISH } from "@/lib/constants";
import {
  createCarouselContainer,
  createCarouselItemContainer,
  createImageContainer,
  createReelContainer,
  publishContainer
} from "@/lib/meta/client";

export interface InstagramPublisher {
  publishCarousel(input: { postId: string; mediaAssetPath?: string | null; caption: string }): Promise<{ mediaId: string }>;
  publishReel(input: { postId: string; caption: string }): Promise<{ mediaId: string }>;
  publishImage(input: { postId: string; caption: string }): Promise<{ mediaId: string }>;
}

export class MockInstagramPublisher implements InstagramPublisher {
  async publishCarousel(input: { postId: string }) {
    return { mediaId: `mock_carousel_${input.postId.slice(0, 8)}` };
  }
  async publishReel(input: { postId: string }) {
    return { mediaId: `mock_reel_${input.postId.slice(0, 8)}` };
  }
  async publishImage(input: { postId: string }) {
    return { mediaId: `mock_image_${input.postId.slice(0, 8)}` };
  }
}

class MetaGraphInstagramPublisher implements InstagramPublisher {
  private toPublicUrl(mediaAssetPath?: string | null) {
    if (!mediaAssetPath) throw new Error("mediaAssetPath is required for image/carousel publish");
    if (mediaAssetPath.startsWith("http://") || mediaAssetPath.startsWith("https://")) return mediaAssetPath;
    return `${APP_BASE_URL}${mediaAssetPath.startsWith("/") ? "" : "/"}${mediaAssetPath}`;
  }

  async publishCarousel(input: { postId: string; mediaAssetPath?: string | null; caption: string }) {
    const item = await createCarouselItemContainer({ imageUrl: this.toPublicUrl(input.mediaAssetPath) });
    const carousel = await createCarouselContainer({ children: [item.id], caption: input.caption });
    const published = await publishContainer(carousel.id);
    return { mediaId: published.id };
  }

  async publishReel(input: { postId: string; caption: string }) {
    // TODO(v1): map reel asset URL from generated media pipeline
    const reel = await createReelContainer({ videoUrl: `${APP_BASE_URL}/placeholder-reel.mp4`, caption: input.caption });
    const published = await publishContainer(reel.id);
    return { mediaId: published.id };
  }

  async publishImage(input: { postId: string; caption: string }) {
    const image = await createImageContainer({
      imageUrl: `${APP_BASE_URL}/templates/carousel-template-1.svg`,
      caption: input.caption
    });
    const published = await publishContainer(image.id);
    return { mediaId: published.id };
  }
}

export const instagramPublisher: InstagramPublisher = ENABLE_REAL_INSTAGRAM_PUBLISH
  ? new MetaGraphInstagramPublisher()
  : new MockInstagramPublisher();
