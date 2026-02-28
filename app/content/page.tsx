import { Card } from "@/components/card";
import { JsonFormAction } from "@/components/client-actions";
import { PageShell } from "@/components/page-shell";
import { listOffers } from "@/server/modules/offers/service";

export const dynamic = "force-dynamic";

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
                category: "blog",
                targetPersona: "副業でブログ収益を伸ばしたい人",
                angles: ["記事構成", "SEO", "収益導線"],
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
                  text: "このテンプレなら誰でも月10万円達成できます！",
                  offerIds: [firstOfferId],
                  prNotationText: "",
                  hookText: "誰でも達成",
                  captionText: "必ず収益化できる"
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
                    { title: "ブログ改善の結論", body: "検索意図に沿った構成と導線を先に決める" },
                    { title: "CTA", body: "DMで『添削』と送ると改善チェックリストを返します" }
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
