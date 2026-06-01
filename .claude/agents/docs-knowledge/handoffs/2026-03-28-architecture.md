# [HANDOFF] 2026-03-28 — from: architecture

## 会話の要約

- ユーザーは **architecture** 役割として、`ski-powder-hunter*.html` を**読み取り専用**で調査し、**`touch-points.md` 更新想定**の地図を出すよう依頼した。
- 対象：**モーダル／ボトムシート**、**タイムライン行相当 UI**、**フォントサイズを決めるクラス／メディアクエリ**、実装者が迷わない**索引**。
- エージェントは本番 HTML を grep／範囲読みし、チャットに **貼り付け用の Markdown 全文**を返した。ワークスペースルールにより **`touch-points.md` や本番 HTML へのツール書き込みは未実施**（ユーザーが「ファイルに更新して」と言うまでの扱い）。

## 成果物（パス・参照）

| 内容 | パス / 状態 |
|------|-------------|
| 調査対象（本番） | `ski-powder-hunter.html`, `ski-powder-hunter-en.html`（構造はほぼ同一） |
| 更新先（想定） | `.claude/agents/architecture/touch-points.md`（現状プレースホルダのみ） |
| 今回の詳細メモ | **直前ターンのチャット応答全文**（モーダル一覧表、mermaid フロー、タイムライン対応表、フォント階層、関数索引） |

## 技術メモ（超要約）

- **オーバーレイ／シート**: `#top-region-modal`（z-index 2000）、`#map-search-overlay` + `is-open`（1200）、モバイル地図 `#map-detail-sheet` / `#map-detail-scrim` + `map-detail-sheet--open`（985 付近）、Leaflet `.leaflet-popup-*`。
- **タイムライン相当**: クラス名 `timeline` はほぼ無し。`#tw-strip-grid` + `.tw-strip-cell`（`renderTopWeeklyStrip`）、`.popup-hourly-strip`（`selectResort` 内 `hourlyHtml`）、`.hourly-snow-*`（一覧カード）、`getPrecipTimeline` は **定義のみで未参照**。
- **フォント**: `:root` 色トークン、`@media (max-width:700px)` の mobile-typography-tokens、地図ポップアップ用の太い `@media` ブロック（シート内 `.popup-name` 16px 等）、一部 **インライン `font-size`**。

## 次セッション向け

1. **`touch-points.md` をリポジトリに反映**するなら、ユーザーから **「touch-points.md を更新して」** 等の明示が必要（`no-file-edits` 整合）。
2. 本番 HTML の編集は **`implementer` ゲート**（`implementer-only-production-code.mdc`）に従う。

## メタ

- 保存日: 2026-03-28  
- `from`: `architecture`（本スレッドの役割・調査由来の記録）
