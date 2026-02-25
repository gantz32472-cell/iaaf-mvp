# TODO (v1 / v2)

## v1 (実装予定)
- ABテスト（フック/CTA/DM返信文）
  - `generatedPosts` に `experimentId`, `variantKey` を追加
- 勝ちパターン抽出
  - クリック率/DM率/CV率でランキング
- リール台本生成
  - `format=reel` の台本テンプレ強化
- 投稿時間帯最適化
  - 時間帯別パフォーマンス集計 + 推奨枠算出

## v2 (実装予定)
- 案件停止/終了検知
  - ASP CSV/管理URL監視、status自動更新
- リンク死活監視
  - 404/不正リダイレクト検知とアラート
- FAQ自己更新
  - DMログから質問クラスタ抽出、返信候補更新
- 自動週次レポート
  - CSV/PDF/Slack連携

## 技術負債（MVP時点）
- Mock DB(JSON) から Prisma Repository へ段階移行
- 認証未実装
- UI編集フォームは JSON 操作中心（運用UI改善余地あり）
- CSV parser は簡易実装（大規模/複雑CSVは改善余地あり）
