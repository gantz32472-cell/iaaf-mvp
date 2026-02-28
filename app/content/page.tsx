import { Card } from "@/components/card";
import { JsonFormAction } from "@/components/client-actions";
import { PageShell } from "@/components/page-shell";
import { listOffers } from "@/server/modules/offers/service";

export const dynamic = "force-dynamic";

export default async function ContentPage({
  searchParams
}: {
  searchParams?: Promise<{ offerId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const offers = await listOffers();
  const blogActiveOffer = offers.find((o) => o.category === "blog" && o.status === "active");
  const fallbackOffer = blogActiveOffer ?? offers[0];
  const selectedOffer = offers.find((o) => o.id === params.offerId) ?? fallbackOffer;
  const selectedOfferId = selectedOffer?.id ?? "00000000-0000-0000-0000-000000000000";
  const selectedCategory = selectedOffer?.category ?? "blog";
  const selectedTargetPersona = selectedOffer?.targetPersona?.trim() || "副業でブログ収益を伸ばしたい人";
  const selectedAngles = selectedOffer?.angles?.length ? selectedOffer.angles : ["記事構成", "SEO", "収益導線"];

  return (
    <PageShell title="コンテンツ生成">
      <Card title="選択中案件">
        {selectedOffer ? (
          <div className="text-sm text-slate-700">
            <div className="font-medium">{selectedOffer.name}</div>
            <div>Category: {selectedOffer.category}</div>
            <div>ID: <span className="font-mono text-xs">{selectedOffer.id}</span></div>
          </div>
        ) : (
          <div className="text-sm text-amber-700">案件がありません。先に `/offers` で案件を作成してください。</div>
        )}
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="投稿案AI生成">
          <JsonFormAction
            title="POST /api/content/generate"
            endpoint="/api/content/generate"
            initialJson={JSON.stringify(
              {
                category: selectedCategory,
                targetPersona: selectedTargetPersona,
                angles: selectedAngles,
                offerIds: [selectedOfferId],
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
                  offerIds: [selectedOfferId],
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
