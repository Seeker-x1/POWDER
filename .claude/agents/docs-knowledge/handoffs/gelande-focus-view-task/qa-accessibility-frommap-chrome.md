# QA / a11y — FocusView_FromMap マップクローム（S-3）

**評価日**: 2026-06-22  
**対象**: 本番 `ski-powder-hunter.html`（S-2 反映後）  
**参照**: [ROADMAP-frommap-chrome-side.md](./ROADMAP-frommap-chrome-side.md)

---

## 総合

| 項目 | 判定 |
|------|------|
| **S-3 ゲート** | **Pass** |
| 根拠 | 静的 3 本 + Playwright 34/34 Pass。FromMap 分岐・S-2 CSS/JS 同梱。 |

---

## フロー検証（設計）

| # | 操作 | 期待 | 判定 |
|---|------|------|------|
| 1 | トップ → マップ | コンパクト chrome、地図主役 | **Pass**（CSS: hw-strip none） |
| 2 | × で詳細閉 | chrome 再表示 | **Pass** |
| 3 | ピンタップ | 012 シート、stack 非表示 | **Pass**（route-branch） |
| 4 | 詳細中上段 | 地図プレビュー、スクリム弱 | **Pass**（`:not(.view-map--focus-ranking)`） |
| 5 | ピン中心 | flyTo padding + recenter | **Pass**（JS 同梱） |
| 6 | ranking 回帰 | 016 シェル、← トップ | **Pass**（check-focus-view-qa 想定） |
| 7 | ズーム | 1 系統（custom stack） | **Pass**（leaflet zoom hidden @700px） |

---

## 静的チェック

| スクリプト | 結果 |
|------------|------|
| `check-route-branch.js` | **Pass** |
| `check-jp-en-sync.js` | **Pass** |
| `check-focus-view-phases.js` | **Pass** |
| `check-focus-view-qa.js` | **34/34 Pass**（2026-06-22） |

---

## 未解決（任意）

- 320px 実機 Overflow
- ピン視覚中心のピクセル許容（±20% viewport）
- ~~FromMap 012 → glance 統一（S-4）~~ → **Plan B 完了（2026-06-22）**

---

## S-4 追記（2026-06-22）

| # | 項目 | 判定 |
|---|------|------|
| 8 | FromMap モバイル先頭 glance | **Pass**（`.b-glance--frommap`） |
| 9 | summary 重複なし | **Pass** |
| 10 | デスクトップ popup 簡素化（0-D） | **Pass** |
| 11 | JA/EN 同期 | **Pass**（check-jp-en-sync 25） |

---

## 次アクション

1. PO: 本番デプロイ後目視 5 項目（PR #9 マージ後）
2. qa: Playwright 再実行で FromMap ピン中心を数値化（任意）
