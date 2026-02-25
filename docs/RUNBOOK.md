# RUNBOOK (v1-alpha)

## 1. 投稿が失敗したとき
- `GET /api/posts` で `status=failed` と `errorMessage` を確認
- Meta API有効時:
  - `META_PAGE_ACCESS_TOKEN` の期限/権限確認
  - `META_IG_USER_ID` が対象アカウントと一致しているか確認
- `POST /api/posts/:id/retry` -> `POST /api/posts/:id/publish-now`

## 2. 予約投稿が動かないとき
- `POST /api/jobs/publish-scheduled` を手動実行して応答確認
- `scheduledAt` が UTC で未来/過去になっていないか確認
- cron/n8n 実行ログを確認

## 3. DM webhook が動かないとき
- `POST /api/webhooks/instagram/messages` に mock payload で疎通確認
- 本番時は `GET /api/webhooks/instagram/messages` の verify token 設定確認
- `META_APP_SECRET` 設定時、署名不一致なら 401 になる

## 4. 認証が必要になったとき
- `.env` で `ENABLE_AUTH=true`
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET` を設定
- `/login` でログイン

## 5. mock / real 切替
- `ENABLE_MOCK_MODE=true`: JSON DB + mock中心（ローカル）
- `ENABLE_MOCK_MODE=false`: Prisma/PostgreSQL（Day1暫定実装）
- `ENABLE_REAL_INSTAGRAM_PUBLISH=true`: 実投稿API使用
- `ENABLE_REAL_INSTAGRAM_DM=true`: 実DM送信API使用
