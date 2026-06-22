# サイドロードマップ — FocusView_FromMap ＋ マップクローム（S-1〜S-4）

**位置づけ**: メイン [ROADMAP-mock015-by-agent.md](./ROADMAP-mock015-by-agent.md) は **FocusView_FromRanking（mock-016）** 専用。本書は **FromMap・マップクローム** の並走サイド。

**最終更新**: 2026-06-22（**フェーズ 6 クローズ**）

---

## 残フェーズ一覧（統合）

| ID | 内容 | 状態 |
|----|------|------|
| 0-A〜0-C | 日付チップ本番・affordance | ✅ |
| 0-D | デスクトップ Leaflet popup 簡素化 | ✅ 2026-06-22 |
| 1 | docs 正本統一 | ✅ |
| 2 | mock-016 | ✅ |
| 3 | snow-data glance 契約 | ✅ [snow-data.md](./snow-data.md) v1 |
| 4 | QA mock-016 第7回 | ✅ Pass |
| 5-1〜5-4 | ranking FocusView | ✅ |
| 5-5 | ← トップ（ranking） | ✅ |
| 5-6 | EN / a11y | ✅ |
| **S-1** | mock FromMap 注釈 | ✅ mock-016 |
| **S-2** | 本番 FromMap クローム | ✅ 2026-06-22 |
| **S-3** | QA FromMap 煙 | ✅ [qa-accessibility-frommap-chrome.md](./qa-accessibility-frommap-chrome.md) |
| **S-4** | FromMap テンプレ刷新 | ✅ Plan B（shared glance + 012 帯） |
| 6 | クローズ | ✅ 2026-06-22 |

---

## S-2 実装サマリ（implementer）

1. **マップ閲覧**: `hw-strip` 非表示、chrome 圧縮、`leaflet-control-zoom` 非表示（モバイル）
2. **ピン詳細**: スクリム `.32`、 `flyTo` + `recenterMapForFromMapDetail` でピン上段中心
3. **ranking 016**: `.view-map--focus-ranking` 非変更

**当たり**: `getMobileMapSheetPaddingPx`, `recenterMapForFromMapDetail`, `openFocusFromMap`

---

## S-4 実装サマリ（Plan B）

1. **`buildFromMapGlanceHtml`**: `focus-view-ranking.js` — ranking と同一 `computeGlanceState`
2. **モバイル FromMap シート**: glance + dayStrip + hourly（summary / temp chart 削除）
3. **CTA のみ**: pw ブロック・nearby・feedback は FromMap モバイルでは非表示
4. **0-D**: デスクトップ popup — 気温チャート削除、nearby/feedback/partner はモバイルのみ
5. **CSS**: `.b-glance--frommap`（JA/EN 同期）

---

## 実行順（完了）

```
5-5 ✅ → S-1 ✅ → S-2 ✅ → S-3 ✅ → 3 snow-data ✅ → S-4 ✅ → 0-D ✅ → 6 ✅
```

---

## デプロイ

- 本番: **www.japowserch.com** ← `momentum-create/POWDER` main
- PR **#9**（Seeker-x1 → momentum-create）: マージ待ち — upstream 書込権限が必要

---

## 関連

- [HANDOFF.md](./HANDOFF.md)
- [architecture/touch-points.md](../../../architecture/touch-points.md)
- [screen-flow.md](../../../product-ux/screen-flow.md)
- [boundary-tests.md](../../../snow-data/boundary-tests.md)
