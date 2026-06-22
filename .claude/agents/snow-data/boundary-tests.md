# 境界テストケース — glance（`computeGlanceState`）

**契約**: [snow-data.md](../docs-knowledge/handoffs/gelande-focus-view-task/snow-data.md)  
**実装**: `scripts/focus-view-ranking.js` — `GLANCE_THRESHOLDS`  
**最終更新**: 2026-06-22

---

## 閾値定数

| キー | 値 | 意味 |
|------|-----|------|
| `SCORE_NOGO` | 35 | 未満 → nogo（雨優勢と OR） |
| `SCORE_CAUTION` | 55 | 未満 → caution（雪＋雨と OR） |
| `RAIN_WET` | 0.3 | 超 → rainLevel 1 |
| `RAIN_DOMINANT` | 0.7 | 超 → rainLevel 2 |

---

## ケース一覧

| # | 入力 | 期待 level | 期待 rain バッジ | 備考 |
|---|------|------------|------------------|------|
| 1 | daily 欠損 / null | — (null) | — | glance 非表示 |
| 2 | score=50, rainRatio=0 | go | hidden | 中立・雪主体 |
| 3 | score=34, rainRatio=0 | nogo | hidden | SCORE_NOGO 境界下 |
| 4 | score=35, rainRatio=0 | caution | hidden | SCORE_NOGO 境界上 |
| 5 | score=54, rainRatio=0 | caution | hidden | SCORE_CAUTION 境界下 |
| 6 | score=55, rainRatio=0 | go | hidden | SCORE_CAUTION 境界上 |
| 7 | score=60, rainRatio=0.29 | go | hidden | RAIN_WET 境界下 |
| 8 | score=60, rainRatio=0.31 | caution | 雪＋雨 | RAIN_WET 境界上 |
| 9 | score=60, rainRatio=0.71 | nogo | 雨優勢 | RAIN_DOMINANT 超 |
| 10 | score=40, rainRatio=0 | nogo | hidden | 低 score のみ |
| 11 | score=70, rainRatio=0.8 | nogo | 雨優勢 | 雨優勢が score より優先 |
| 12 | priorCm=null | — | — | detailHtml に `—` |
| 13 | daily `"loading"` | — | — | FromMap: glance 空、ranking: wait UI |
| 14 | dayOffset=2 | caution 文言に「明後日」 | — | dayRef ローカライズ |

---

## 手動確認（本番）

1. **Ranking 016**: 日付チップ切替で `.b-glance` level / verdict が変わる  
2. **FromMap 012**: モバイルシート先頭に `.b-glance--frommap`（summary 重複なし）  
3. **Desktop popup**: 気温チャートなし、nearby/feedback はモバイルのみ  
4. **JA/EN**: `check-jp-en-sync.js` 25 parity Pass

---

## 自動回帰

```powershell
node scripts/checks/check-route-branch.js
node scripts/checks/check-jp-en-sync.js
node scripts/checks/check-focus-view-phases.js
node scripts/checks/check-focus-view-qa.js http://127.0.0.1:4173
```

期待: 静的 3 本 OK + QA **34/34 OK**（2026-06-22 再実行済）

---

## 積雪・降雪精度検証（Phase 8 — `validate-snow-accuracy.js`）

**契約**: [IMPLEMENTATION_ORDER_SNOW_ACCURACY.md](../../../docs/IMPLEMENTATION_ORDER_SNOW_ACCURACY.md) Phase 8  
**実装**: `scripts/validate-snow-accuracy.js`  
**出力**: `reports/snow-accuracy-YYYY-MM-DD.json`

### 比較ロジック

| 項目 | ソース |
|------|--------|
| 実績（actual） | `data/jma-snow.json` → `snowfall_24h_cm` |
| 予報（forecast） | `data/weather.json` → `snowfall_sum[0]`（8日分のとき index 0 = 前日）× `elevationFactor` |
| 誤差 | `forecast_cm - actual_cm`、レポートは `abs_error_cm` で MAE 集計 |

`weather.json` が 7日分のみ（`snowfall_sum.length <= 7`）の場合、前日予報スロットが無いため **比較対象外**（`skipped_no_forecast`）。

---

### ケース一覧

| # | 条件 | 期待 | 備考 |
|---|------|------|------|
| S1 | JMA `snowfall_24h_cm` あり + weather 8日分 | `entries` に含まれる | 標準比較パス |
| S2 | JMA エントリなし | `skipped_no_jma` 増加 | 気象庁なしゲレンデ |
| S3 | JMA あり、`snowfall_24h_cm` が null | `skipped_no_actual` | 観測欠損 |
| S4 | weather 欠損 / `snowfall_sum` 7日以下 | `skipped_no_forecast` | 前日予報スロットなし |
| S5 | 前日 hourly 24本欠損（`jma-prevday-hourly`） | HTML: 前日チップ非表示 | 検証スクリプト対象外（24h JMA vs 日次予報） |
| S6 | dayOffset=0、JMA メッシュ推定あり | HTML: メッシュ合成降雪表示 | `validate-snow-accuracy` は Open-Meteo 日次のみ比較 |
| S7 | dayOffset=0、JMA メッシュなし | HTML: `snowfall_sum[今日]` + 近隣 FB | フォールバック経路 |
| S8 | `USE_RESORT_PUBLISHED_SNOW = false` | 積雪表示にゲレンデ公表ラベルなし | JMA `depth_cm` → モデル `hourly_snow_depth` |
| S9 | JMA `depth_cm` あり | モデル積雪深を積雪表示に使わない | Phase 4 抑制ルール |
| S10 | 地域別 MAE | コンソール + `mae_by_region` | overrides / 標高係数の修正候補抽出用 |

---

### 手動確認

```powershell
node scripts/validate-snow-accuracy.js
```

1. `reports/snow-accuracy-YYYY-MM-DD.json` が生成される  
2. コンソールに Overall MAE と地域別 MAE が出る  
3. `top_discrepancies` から乖離 Top10 が読める  
4. `weather.json` が空 or 7日分のみのときは `compared_count: 0` でもレポート自体は生成される
