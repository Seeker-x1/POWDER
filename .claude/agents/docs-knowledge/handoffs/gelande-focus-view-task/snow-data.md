# snow-data — FocusView B glance データ契約（フェーズ 3）

**from**: snow-data  
**task**: gelande-focus-view-task  
**status**: v1（implementer 接続済 — S-4 Plan B）

---

## 1. 目的

「今日は厳しい / 滑走 OK」等の **1 秒判断（B glance）** を、気象 API → UI まで **再現可能な契約**として固定する。

**現状**: `scripts/focus-view-ranking.js` の `GLANCE_THRESHOLDS` + `computeGlanceState` に **v1 閾値を定数化**（2026-06-22）。FromMap は `buildFromMapGlanceHtml`（Plan B）。

---

## 2. 入力フィールド

| フィールド | ソース | 欠損時 |
|------------|--------|--------|
| `dayOffset` | 0〜4（今日〜+4日） | — |
| `snowCm` | `getSnowfallAdjusted(daily, resort, dayOffset)` | `0` |
| `priorCm` | `getPrevDayDisplayForResort(...).total` | 表示 `—` |
| `powderScore` | `calcPowderScore(daily, resort, dayOffset).score` | `50`（中立） |
| `rainRatio` | 当該日 24h: `sum(rain) / sum(snow+rain)` | `0`（雪主体） |

---

## 3. 判定式（暫定 → 正式化候補）

### 3.1 level（信号色）

```
rainLevel = 0
if totalMm > 0:
  if rainRatio > 0.7 → rainLevel = 2  // 雨優勢
  elif rainRatio > 0.3 → rainLevel = 1  // 雪＋雨

level = "go"
if score < 35 OR rainLevel >= 2 → level = "nogo"
else if score < 55 OR rainLevel >= 1 → level = "caution"
```

**要 product 合意**: 閾値 35/55/0.3/0.7 は **ランキング順位用 calcPowderScore と同一スケールでよいか**。

### 3.2 verdict（文言）

| level | JA | EN |
|-------|----|----|
| go | 滑走 OK | Good to go |
| caution | {dayRef}は注意 | Use caution |
| nogo | {dayRef}は厳しい | Not recommended |

`dayRef`: 今日/明日/明後日/+3日/+4日（EN: Today/Tomorrow/…）

### 3.3 detailHtml（第 2 行）

- JA: `当日 {today} cm · 前日 {prior} cm`
- EN: `Selected day {today} cm · Prior day {prior} cm`
- 小数: `.toFixed(1)`、`prior` 欠損は `—`

### 3.4 雨バッジ

| rainLevel | 表示 | hidden |
|-----------|------|--------|
| 0 | — | yes |
| 1 | 雪＋雨 / Snow + rain | no |
| 2 | 雨優勢 / Rain-dominant | no |

---

## 4. タイムライン（L3）データ契約

| キー | 用途 |
|------|------|
| `labelShort` | UI 1〜2 行（`18–24`, `0–6`） |
| `labelAria` | SR 完全形（日跨ぎは帯色＋ここ） |
| `band` | `prev` / `day` / `next` |
| wet 時 | aria に `雨`/`rain` + `{n} mm`（BUG-07） |

---

## 5. FromMap（012）との関係 — **方針メモ**

| 案 | 内容 | 推奨 |
|----|------|------|
| A | FromMap も glance 一行に寄せる（016 派生・012 廃止） | **中長期（S-4）** |
| B | 012 は L2 密度のまま、glance のみ共有 | **短期 — S-4 採用 ✅** |
| C | 経路ごとに完全別算法 | **非推奨**（ユーザー混乱） |

**推奨**: ~~S-4 着手前に~~ **Plan B 採用済** — FromMap モバイル先頭に shared glance、日付帯 + hourly は 012 維持。算法は `computeGlanceState` 1 関数。

---

## 6. 境界テスト

→ [boundary-tests.md](../../../snow-data/boundary-tests.md)（v1 記入済）

---

## 7. implementer への注意

- 閾値変更は **`focus-view-ranking.js` のみ**（HTML 直書き禁止）
- FromMap 012 への glance 接続は **S-4 ゲート後**
- ランキング TOP10 順位と glance verdict の **食い違い**は PO 確認事項

---

## 8. 次アクション

1. ~~PO: 閾値 35/55 の生活者語妥当性~~ → v1 暫定採用（変更時は `GLANCE_THRESHOLDS` のみ）
2. ~~product-ux: S-4 で FromMap テンプレ方針~~ → Plan B 完了
3. ~~implementer: 合意後定数化~~ → ✅ 2026-06-22
