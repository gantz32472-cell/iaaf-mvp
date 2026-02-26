import Link from "next/link";
import { Card } from "@/components/card";
import { JsonFormAction } from "@/components/client-actions";
import { PageShell } from "@/components/page-shell";
import { getAnalyticsByKeywords, getAnalyticsByPosts } from "@/server/modules/analytics/service";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
  searchParams
}: {
  searchParams?: Promise<{ period?: "day" | "week" | "month" }>;
}) {
  const params = (await searchParams) ?? {};
  const period = params.period ?? "week";
  const [posts, keywords] = await Promise.all([
    getAnalyticsByPosts({ period }),
    getAnalyticsByKeywords({ period })
  ]);
  return (
    <PageShell title="分析">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-slate-600">期間指定:</span>
        {(["day", "week", "month"] as const).map((p) => (
          <Link
            key={p}
            href={`/analytics?period=${p}`}
            className={`rounded-full px-3 py-1 text-xs ${period === p ? "bg-brand-700 text-white" : "bg-white text-slate-700"}`}
          >
            {p}
          </Link>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="投稿別 DM / クリック集計">
          <table>
            <thead>
              <tr>
                <th>Post</th>
                <th>Status</th>
                <th>DMs</th>
                <th>Clicks</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((row) => (
                <tr key={row.postId}>
                  <td>{row.hookText}</td>
                  <td>{row.status}</td>
                  <td>{row.dms}</td>
                  <td>{row.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="キーワード別集計">
          <table>
            <thead>
              <tr>
                <th>Keyword</th>
                <th>DMs</th>
                <th>Clicks</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((row) => (
                <tr key={row.keyword}>
                  <td>{row.keyword}</td>
                  <td>{row.dms}</td>
                  <td>{row.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
      <div className="mt-4">
        <Card title="CV CSV取込">
          <JsonFormAction
            title="POST /api/analytics/conversions/import"
            endpoint="/api/analytics/conversions/import"
            initialJson={JSON.stringify(
              {
                csvText:
                  "date,offerId,cvCount,approvedCount,revenueAmount,source\n" +
                  "2026-02-25,REPLACE_OFFER_ID,3,2,12000,csv"
              },
              null,
              2
            )}
          />
        </Card>
      </div>
    </PageShell>
  );
}
