# Repository Layer (Day1 v1-alpha)

現段階では既存サービス変更を最小化するため、`lib/store/repository.ts` が
`mock JSON` と `Prisma` の状態読み書きを切り替える「暫定 repository」として動作します。

次段階で以下へ分割予定:
- `server/repositories/offers.repository.ts`
- `server/repositories/posts.repository.ts`
- `server/repositories/dm-rules.repository.ts`
- `server/repositories/redirects.repository.ts`
- `server/repositories/analytics.repository.ts`

理由:
- 現在の Prisma 実装は「全状態ロード/全状態同期」のため、実運用では非効率
- v1 で entity 単位の CRUD に分割して本番向けに最適化する
