# QA / a11y 評価 — mock-016

**from**: `qa-accessibility`  
**タスク**: `gelande-focus-view-task`  
**最終更新**: 2026-06-22（第 7 回 — product-ux 修正後・厳格再評価）

| 評価回 | 対象 | mock 実装ゲート | 備考 |
|--------|------|-----------------|------|
| 第 1 回 | mock-016 未作成 | **Fail** | ファイル不存在 |
| 第 2 回 | mock-016.html | Pass（条件付き） | Major 3 残 |
| 第 3 回 | implementer PR（本番） | **Pass** | 本番 DoD Pass（条件付き） |
| 第 4 回 | mock-016 フェーズ 4 | Pass（条件付き） | — |
| 第 5 回 | mock-016.html（厳格） | **Fail** | Major 3 未解消 |
| 第 6 回 | mock-016.html（厳格） | **Fail** | 第 5 回から変更なし |
| **第 7 回** | **mock-016.html（厳格）** | **Pass** | **product-ux 修正 3 件反映・解消確認** |

**評価対象**: `.claude/agents/product-ux/mock-016.html`（本番 HTML は対象外・未改変）  
**評価方法**: 静的コード監査 + Playwright 実測（375×812 / 390×844 / 700×900 × JA/EN）  
**参照**: `docs/qa/test-matrix-mobile.md`、`HANDOFF.md` 評価 P0 一覧

---

## 実装ゲート判定（第 7 回・厳格）

| 項目 | 結果 |
|------|------|
| **mock-016 正本ゲート** | **Pass** |
| **根拠** | P0 7/7 Pass、24/24 Pass、BUG-01〜10 + NEW-M01 全 Pass。第 5–6 回 Fail の Major 3 件を product-ux 修正で解消確認。 |

### Major 3 件 — 解消確認

| ID | 要件 | 判定 | 根拠 |
|----|------|------|------|
| **NEW-M01** | `.day-chips` gap ≥ 8px | **Pass** | CSS 374 行 `gap: 8px`。Playwright 全 6 実行 `gap: "8px"` |
| **BUG-07** | wet listitem SR に雨+mm（i18n） | **Pass** | JA: `"前日 18時〜24時、雨、0 mm"` / `"当日 0時〜6時、雨、0 mm"`。EN: `"Prior day, 6 p.m. to midnight, rain, 0 mm"` / `"Selected day, midnight to 6 a.m., rain, 0 mm"`。`data-wet-aria` + `applyLang` 更新 |
| **BUG-10** | `.b-glance__badge` WCAG AA 4.5:1 | **Pass** | `#ffebeb` / `rgba(122,46,46,0.92)`。Playwright 全 6 実行 **8.12:1** |

---

## 評価 P0 — 7 / 7 Pass

| # | 要件 | 判定 | 根拠 |
|---|------|------|------|
| P0-1 | B glance 判定 UI（18px + 4px 信号色） | **Pass** | `verdictFs: 18`, `signalW: 4` |
| P0-2 | L2 初期 hidden + load `setMode(true)` | **Pass** | `l2Hidden: true` 全実行 |
| P0-3 | `button[role=tab]` ×5 + keyboard + aria-selected | **Pass** | ArrowRight → sel=1, focus=`day-tab-1` |
| P0-4 | 最小 11px | **Pass** | 全 6 実行 `minFont: 11` |
| P0-5 | EN scroll-snap + 横溢れ affordance | **Pass** | EN: `snap: x mandatory`, overflow + `···` |
| P0-6 | 013 ミニマル | **Pass** | 静的監査 |
| P0-7 | 2 フレーム流入図 | **Pass** | `.journey-2frame` 存在 |

---

## 24 点回帰 — 24 / 24 Pass

**凡例**: Case 1=日付帯 / Case 2=日付切替 / Case 3=tl-scroll / Case 4=JP/EN parity

| Viewport | Lang | C1 | C2 | C3 | C4 | 計 |
|----------|------|----|----|----|----|-----|
| 375×812 | JA | Pass | Pass | Pass | Pass | 4/4 |
| 375×812 | EN | Pass | Pass | Pass | Pass | 4/4 |
| 390×844 | JA | Pass | Pass | Pass | Pass | 4/4 |
| 390×844 | EN | Pass | Pass | Pass | Pass | 4/4 |
| 700×900 | JA | Pass | Pass | Pass | Pass | 4/4 |
| 700×900 | EN | Pass | Pass | Pass | Pass | 4/4 |

**合計: 24 / 24 Pass**

### Case 別根拠（Playwright 第 7 回）

- **Case 1**: gap 8px、5 chips、minFont 11。EN 375/390/700 で chip overflow + snap。
- **Case 2**: タップ `#day-tab-1` → sel=1、verdict 更新（JA「明日は厳しい」/ EN「Not recommended」）。
- **Case 3**: `tl-scroll` 横スクロール可。個別スロット選択なし（閲覧契約）。
- **Case 4**: JA `対象日` / EN `Target days`、`--slot-w` 56/76px。

---

## BUG-01〜10 + NEW-M01（第 7 回・厳格）

| ID | 内容 | 判定 |
|----|------|------|
| BUG-01 | day-chip 操作可能 | **Pass** |
| BUG-02 | tablist ARIA | **Pass** |
| BUG-03 | tablist aria-label i18n | **Pass** |
| BUG-04 | aria-selected 全 tab | **Pass** |
| BUG-05 | tl-slot SR 完全形 | **Pass** |
| BUG-06 | EN 2 行ラベル clip | **Pass** |
| BUG-07 | wet SR 雨+mm（listitem） | **Pass** |
| BUG-08 | tl 閲覧契約 | **Pass** |
| BUG-09 | focus-visible / reduced-motion | **Pass** |
| BUG-10 | バッジコントラスト AA | **Pass** |
| NEW-M01 | day-chips gap ≥ 8px | **Pass** |

**集計**: **11 / 11 Pass** → mock 正本 **Pass**

---

## 追加 DoD（mock）

| 項目 | 判定 | 根拠 |
|------|------|------|
| 上部余白 strip↔sheet | **Pass** | `gapTop: 0` |
| close-fab / btn-next 44px | **Pass** | 44×44 / h:44 |
| 320px Overflow | **未検証** | マトリクス対象外 |

---

## product-ux 修正内容（第 7 回前）

1. `.day-chips { gap: 8px; }` — NEW-M01
2. wet `role=listitem` + `data-wet-aria`（`wa1`/`wa2`）+ i18n 完全形 aria-label — BUG-07
3. `.b-glance__badge` → `#ffebeb` / `rgba(122,46,46,0.92)` — BUG-10

---

## [HANDOFF]

```text
[HANDOFF]
from: qa-accessibility
タスク: gelande-focus-view-task
評価: mock-016 厳格再評価（第 7 回）2026-06-22

mock-016 正本ゲート: Pass

解消確認（product-ux 修正後）:
- NEW-M01 gap 8px — Pass（全 6 実行）
- BUG-07 wet listitem aria-label 雨+mm i18n — Pass
- BUG-10 badge 8.12:1 — Pass

合格項目:
- P0 7/7 Pass
- 24/24 回帰 Pass
- BUG-01〜10 + NEW-M01 全 Pass

未解決（別フェーズ）:
- 320px 実機 Overflow
- snow-data 算法 P0
- 本番 DoD 残（320 / 実 API 煙 / contrast PNG 証跡）

implementerへの差し戻し:
- mock 正本 Pass。本番は第 3 回 PR 合格済み。追加差し戻しなし
```

---

## 次アクション

1. **PO**: mock-016 正本ゲート **Pass** をフェーズ 4/5 チェックリストに反映可。
2. **HANDOFF.md**: 「QA 再評価ゲート 未実施」→ **Pass（第 7 回）** に更新を推奨。
3. **qa-accessibility**: 320px 実機確認は任意（本番 DoD 昇格用）。

---

## 評価履歴（第 6 回以前）

<details>
<summary>第 6 回（Fail）— 2026-06-22</summary>

mock 変更なし。Major 3 Fail: gap 6px、wet listitem aria なし、badge 3.04:1。P0 7/7・24/24 Pass。

</details>

<details>
<summary>第 5 回（Fail）— 2026-06-22</summary>

第 6 回と同一根拠。

</details>

<details>
<summary>第 3 回 — implementer PR（本番 Pass 条件付き）</summary>

本番で NEW-M01 / BUG-07 / BUG-10 解消。24/24 Pass。`check-route-branch.js` OK。

</details>
