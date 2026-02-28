# Insta Affiliate Auto Funnel (IAAF) - MVP

Instagram比較アフィリエイト運用の自動化ツール（MVP）です。  
MVPでは **ローカルで動くことを優先** し、Instagram/AI/DBの一部を mock で実装しています。

## 実装計画（MVP優先）
1. Next.js App Router + TypeScript + Tailwind の単一リポジトリ構成
2. Prisma schema / migration を先行作成（将来PostgreSQL本番移行用）
3. MVP実行時は `data/mock-db.json` を使うリポジトリでローカル動作
4. API/画面/モックWebhook/短縮URL/簡易分析を実装
5. v1/v2拡張ポイントを docs に整理

## 技術スタック
- Frontend/Backend: Next.js (App Router) + TypeScript
- UI: Tailwind CSS
- Validation: Zod
- DB Schema: Prisma + PostgreSQL (MVP runtimeは mock JSON DB)
- Test: Vitest

## セットアップ手順
1. 依存関係をインストール
```bash
npm install
```
2. 環境変数を作成
```bash
cp .env.example .env
```
3. 開発サーバー起動
```bash
npm run dev
```

## DB起動方法（PostgreSQL / Docker）
Prisma検証用にPostgreSQLを起動する場合:

```bash
docker compose up -d
```

## Prisma migrate / seed 手順
MVP runtime は mock DB を使うため Prismaは必須ではありませんが、将来移行の確認用に実行できます。

```bash
npm run prisma:generate
npm run prisma:migrate
```

mock seed（画面/API用の初期データ投入）:

```bash
npm run prisma:seed
```

`scripts/seed.ts` は `data/mock-db.json` を生成/更新します。

## 開発サーバー起動方法
```bash
npm run dev
```
- Dashboard: `http://localhost:3000/`
- Offers: `http://localhost:3000/offers`
- Content: `http://localhost:3000/content`
- Posts: `http://localhost:3000/posts`
- DM Rules: `http://localhost:3000/dm-rules`
- Analytics: `http://localhost:3000/analytics`

## mock webhook テスト方法
例: DM受信 webhook

```bash
curl -X POST http://localhost:3000/api/webhooks/instagram/messages ^
  -H "Content-Type: application/json" ^
  -d "{\"instagramUserId\":\"user_1\",\"messageText\":\"回線比較ください\"}"
```

応答で `matched` と mock返信内容が返り、`dmConversations` に保存されます。

## v1-alpha 追加（実運用化の土台）
- `ENABLE_MOCK_MODE=false` で Prisma/PostgreSQL に切替可能（Day1暫定実装）
- `ENABLE_REAL_INSTAGRAM_PUBLISH=true` で Meta Graph API 投稿処理を有効化（環境変数要設定）
- `ENABLE_REAL_INSTAGRAM_DM=true` で Instagram Messaging API 送信を有効化（環境変数要設定）
- `POST /api/jobs/publish-scheduled` で予約投稿一括実行（cron/n8n想定）
- `ENABLE_AUTH=true` で簡易認証を有効化（`/login`）

注意:
- 実投稿/実DMを有効化しても、ローカル `APP_BASE_URL=http://localhost:3000` のままでは Meta から参照不能なメディアURLになります。
- 実運用では公開URL（HTTPS）を持つ環境へ配置してください。

## OpenAI APIキー未設定時の挙動
- `OPENAI_API_KEY` 未設定、または `ENABLE_MOCK_MODE=true` の場合
  - `lib/ai/client.ts` は mock 応答を返します
  - コンテンツ生成/コンプライアンスチェックの開発がローカルで可能

## Meta API差し替えポイント（本番連携）
- 投稿公開: `server/modules/posts/publisher.ts`
- DM送信: `server/modules/webhooks/service.ts` / `server/modules/dm-rules/service.ts`
- Webhook署名検証: `app/api/webhooks/instagram/*/route.ts` に追加

## 主要機能（MVP）
- 案件マスタ管理（一覧/作成/CSV取込/一時停止）
- 投稿案AI生成（mock/抽象化済み）
- カルーセル簡易画像生成（SVG）
- 投稿予約/公開（mock Instagram publisher）
- DMキーワード自動返信ルール + mock webhook
- 短縮URLリダイレクト + クリック計測
- 簡易ダッシュボード / 分析画面
- NG表現チェック（断定表現 / PR表記 / 重複警告）

## テスト
```bash
npm test
```

## 自動運用（GitHub Actions 15分実行）
1. 本番環境に設定
- `CRON_PUBLISH_SECRET=<long-random-string>`
- （任意）`OPS_ALERT_WEBHOOK_URL=<Slack/Discord等のWebhook URL>`

2. GitHub Secrets に設定
- `RENDER_PUBLISH_URL=https://<your-domain>/api/jobs/publish-scheduled?key=<CRON_PUBLISH_SECRET>`
- （任意）`SLACK_WEBHOOK_URL=<your-slack-webhook-url>`

3. ワークフロー有効化
- `.github/workflows/publish-scheduled.yml`
- schedule: `*/15 * * * *`
- 手動確認: Actions から `Publish Scheduled Posts` を `Run workflow`

4. 成功条件
- レスポンスJSONの `success=true`
- 失敗時は workflow が `failed` になり、`SLACK_WEBHOOK_URL` 設定時は通知送信

実装済み:
- DM rule キーワードマッチ
- 短縮URLクリック計測
- NG表現チェック
- content generate 応答バリデーション
- offers CSV取込（基本ケース）

## ドキュメント
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `docs/TODO-v1-v2.md`
- `docs/RUNBOOK.md`
- `docs/csv-samples/`
