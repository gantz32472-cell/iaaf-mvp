import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/card";
import { getAnalyticsSummary } from "@/server/modules/analytics/service";

export default async function DashboardPage() {
  const summary = await getAnalyticsSummary();
  const stats: Array<[string, number]> = [
    ["Today Posts", summary.todayPosts],
    ["DM Count", summary.todayDms],
    ["Clicks", summary.todayClicks],
    ["Estimated CV", summary.estimatedCv],
    ["Errors", summary.errorCount]
  ];

  return (
    <PageShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map(([label, value]) => (
          <Card key={label} title={label}>
            <div className="text-3xl font-semibold">{value}</div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        <Card title="Post Ranking (Simple)">
          <table>
            <thead>
              <tr>
                <th>Post</th>
                <th>Hook</th>
                <th>Clicks</th>
                <th>DMs</th>
              </tr>
            </thead>
            <tbody>
              {summary.ranking.map((r) => (
                <tr key={r.postId}>
                  <td className="font-mono text-xs">{r.postId.slice(0, 8)}</td>
                  <td>{r.hookText}</td>
                  <td>{r.clicks}</td>
                  <td>{r.dms}</td>
                </tr>
              ))}
              {summary.ranking.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-slate-500">
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </PageShell>
  );
}
