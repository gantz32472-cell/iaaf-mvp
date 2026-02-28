import { Card } from "@/components/card";
import { JsonFormAction } from "@/components/client-actions";
import { PageShell } from "@/components/page-shell";
import { getDmReplyTemplates, listDmRules } from "@/server/modules/dm-rules/service";

export const dynamic = "force-dynamic";

export default async function DmRulesPage() {
  const rules = await listDmRules();
  const [firstTemplate] = getDmReplyTemplates();

  return (
    <PageShell title="DM Rules">
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card title="Rules">
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
          <Card title="Create Rule">
            <JsonFormAction
              title="POST /api/dm-rules"
              endpoint="/api/dm-rules"
              initialJson={JSON.stringify(
                {
                  keyword: firstTemplate.keyword,
                  matchType: firstTemplate.matchType,
                  reply1: firstTemplate.reply1,
                  reply2: firstTemplate.reply2,
                  delayMinutesForReply2: firstTemplate.delayMinutesForReply2,
                  targetUrl: firstTemplate.targetUrl,
                  cooldownHours: firstTemplate.cooldownHours,
                  isActive: firstTemplate.isActive
                },
                null,
                2
              )}
            />
          </Card>

          <Card title="Reply Templates">
            <JsonFormAction
              title="GET /api/dm-rules/templates"
              endpoint="/api/dm-rules/templates"
              method="GET"
              initialJson="{}"
            />
          </Card>

          <Card title="Test Match">
            <JsonFormAction
              title="POST /api/dm-rules/test-match"
              endpoint="/api/dm-rules/test-match"
              initialJson={JSON.stringify({ messageText: "wifi compare please" }, null, 2)}
            />
          </Card>

          <Card title="Mock Webhook Test">
            <JsonFormAction
              title="POST /api/webhooks/instagram/messages"
              endpoint="/api/webhooks/instagram/messages"
              initialJson={JSON.stringify(
                { instagramUserId: "user_123", messageText: "compare", generatedPostId: null },
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

