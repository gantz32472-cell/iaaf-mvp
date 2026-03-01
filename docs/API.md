# API Specification (MVP)

共通レスポンス形式:

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

## Offers

### `GET /api/offers`
- 案件一覧取得

### `POST /api/offers`
- body: `name, category, aspName, destinationUrl, referenceUrl?, targetPersona?, angles[], prLabelRequired, ngWords[], status?`

### `PATCH /api/offers/:id`
- 部分更新

### `POST /api/offers/import-csv`
- body:
```json
{ "csvText": "name,category,aspName,destinationUrl,...\n..." }
```
- 返却: `importedCount`, `errors[] (row付き)`

### `POST /api/offers/:id/pause`
- status を `paused` に変更

## Content generation

### `POST /api/content/generate`
- body:
```json
{
  "category": "internet",
  "targetPersona": "一人暮らし",
  "angles": ["料金", "速度"],
  "offerIds": ["uuid"],
  "format": "carousel",
  "objective": "dm"
}
```
- response: `hookCandidates[3], carouselPages[], scriptText, captionText, hashtags[], ctaKeyword, prNotationText, generatedPostId`
- 備考: MVPでは生成結果を `generatedPosts` draft として同時保存

### `POST /api/content/ng-check`
- body: `text, prNotationText?, offerIds?, hookText?, captionText?`
- response: `level(pass|warn|fail), reasons[], suggestedFixes[]`

### `POST /api/content/render-carousel`
- body: `pages[{title, body}]`
- response: `mediaAssetPath`
- MVPは簡易SVG画像を生成

## Posts

### `GET /api/posts`
- 投稿一覧取得

### `POST /api/posts/schedule`
- body: `{ "generatedPostId":"uuid", "scheduledAt":"ISO8601" }`

### `POST /api/posts/:id/publish-now`
- mock投稿実行、`status=posted` 更新

### `POST /api/posts/:id/retry`
- `failed/draft` 再実行用に `status=draft` 戻し

### `POST /api/posts/:id/duplicate` (追加)
- MVP UI操作用の補助API

## DM Rules

### `GET /api/dm-rules`
- ルール一覧

### `POST /api/dm-rules`
- ルール作成

### `PATCH /api/dm-rules/:id`
- ルール更新

### `POST /api/dm-rules/test-match`
- body: `{ "messageText": "wifi 比較ください" }`
- response: `matched`

## Webhooks / Redirect

### `POST /api/webhooks/instagram/messages`
- mock webhook
- body: `{ "instagramUserId":"...", "messageText":"...", "generatedPostId?":"uuid" }`
- 処理: キーワード照合 -> `dmConversations` 保存 -> mock返信結果返却
- 本番想定: Meta Webhook payload (`entry[].messaging[]`) も受け付け
- `GET` は Meta webhook verify (`hub.challenge`) に対応

### `POST /api/webhooks/instagram/comments`
- mock webhook (ログ用)
- `GET` は Meta webhook verify に対応

### `GET /r/:shortCode`
- 短縮URL解決 -> `clickEvents` 保存 -> 302 redirect
- 付与UTM: `utm_source`, `utm_medium`, `utm_campaign`

## Analytics

### `GET /api/analytics/summary`
- `todayPosts, todayDms, todayClicks, estimatedCv, errorCount, ranking[]`

### `GET /api/analytics/errors?limit=100`
- 運用エラー一覧（投稿失敗、不正scheduledAt）
- response: `total, rows[]`

### `GET /api/analytics/posts`
- 投稿別 DM/クリック集計

### `GET /api/analytics/keywords`
- キーワード別 DM/クリック集計

### `GET /api/analytics/offers`
- 案件別 DM/クリック/CV/売上 集計

### `POST /api/analytics/conversions/import`
- body: `{ "csvText": "date,offerId,cvCount,...\n..." }`
- CSV取込（行番号付きエラー返却）

## Jobs (v1-alpha)

### `POST /api/jobs/auto-generate-schedule`
- 次の投稿スロット（JST）に向けて `draft` 自動生成 + `scheduled` 自動登録
- `CRON_PUBLISH_SECRET` が設定されている場合は `?key=` か `x-cron-key` が必須
- スロット: `AUTO_POST_SLOTS_JST`（例 `09:00,21:00`）
- 目的: `AUTO_POST_OBJECTIVE`（`dm` / `click`）

### `POST /api/jobs/publish-scheduled`
- `scheduledAt <= now` の投稿を一括実行
- cron / n8n からの定期実行を想定
- `CRON_PUBLISH_SECRET` が設定されている場合は `?key=` か `x-cron-key` が必須
- `OPS_ALERT_WEBHOOK_URL` が設定され、失敗/不正scheduledAtがある場合はWebhook通知

## Auth (v1-alpha, minimal)

### `POST /api/auth/login`
- JSON or form POST
- Cookie (`iaaf_session`) を発行

### `POST /api/auth/logout`
- セッションクッキー削除
