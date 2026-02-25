export type OfferCategory = "internet" | "server" | "other";
export type OfferStatus = "active" | "paused" | "ended";
export type PostFormat = "carousel" | "reel";
export type GeneratedPostStatus = "draft" | "scheduled" | "posted" | "failed";
export type DmMatchType = "partial" | "exact";
export type ConversionSource = "manual" | "csv";

export interface Offer {
  id: string;
  name: string;
  category: OfferCategory;
  aspName: string;
  destinationUrl: string;
  referenceUrl?: string | null;
  targetPersona?: string | null;
  angles: string[];
  prLabelRequired: boolean;
  ngWords: string[];
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedPost {
  id: string;
  offerIds: string[];
  category: string;
  format: PostFormat;
  hookText: string;
  scriptText: string;
  captionText: string;
  hashtags: string[];
  ctaKeyword: string;
  prNotationText?: string | null;
  mediaAssetPath?: string | null;
  status: GeneratedPostStatus;
  scheduledAt?: string | null;
  postedAt?: string | null;
  instagramMediaId?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DmRule {
  id: string;
  keyword: string;
  matchType: DmMatchType;
  reply1: string;
  reply2?: string | null;
  delayMinutesForReply2?: number | null;
  targetUrl: string;
  cooldownHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DmConversation {
  id: string;
  instagramUserIdHash: string;
  messageText: string;
  matchedKeyword?: string | null;
  ruleId?: string | null;
  replied: boolean;
  generatedPostId?: string | null;
  createdAt: string;
}

export interface ClickEvent {
  id: string;
  shortCode: string;
  generatedPostId?: string | null;
  offerId?: string | null;
  keyword?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
  userAgent?: string | null;
  ipHash?: string | null;
  clickedAt: string;
}

export interface ConversionReport {
  id: string;
  date: string;
  offerId: string;
  cvCount: number;
  approvedCount: number;
  revenueAmount: number;
  source: ConversionSource;
  createdAt: string;
  updatedAt: string;
}

export interface ShortLink {
  shortCode: string;
  targetUrl: string;
  generatedPostId?: string | null;
  offerId?: string | null;
  keyword?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  createdAt: string;
}

export interface MockDatabase {
  offers: Offer[];
  generatedPosts: GeneratedPost[];
  dmRules: DmRule[];
  dmConversations: DmConversation[];
  clickEvents: ClickEvent[];
  conversionReports: ConversionReport[];
  shortLinks: ShortLink[];
}
