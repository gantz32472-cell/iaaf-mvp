# IAAF MVP Architecture

## 方針
- MVPは `Next.js App Router` 単一リポジトリ構成
- APIは `app/api/*`、業務ロジックは `server/modules/*` に分離
- データアクセスは MVPでは `data/mock-db.json` を利用（`ENABLE_MOCK_MODE=true`）
- Prisma schema/migration は先行実装し、v1で PostgreSQL 実運用へ移行しやすくする

## ディレクトリ責務
- `app/`: 画面とAPI Routes
- `components/`: UI部品
- `lib/`: 共通基盤（AIクライアント、APIレスポンス、バリデーション、ユーティリティ）
- `server/modules/`: ドメイン単位のサービス
- `prisma/`: DBスキーマ・マイグレーション
- `scripts/`: seed/batch
- `docs/`: API仕様・運用メモ・将来TODO

## モック/本番差し替えポイント
- AI生成: `lib/ai/client.ts`
  - `OPENAI_API_KEY` 未設定時は mock 応答
  - 本番時は OpenAI API 呼び出しに置換
- Instagram投稿: `server/modules/posts/publisher.ts`
  - `InstagramPublisher` interface を `MetaGraphInstagramPublisher` に差し替え
- DM返信送信: `server/modules/webhooks/service.ts` -> `server/modules/dm-rules/service.ts`
  - 現在は「送信したことにする」ログのみ
  - 本番時は Instagram Messaging API 呼び出し追加
- DBアクセス: 現在 `lib/store/mock-db.ts`
  - v1で Prisma Repository 実装を追加し、`ENABLE_MOCK_MODE` で切替

## データフロー（MVP）
1. 案件作成/CSV取込 -> `offers`
2. コンテンツ生成API -> AI mock -> `generatedPosts` draft 保存
3. NGチェック -> 断定表現/PR/重複投稿の簡易判定
4. 投稿予約/公開 -> `generatedPosts` status 更新 + mock Instagram media ID
5. DM webhook -> キーワード照合 -> `dmConversations` 保存 + mock返信
6. 短縮URL -> `clickEvents` 保存 + リダイレクト
7. ダッシュボード/分析 -> 集計API/画面表示

## v1/v2に向けた拡張設計
- `generatedPosts` にABテスト属性を追加しやすい（variant/group）
- `analytics` モジュールに勝ちパターン抽出ロジック追加余地
- `webhooks`/`monitoring` モジュールを分割して案件停止検知やリンク監視を追加
- `jobs` レイヤー追加で cron/n8n/queue 連携へ拡張
