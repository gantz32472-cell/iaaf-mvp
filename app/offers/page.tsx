import { Card } from "@/components/card";
import { JsonFormAction } from "@/components/client-actions";
import { PageShell } from "@/components/page-shell";
import { listOffers } from "@/server/modules/offers/service";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const offers = await listOffers();

  return (
    <PageShell title="Offers">
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card title="Offer List">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>ASP</th>
                <th>Pause API</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id}>
                  <td>{o.name}</td>
                  <td>{o.category}</td>
                  <td>{o.status}</td>
                  <td>{o.aspName}</td>
                  <td className="font-mono text-xs">POST /api/offers/{o.id}/pause</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="space-y-4">
          <Card title="Create Offer">
            <JsonFormAction
              title="POST /api/offers"
              endpoint="/api/offers"
              initialJson={JSON.stringify(
                {
                  name: "ブログ運用案件",
                  category: "blog",
                  aspName: "A8",
                  destinationUrl: "https://example.com/blog",
                  referenceUrl: "https://example.com/blog-ref",
                  targetPersona: "副業ブロガー",
                  angles: ["SEO", "記事構成", "収益化"],
                  prLabelRequired: true,
                  ngWords: ["No.1", "絶対"],
                  status: "active"
                },
                null,
                2
              )}
            />
          </Card>

          <Card title="CSV Import">
            <JsonFormAction
              title="POST /api/offers/import-csv"
              endpoint="/api/offers/import-csv"
              initialJson={JSON.stringify(
                {
                  csvText:
                    "name,category,aspName,destinationUrl,referenceUrl,targetPersona,angles,prLabelRequired,ngWords,status\n" +
                    "ブログ運用案件,blog,A8,https://example.com/blog,,副業ブロガー,SEO|記事構成|収益化,true,No.1|絶対,active"
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

