# Handoff: domain-typo-fix / implementer

## 実施内容（2026-07-19）

誤字ドメイン `japowserch.com` → 正 `japowsearch.com` を SEO/公開設定系のみ修正。コミットなし。

### 変更ファイル
- `CNAME` — `www.japowsearch.com`
- `robots.txt` — Sitemap / コメントを正ドメインへ
- `sitemap.xml` — 全 `<loc>` を正ドメインへ + JA 本体 `ski-powder-hunter.html` 追加
- `docs/REDDIT-PUBLISH.md` — 公開 URL 4 箇所を正ドメインへ

### 意図的残存
- `guides.japowserch.com`（`data/resort-guides.json` baseUrl、両本番 HTML のフォールバック）は未変更

### ユーザー側フォロー
- 旧ドメイン 301、GSC プロパティ整理、DNS（guides サブドメインは現状維持）
