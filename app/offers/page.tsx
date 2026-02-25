import { Card } from "@/components/card";
import { JsonFormAction } from "@/components/client-actions";
import { PageShell } from "@/components/page-shell";
import { listOffers } from "@/server/modules/offers/service";

export default async function OffersPage() {
  const offers = await listOffers();
  return (
    <PageShell title="案件マスタ">
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card title="案件一覧 / 一時停止">
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
          <Card title="新規作成">
            <JsonFormAction
              title="POST /api/offers"
              endpoint="/api/offers"
              initialJson={JSON.stringify(
                {
                  name: "新規Wi-Fi比較案件",
                  category: "internet",
                  aspName: "A8",
                  destinationUrl: "https://example.com/wifi",
                  angles: ["料金", "速度", "工事不要"],
                  prLabelRequired: true,
                  ngWords: ["絶対", "最強"]
                },
                null,
                2
              )}
            />
          </Card>
          <Card title="CSV取込">
            <JsonFormAction
              title="POST /api/offers/import-csv"
              endpoint="/api/offers/import-csv"
              initialJson={JSON.stringify(
                {
                  csvText:
                    "name,category,aspName,destinationUrl,referenceUrl,targetPersona,angles,prLabelRequired,ngWords,status\n" +
                    "サンプル回線,internet,A8,https://example.com/hikari,,在宅ワーカー,料金|速度,true,絶対|No.1,active"
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
