import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

type MockDatabase = import("../types/models").MockDatabase;

const createId = () => crypto.randomUUID();
const createShortCode = (length = 7) => crypto.randomBytes(length).toString("base64url").slice(0, length);
const hashText = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

function isoOffset(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

async function main() {
  const offer1 = createId();
  const offer2 = createId();
  const offer3 = createId();
  const post1 = createId();
  const post2 = createId();
  const post3 = createId();
  const rule1 = createId();
  const rule2 = createId();
  const rule3 = createId();
  const rule4 = createId();
  const rule5 = createId();

  const short1 = createShortCode();
  const short2 = createShortCode();

  const db: MockDatabase = {
    offers: [
      {
        id: offer1,
        name: "光回線比較LP送客",
        category: "internet",
        aspName: "A8",
        destinationUrl: "https://example.com/hikari-compare",
        referenceUrl: "https://asp.example.com/campaign/1",
        targetPersona: "在宅勤務で回線品質を重視する人",
        angles: ["料金", "実測速度", "工事費"],
        prLabelRequired: true,
        ngWords: ["絶対", "100%", "No.1"],
        status: "active",
        createdAt: isoOffset(2000),
        updatedAt: isoOffset(2000)
      },
      {
        id: offer2,
        name: "ホームルーター比較記事",
        category: "internet",
        aspName: "もしも",
        destinationUrl: "https://example.com/home-router",
        referenceUrl: null,
        targetPersona: "一人暮らし/工事したくない人",
        angles: ["工事不要", "料金", "速度制限"],
        prLabelRequired: true,
        ngWords: ["最強", "必ず"],
        status: "active",
        createdAt: isoOffset(1900),
        updatedAt: isoOffset(1900)
      },
      {
        id: offer3,
        name: "レンタルサーバー比較",
        category: "server",
        aspName: "バリューコマース",
        destinationUrl: "https://example.com/server-compare",
        referenceUrl: "https://asp.example.com/server",
        targetPersona: "ブログ初心者",
        angles: ["月額", "初期費用", "WordPress簡単化"],
        prLabelRequired: true,
        ngWords: ["最安保証", "No.1"],
        status: "active",
        createdAt: isoOffset(1800),
        updatedAt: isoOffset(1800)
      }
    ],
    generatedPosts: [
      {
        id: post1,
        offerIds: [offer1, offer2],
        category: "internet",
        format: "carousel",
        hookText: "工事あり/なしで変わる Wi-Fi比較の結論",
        scriptText: "用途別の比較台本",
        captionText: "料金だけで決めず、工事有無と速度のブレも比較。DMで「回線」と送ってください。 #WiFi比較",
        hashtags: ["#WiFi比較", "#光回線", "#ホームルーター"],
        ctaKeyword: "回線",
        prNotationText: "PR",
        mediaAssetPath: "/templates/carousel-template-1.svg",
        status: "posted",
        scheduledAt: isoOffset(300),
        postedAt: isoOffset(280),
        instagramMediaId: "mock_carousel_seed01",
        errorMessage: null,
        createdAt: isoOffset(320),
        updatedAt: isoOffset(280)
      },
      {
        id: post2,
        offerIds: [offer3],
        category: "server",
        format: "carousel",
        hookText: "サーバー比較で最初に見る3項目",
        scriptText: "Xserver/ConoHa/ロリポップ比較",
        captionText: "初心者向けに比較軸を整理。DMで「サーバー」と送信で一覧リンクを返します。 #レンタルサーバー",
        hashtags: ["#レンタルサーバー", "#Xserver", "#ConoHa"],
        ctaKeyword: "サーバー",
        prNotationText: "PR",
        mediaAssetPath: "/templates/carousel-template-1.svg",
        status: "scheduled",
        scheduledAt: isoOffset(-60),
        postedAt: null,
        instagramMediaId: null,
        errorMessage: null,
        createdAt: isoOffset(140),
        updatedAt: isoOffset(120)
      },
      {
        id: post3,
        offerIds: [offer2],
        category: "internet",
        format: "carousel",
        hookText: "一人暮らしのWi-Fi固定費を見直す比較術",
        scriptText: "比較投稿台本",
        captionText: "固定費を下げたい方向け。DMで「wifi」と送信してください。",
        hashtags: ["#WiFi", "#固定費見直し"],
        ctaKeyword: "wifi",
        prNotationText: "PR",
        mediaAssetPath: null,
        status: "draft",
        scheduledAt: null,
        postedAt: null,
        instagramMediaId: null,
        errorMessage: null,
        createdAt: isoOffset(60),
        updatedAt: isoOffset(60)
      }
    ],
    dmRules: [
      {
        id: rule1,
        keyword: "回線",
        matchType: "partial",
        reply1: "光回線/ホームルーター比較はこちらです → https://example.com/hikari-compare",
        reply2: "用途（在宅/動画/一人暮らし）がわかればおすすめを返せます。",
        delayMinutesForReply2: 30,
        targetUrl: "https://example.com/hikari-compare",
        cooldownHours: 24,
        isActive: true,
        createdAt: isoOffset(2000),
        updatedAt: isoOffset(2000)
      },
      {
        id: rule2,
        keyword: "wifi",
        matchType: "partial",
        reply1: "Wi-Fi比較リンクです → https://example.com/home-router",
        reply2: null,
        delayMinutesForReply2: null,
        targetUrl: "https://example.com/home-router",
        cooldownHours: 24,
        isActive: true,
        createdAt: isoOffset(1900),
        updatedAt: isoOffset(1900)
      },
      {
        id: rule3,
        keyword: "サーバー",
        matchType: "partial",
        reply1: "レンタルサーバー比較はこちら → https://example.com/server-compare",
        reply2: null,
        delayMinutesForReply2: null,
        targetUrl: "https://example.com/server-compare",
        cooldownHours: 24,
        isActive: true,
        createdAt: isoOffset(1800),
        updatedAt: isoOffset(1800)
      },
      {
        id: rule4,
        keyword: "xserver",
        matchType: "partial",
        reply1: "Xserver含む比較表はこちら → https://example.com/server-compare",
        reply2: null,
        delayMinutesForReply2: null,
        targetUrl: "https://example.com/server-compare",
        cooldownHours: 24,
        isActive: true,
        createdAt: isoOffset(1700),
        updatedAt: isoOffset(1700)
      },
      {
        id: rule5,
        keyword: "初心者",
        matchType: "partial",
        reply1: "初心者向け比較まとめを返します → https://example.com/server-compare",
        reply2: null,
        delayMinutesForReply2: null,
        targetUrl: "https://example.com/server-compare",
        cooldownHours: 24,
        isActive: true,
        createdAt: isoOffset(1600),
        updatedAt: isoOffset(1600)
      }
    ],
    dmConversations: [
      {
        id: createId(),
        instagramUserIdHash: hashText("user_a"),
        messageText: "回線比較ください",
        matchedKeyword: "回線",
        ruleId: rule1,
        replied: true,
        generatedPostId: post1,
        createdAt: isoOffset(120)
      },
      {
        id: createId(),
        instagramUserIdHash: hashText("user_b"),
        messageText: "サーバー",
        matchedKeyword: "サーバー",
        ruleId: rule3,
        replied: true,
        generatedPostId: post2,
        createdAt: isoOffset(90)
      }
    ],
    clickEvents: [
      {
        id: createId(),
        shortCode: short1,
        generatedPostId: post1,
        offerId: offer1,
        keyword: "回線",
        utmSource: "instagram",
        utmCampaign: post1,
        userAgent: "seed-agent",
        ipHash: hashText("127.0.0.1"),
        clickedAt: isoOffset(110)
      },
      {
        id: createId(),
        shortCode: short2,
        generatedPostId: post2,
        offerId: offer3,
        keyword: "サーバー",
        utmSource: "instagram",
        utmCampaign: post2,
        userAgent: "seed-agent",
        ipHash: hashText("127.0.0.2"),
        clickedAt: isoOffset(70)
      }
    ],
    conversionReports: [
      {
        id: createId(),
        date: new Date().toISOString().slice(0, 10),
        offerId: offer1,
        cvCount: 2,
        approvedCount: 1,
        revenueAmount: 8000,
        source: "manual",
        createdAt: isoOffset(30),
        updatedAt: isoOffset(30)
      },
      {
        id: createId(),
        date: new Date().toISOString().slice(0, 10),
        offerId: offer3,
        cvCount: 1,
        approvedCount: 1,
        revenueAmount: 6000,
        source: "csv",
        createdAt: isoOffset(20),
        updatedAt: isoOffset(20)
      }
    ],
    shortLinks: [
      {
        shortCode: short1,
        targetUrl: "https://example.com/hikari-compare",
        generatedPostId: post1,
        offerId: offer1,
        keyword: "回線",
        utmSource: "instagram",
        utmMedium: "dm",
        utmCampaign: post1,
        createdAt: isoOffset(300)
      },
      {
        shortCode: short2,
        targetUrl: "https://example.com/server-compare",
        generatedPostId: post2,
        offerId: offer3,
        keyword: "サーバー",
        utmSource: "instagram",
        utmMedium: "dm",
        utmCampaign: post2,
        createdAt: isoOffset(150)
      }
    ]
  };

  const outPath = path.join(process.cwd(), "data", "mock-db.json");
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(db, null, 2), "utf8");
  console.log("Seeded mock DB:", outPath);
  console.log("Offer IDs:", { offer1, offer2, offer3 });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
