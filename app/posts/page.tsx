import { Card } from "@/components/card";
import { JsonFormAction, PostActionButton } from "@/components/client-actions";
import { PageShell } from "@/components/page-shell";
import { listPosts } from "@/server/modules/posts/service";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const posts = await listPosts();
  const firstId = posts[0]?.id ?? "00000000-0000-0000-0000-000000000000";

  return (
    <PageShell title="投稿管理">
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card title="一覧（draft / scheduled / posted / failed）">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Format</th>
                <th>Hook</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td className="font-mono text-xs">{p.id.slice(0, 8)}</td>
                  <td>{p.status}</td>
                  <td>{p.format}</td>
                  <td>{p.hookText}</td>
                  <td className="space-y-2">
                    <PostActionButton endpoint={`/api/posts/${p.id}/publish-now`} label="publish-now" />
                    <PostActionButton endpoint={`/api/posts/${p.id}/retry`} label="retry" />
                    <PostActionButton endpoint={`/api/posts/${p.id}/duplicate`} label="duplicate" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="予約登録">
          <JsonFormAction
            title="POST /api/posts/schedule"
            endpoint="/api/posts/schedule"
            initialJson={JSON.stringify(
              {
                generatedPostId: firstId,
                scheduledAt: new Date(Date.now() + 3600_000).toISOString()
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