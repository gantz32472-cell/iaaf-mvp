import { Card } from "@/components/card";
import { JsonFormAction } from "@/components/client-actions";
import { PageShell } from "@/components/page-shell";
import { getOperationalErrors } from "@/server/modules/analytics/service";

export const dynamic = "force-dynamic";

function formatDateTime(value: string) {
  const t = new Date(value);
  if (Number.isNaN(t.getTime())) return value;
  return t.toLocaleString("ja-JP", { hour12: false });
}

export default async function OpsPage() {
  const { total, rows } = await getOperationalErrors({ limit: 100 });

  return (
    <PageShell title="Ops">
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card title={`Error Logs (${total})`}>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Severity</th>
                <th>Source</th>
                <th>Post</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{formatDateTime(row.occurredAt)}</td>
                  <td>{row.severity}</td>
                  <td>{row.source}</td>
                  <td className="font-mono text-xs">{row.postId.slice(0, 8)}</td>
                  <td className="max-w-lg whitespace-pre-wrap break-words">{row.message}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-slate-500">
                    No errors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card title="API Debug">
          <JsonFormAction
            title="GET /api/analytics/errors?limit=100"
            endpoint="/api/analytics/errors?limit=100"
            method="GET"
            initialJson="{}"
          />
        </Card>
      </div>
    </PageShell>
  );
}

