# [HANDOFF] マップ日付レール — 今日〜5日後（offset 0〜5）

**from**: product-ux / architecture / snow-data / qa-accessibility（集約）  
**保存日**: 2026-06-01  
**フォルダ**: `.claude/agents/docs-knowledge/handoffs/map-date-rail-5days/`  
**implementer 正本**: [IMPLEMENTATION_ORDER.md](./IMPLEMENTATION_ORDER.md)  
**決定ログ**: `.claude/agents/docs-knowledge/decision-log.md`（1 行）

---

## タスクの位置づけ

| 項目 | 内容 |
|------|------|
| **和名** | マップ日付レール 5 日後まで |
| **対象** | `#view-map` 上部 `#map-date-rail` → `#map-date-btns`（`.date-card`） |
| **優先度** | **P1**（欠番 `[0,1,4]` が「日が飛ぶ」不具合に見える） |
| **ゲート** | `ROLE: implementer` + **実装して**（本番 HTML のみ） |
| **検証** | qa-accessibility（手動 AC、≤700px 必須）— 本 Handoff §6 |

**トップ／リストの日付セレクタとは別タスク。** 関係は §7。

---

## 1. 背景（全ロール合意）

### 現状（本番）

```text
mapOffsets = [0, 1, 4]
→ チップ 3 枚のみ: 今日 | 明日 | 4日後（明後日・3日後・5日後が欠ける）
ラベル: i 基準で「今日 / 明日 / 4日後」固定（offset 2,3,5 と不整合）
```

- **所在**: `renderDateButtonsInto`（`ski-powder-hunter.html` / `ski-powder-hunter-en.html`、おおよそ L2597–2648）
- **スクロール**: `ensureActiveDateChipVisible("map-date-btns")` がトップと共用し、`targetDayOffset <= 3` で `scrollLeft=0` 固定 → マップで **5日後** が半切れのまま止まりうる

### 目標

- `#map-date-btns` に **offset 0,1,2,3,4,5** の **6 枚**を **欠番なく**横並び（`#map-date-rail` で横スクロール）
- タップで `targetDayOffset` 更新 → **マーカー降雪表示が追従**（`setTargetDayOffset` → `refreshMarkers`）

---

## 2. 決定（product-ux）

| 項目 | 採用 |
|------|------|
| **表示方針** | **案 A** — 0〜5 の **6 チップ・1 行横スクロール**（連続） |
| **不採用** | 案 B（常時 5 可視＋6 枚目だけスライド）— マップ帯は高さ・幅の制約上、トップ案 A と同一 DOM ルールを押し込まない |
| **前日（offset -1）** | マップレールには **出さない** |
| **+6 日** | リスト／トップのみ（マップは 0〜5 で打ち止め） |

### ラベル規則（`data-offset` 基準・配列 index 禁止）

| offset | JA（`.date-card__d`） | EN |
|--------|-------------------------|-----|
| 0 | 今日 | Today |
| 1 | 明日 | Tmrw |
| 2 | 明後日 | +2d |
| 3 | 3日後 | +3d |
| 4 | 4日後 | +4d |
| 5 | 5日後 | +5d |

- 2 行目 `.date-card__s`: 既存 `MM/DD (曜)`
- 降雪行 `.date-card__snow`: **アクティブチップのみ**（既存 `getRegionSnowfallForDay`）
- トップの「+3日」表記とマップの「3日後」の差は **許容**（画面役割が異なる）

---

## 3. architecture — 触る場所・分岐・再発防止

| 内容 | 当たり |
|------|--------|
| 描画 | `renderDateButtonsInto` — `isMapRail` / `mapOffsets` / ラベル分岐 |
| スクロール | `ensureActiveDateChipVisible` — **`trackId === "map-date-btns"` または `#map-date-rail` 配下**でトップ用 `offset <= 3 → scrollLeft=0` を **適用しない** |
| 観測 | `initDateStripViewportLayout` の `ResizeObserver` は `#map-date-rail` 対象のまま可 |
| 状態 | `targetDayOffset`（0〜6）、`setTargetDayOffset` の契約は **変更しない** |
| 連動 | 日付変更時 `refreshMarkers` は呼ばれる。**ポップアップ／シート本文**は `selectResort` 再実行なしの可能性あり → §5 Known |

**漏れ禁止**: `mapOffsets` やマップ専用スクロールが `#date-btns` / `#top-date-btns` に波及しないこと（AC-6）。

索引: `.claude/agents/architecture/touch-points.md`（日付・タブ節）

---

## 4. snow-data — データ妥当性

| offset | API / 予報 | レール降雪行 |
|--------|------------|----------------|
| 0〜5 | `getDates()` / Open-Meteo 予報で **有効** | `getRegionSnowfallForDay(dayOffset)` — エリア代表・スコア>0 集計 |
| 4〜5 | ピン・ランキングと同系統の予報日 | **無データ時 `—` + `.zero` は仕様**（バグと混同しない） |
| 6 | マップレールでは **非表示** | — |

**不整合 Fail（qa）**: レールが `—` なのにピンだけ大きな cm が固定表示されるなど、日付切替と矛盾する表示。

---

## 5. Known（実装後も qa がメモ）

| ID | 内容 | 扱い |
|----|------|------|
| **K-1** | ポップアップ開放中にレールで日付変更 → 本文が古いまま、**ピン cm のみ更新**の可能性 | AC の「ピン追従」は必須。ポップアップ追従は **Known** または別 P2 |
| **K-2** | offset 4・5 でレール降雪 `—` | 仕様どおりなら Pass |

---

## 6. qa-accessibility — 受け入れ条件（要約）

**環境**: ビューポート **≤700px 必須**（375 / 390 推奨）。EN は `ski-powder-hunter-en.html` でも同手順。

| ID | Then（要約） |
|----|----------------|
| **AC-1** | 6 枚・offset 0→5 連続・欠番なし |
| **AC-2** | タップで `targetDayOffset` / ピン降雪が追従（K-1 除くポップアップ） |
| **AC-3** | `aria-pressed` 1 つ true、`role="region"`、キーボード可能なら Enter/Space |
| **AC-4** | 5日後選択後もチップが **半切れで止まらない** |
| **AC-5** | EN ラベル表どおり |
| **AC-6** | トップ `#top-date-btns`・リスト `#date-btns` 回帰なし |

**P0**: AC-1, AC-2（ピン）, AC-4b  
詳細チェックリスト: チャット／qa セッションの Pass-Fail 表（本タスク用テンプレは implementer 完了後に実施）

---

## 7. 既存仕様との関係（注記）

| ドキュメント | 対象 UI | 本タスクとの関係 |
|--------------|---------|------------------|
| [`docs/SPEC_DATE_SELECTOR_5_PLUS_SLIDE.md`](../../../../docs/SPEC_DATE_SELECTOR_5_PLUS_SLIDE.md) | 図解・用語の正本（**トップ／リスト向け**） | **マップには適用しない**（8 チップ・5 可視ビューポート・前日チップ・JMA 縦積みはトップ専用） |
| [`docs/IMPLEMENTATION_ORDER_DATE_SELECTOR_5_SLIDE_OPTION_A.md`](../../../../docs/IMPLEMENTATION_ORDER_DATE_SELECTOR_5_SLIDE_OPTION_A.md) | トップ／リスト **案 A**（前日〜+6、常時 5 可視＋スライド） | **別実装パス**。マップは **6 チップのみ・横スクロール可**で足りる |
| [IMPLEMENTATION_ORDER.md](./IMPLEMENTATION_ORDER.md) | **マップ `#map-date-rail` 専用** | implementer は **こちらのみ**実施 |
| `.claude/agents/product-ux/IMPLEMENTATION_ORDER_MAP_DATE_RAIL_5DAYS.md` | 同上の詳細版（AC 全文） | 内容は本 Handoff と同等；**正本は本フォルダの IMPLEMENTATION_ORDER** |

```text
トップ／リスト:  [前日] 今日 明日 明後日 +3 | +4 +5 +6  → 8チップ・5可視・案A
マップ:          今日 明日 明後日 3日後 4日後 5日後    → 6チップ・横スクロール（案A・マップ版）
```

---

## 8. 成果物パス

| 種別 | パス |
|------|------|
| 本 Handoff | `.claude/agents/docs-knowledge/handoffs/map-date-rail-5days/HANDOFF.md` |
| 実装指示（implementer） | 同フォルダ `IMPLEMENTATION_ORDER.md` |
| 画面フロー | `.claude/agents/product-ux/screen-flow.md` §マップ日付レール |
| 本番 | `ski-powder-hunter.html`, `ski-powder-hunter-en.html` |

---

## 9. [HANDOFF] → implementer（コピペ）

```
[HANDOFF]
タスク: マップ日付レールを offset 0〜5（今日〜5日後）の連続6チップにする
優先度: P1
正本: .claude/agents/docs-knowledge/handoffs/map-date-rail-5days/IMPLEMENTATION_ORDER.md

背景: mapOffsets=[0,1,4] により3枚のみ表示。案Aで6枚横スクロール。

実装（最小差分）:
1. mapOffsets → [0,1,2,3,4,5]
2. isMapRail ラベルを offset 基準（§2 表）
3. ensureActiveDateChipVisible: map-date-btns 専用分岐（アクティブ完全表示）
4. 任意: #map-date-rail scroll-snap
5. EN 対称

ゲート: ROLE: implementer + 実装して
検証: qa §6（≤700px）
触らない: getDates()、トップ案A、JMA前日、ポップアップ日付ストリップ
[/HANDOFF]
```

---

## 渡し先

| ロール | アクション |
|--------|------------|
| **implementer** | `IMPLEMENTATION_ORDER.md` を実施 |
| **qa-accessibility** | §6 AC、Known K-1/K-2 |
| **docs-knowledge** | `decision-log.md` 反映済み |
