# 触るべき関数・ブロック（本番索引）

**対象**: リポジトリ直下 `ski-powder-hunter.html` / `ski-powder-hunter-en.html`（構造はほぼ同一）。行番号は変動しうるため **関数名・ID で grep** すること。

詳細なタスク文脈（ゲレンデフォーカスビュー）: `.claude/agents/docs-knowledge/handoffs/gelande-focus-view-task/HANDOFF.md`

---

## リゾート詳細（地図ポップアップ / モバイルボトムシート）

| 内容 | 当たり |
|------|--------|
| HTML 組み立て | `selectResort(id, opts)` 内の `contentHtml` |
| モバイル表示 | `openDetailUi` → `#map-detail-sheet-body` に `innerHTML` |
| Leaflet（幅広） | `L.popup(...).setContent(contentHtml)` |
| 閉じる | `closeResortPopup()` |
| シート DOM | `#map-detail-sheet`, `#map-detail-scrim`, `#map-detail-sheet-body` |
| スタイル | `.leaflet-popup-*`, `.popup-*`, `@media (max-width:700px)` 内の `#map-detail-sheet` 周り |

---

## 日付・タブ

| 内容 | 当たり |
|------|--------|
| 選択中日（0〜6） | 変数 `targetDayOffset` |
| 変更入口 | `setTargetDayOffset(offset)` → `syncDateButtonsActive`, `renderTop10`, `renderList`, `refreshMarkers` |
| 地図シート内の日付 UI（現行） | `selectResort` 内 `dayStripHtml`（`.popup-day-strip--scroll`, `.popup-day-tab`） |

---

## 時間帯バー・タイムライン相当

| 内容 | 当たり |
|------|--------|
| 地図モバイル用セグメントバー | `selectResort` 内 `hourlyHtml`（`.popup-hourly-strip`, `.popup-hourly-bar`） |
| 一覧カードの時間別降雪 | `.hourly-snow-*` クラス群＋リスト描画テンプレート |
| TOP 週間帯 | `#tw-strip-grid`, `renderTopWeeklyStrip()` |
| 降水タイムライン配列（未配線） | `getPrecipTimeline(daily, dayOffset)` — 現状参照箇所なし |

---

## その他オーバーレイ

| 内容 | 当たり |
|------|--------|
| TOP エリアモーダル | `#top-region-modal`, `closeTopRegionModal` |
| 地図検索フルスクリーン | `#map-search-overlay`, `.is-open` |

---

## ゲレンデフォーカスビュー（FocusView_FromRanking）— 本番は **未実装・設計要**

- **正 UI（カレント）**: mock-015（`.claude/agents/product-ux/mock-015.html` の `.device-screen`）。制度は mock-011 / mock-013 系。**mock-012 型と同一 DOM に混在させない**（HANDOFF 参照）。段取り: `handoffs/gelande-focus-view-task/ROADMAP-mock015-by-agent.md`。
- **未決定**: 薄マップ帯＋シートのルートを **新規ラッパ**で持つか、既存 `#map-detail-sheet` を **経路別に差し替え**るか。
- **差し込み候補**: ランキング行タップ → 現状 `scrollToCard` 等。**`selectResort` 分岐**または別関数で `FocusView_FromRanking` 専用テンプレを載せる想定。

本節は implementer／product-ux で確定したら更新する。
