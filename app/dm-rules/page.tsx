import { Card } from "@/components/card";
import { JsonFormAction } from "@/components/client-actions";
import { PageShell } from "@/components/page-shell";
import { listDmRules } from "@/server/modules/dm-rules/service";

export const dynamic = "force-dynamic";

export default async function DmRulesPage() {
  const rules = await listDmRules();

  return (
    <PageShell title="DMルール管理">
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card title="ルール一覧">
          <table>
            <thead>
              <tr>
                <th>Keyword</th>
                <th>Match</th>
                <th>Active</th>
                <th>Reply1</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id}>
                  <td>{r.keyword}</td>
                  <td>{r.matchType}</td>
                  <td>{String(r.isActive)}</td>
                  <td>{r.reply1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="space-y-4">
          <Card title="ルール作成">
            <JsonFormAction
              title="POST /api/dm-rules"
              endpoint="/api/dm-rules"
              initialJson={JSON.stringify(
                {
                  keyword: "比較",
                  matchType: "partial",
                  reply1: "比較表はこちらです。必要なら条件別でも出せます。",
                  targetUrl: "https://example.com/compare",
                  cooldownHours: 24,
                  isActive: true
                },
                null,
                2
              )}
            />
          </Card>

          <Card title="テストマッチ">
            <JsonFormAction
              title="POST /api/dm-rules/test-match"
              endpoint="/api/dm-rules/test-match"
              initialJson={JSON.stringify({ messageText: "wifi 比較ください" }, null, 2)}
            />
          </Card>

          <Card title="Mock Webhook テスト">
            <JsonFormAction
              title="POST /api/webhooks/instagram/messages"
              endpoint="/api/webhooks/instagram/messages"
              initialJson={JSON.stringify(
                { instagramUserId: "user_123", messageText: "回線比較", generatedPostId: null },
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