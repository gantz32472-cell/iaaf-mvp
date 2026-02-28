# Deploy Checklist (Real Ops)

## 1. 環境変数（必須）
- `APP_BASE_URL` を HTTPS 公開URLに設定
- `ENABLE_MOCK_MODE=false`
- `ENABLE_REAL_INSTAGRAM_PUBLISH=true`
- `ENABLE_REAL_INSTAGRAM_DM=true`
- `META_APP_ID`
- `META_APP_SECRET`
- `META_IG_USER_ID`
- `META_PAGE_ACCESS_TOKEN`
- `META_VERIFY_TOKEN`
- `DATABASE_URL`

## 2. DB
- PostgreSQLを作成（Supabase / Render / Neon / self-hosted）
- `npm run prisma:generate`
- `npm run prisma:migrate`

## 3. デプロイ
- Vercel/Render等にデプロイ
- `GET /api/health` が 200 を返すことを確認
- `POST /api/jobs/publish-scheduled` を手動実行して応答確認

## 4. Meta設定
- Instagram Business/Creator と Facebook Page を接続
- Webhook callback URL:
  - `https://<domain>/api/webhooks/instagram/messages`
  - `https://<domain>/api/webhooks/instagram/comments`
- Verify Token: `META_VERIFY_TOKEN`
- 必要権限を持つアクセストークンを設定

## 5. 疎通確認順序
1. `GET /api/health`
2. `GET /api/webhooks/instagram/messages?hub.mode=subscribe&hub.verify_token=...&hub.challenge=123`
3. mock payload で messages webhook POST
4. `publish-now` を1件実行（実投稿）
5. `publish-scheduled` のcron実行確認

## 6. Meta env (code-based source of truth)
- Real integration switches:
  - `ENABLE_REAL_INSTAGRAM_PUBLISH=true`
  - `ENABLE_REAL_INSTAGRAM_DM=true`
- Required for publish:
  - `META_PAGE_ACCESS_TOKEN`
  - `META_IG_USER_ID`
  - `APP_BASE_URL` (public `https://...`)
- Required for DM send:
  - `META_PAGE_ACCESS_TOKEN`
- Required for webhook verify/signature:
  - `META_VERIFY_TOKEN`
  - `META_APP_SECRET`

References:
- `lib/constants.ts`
- `lib/meta/client.ts`
- `lib/meta/messaging.ts`
- `app/api/webhooks/instagram/messages/route.ts`
- `app/api/webhooks/instagram/comments/route.ts`

Meta App operation guide:
- `docs/META-INSTAGRAM-SETUP.md`

## 7. Render Cron (auto publish)
- Set env on web service:
  - `CRON_PUBLISH_SECRET=<long-random-string>`
  - optional: `OPS_ALERT_WEBHOOK_URL=<webhook-url>`
- Create Render Cron Job:
  - schedule (recommended): `*/15 * * * *`
  - command:
    - `curl -fsS "https://<domain>/api/jobs/publish-scheduled?key=$CRON_PUBLISH_SECRET"`
- Validate once manually:
  - open `https://<domain>/api/jobs/publish-scheduled?key=<CRON_PUBLISH_SECRET>`
  - confirm `success: true`

## 8. GitHub Actions scheduler (Render free plan / 代替)
- workflow:
  - `.github/workflows/publish-scheduled.yml`
- GitHub Secrets:
  - `RENDER_PUBLISH_URL=https://<domain>/api/jobs/publish-scheduled?key=<CRON_PUBLISH_SECRET>`
  - optional: `SLACK_WEBHOOK_URL=<slack-webhook-url>`
- schedule:
  - `*/15 * * * *`
- manual verify:
  - GitHub Actions -> `Publish Scheduled Posts` -> `Run workflow`
  - latest run status = success
