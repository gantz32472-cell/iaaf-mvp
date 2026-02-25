import { PageShell } from "@/components/page-shell";

export default function LoginPage() {
  return (
    <PageShell title="Login">
      <div className="max-w-md rounded-2xl border border-brand-100 bg-white p-6">
        <p className="mb-4 text-sm text-slate-600">`ENABLE_AUTH=true` の場合に管理画面ログインで利用します。</p>
        <form className="space-y-3" action="/api/auth/login" method="post">
          <div>
            <label className="mb-1 block text-sm">Username</label>
            <input name="username" defaultValue="admin" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Password</label>
            <input type="password" name="password" />
          </div>
          <button className="bg-brand-700 text-white hover:bg-brand-900" type="submit">
            Login
          </button>
        </form>
        <p className="mt-3 text-xs text-slate-500">
          API利用時は JSON POST（`/api/auth/login`）を推奨。フォームは最低限確認用です。
        </p>
      </div>
    </PageShell>
  );
}
