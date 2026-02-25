import { Card } from "@/components/card";
import { JsonFormAction } from "@/components/client-actions";
import { PageShell } from "@/components/page-shell";
import { listOffers } from "@/server/modules/offers/service";

export default async function ContentPage() {
  const offers = await listOffers();
  const firstOfferId = offers[0]?.id ?? "00000000-0000-0000-0000-000000000000";
  return (
    <PageShell title="コンテンツ生成">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="投稿案AI生成">
          <JsonFormAction
            title="POST /api/content/generate"
            endpoint="/api/content/generate"
            initialJson={JSON.stringify(
              {
                category: "internet",
                targetPersona: "一人暮らしで固定費を下げたい人",
                angles: ["料金", "工事有無", "速度安定性"],
                offerIds: [firstOfferId],
                format: "carousel",
                objective: "dm"
              },
              null,
              2
            )}
          />
        </Card>
        <div className="space-y-4">
          <Card title="NGチェック">
            <JsonFormAction
              title="POST /api/content/ng-check"
              endpoint="/api/content/ng-check"
              initialJson={JSON.stringify(
                {
                  text: "このWi-Fiは絶対おすすめ！100%満足！",
                  offerIds: [firstOfferId],
                  prNotationText: "",
                  hookText: "絶対おすすめ",
                  captionText: "100%満足"
                },
                null,
                2
              )}
            />
          </Card>
          <Card title="カルーセル画像生成（簡易SVG）">
            <JsonFormAction
              title="POST /api/content/render-carousel"
              endpoint="/api/content/render-carousel"
              initialJson={JSON.stringify(
                {
                  pages: [
                    { title: "回線比較の結論", body: "料金だけでなく工事有無と速度を確認" },
                    { title: "CTA", body: "DMで『比較』と送信" }
                  ]
                },
                null,
                2
              )}
            />
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
