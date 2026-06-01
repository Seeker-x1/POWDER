# 実装指示書：マップ日付レール（今日〜5日後・offset 0〜5）

## 0. 優先度と正本

| 項目 | 内容 |
|------|------|
| **優先度** | P1（マップで日付が飛ぶ不具合に見えるため UX ブロッカー） |
| **対象画面** | `#view-map` 上部 `#map-date-rail` / `#map-date-btns` |
| **正本モック** | 本番の `.date-card` スタイル（`ski-powder-hunter.html`）＋横スクロールは `popup-day-strip--scroll`（mock-005 系）と同趣旨 |
| **関連仕様** | `docs/IMPLEMENTATION_ORDER_DATE_SELECTOR_5_SLIDE_OPTION_A.md`（トップ／リスト用・**前日込み8チップ**）— マップは **別レイアウト**（下記） |

---

## 1. 表示方針の決定

### 採用: **案 A — offset 0〜5 を横スクロールで 6 枚（連続）**

| 案 | 内容 | 採否 |
|----|------|------|
| **A** | 今日〜5日後の **6 チップを 1 行・横スクロール**（欠番なし） | **採用** |
| B | 常時 5 可視＋6 枚目だけスライド（トップ案 A と同一） | 不採用 |

**案 A を採用する理由**

1. **マップレールは既に `#map-date-rail { overflow-x: auto }` の 1 段スクロール**であり、トップの「5 可視ビューポート＋前日 JMA 縦積み」と DOM が異なる。
2. 現状の欠番 `[0,1,4]` はユーザーに「日が飛んでいる」と見える。**連続 6 枚**がターゲット B（直前確認・地図上で日付切替）に合う。
3. チップ `min-width: 84px` × 6 ≈ 500px 超のため、≤700px では **最初からスクロール前提**が自然。案 B の「5 枚だけピッタリ」はラベル列「日付」を除いた実効幅では再現コストが高い。
4. トップ／リストの **案 A（8 チップ・前日〜+6）** とは **日数レンジが異なる**が、**offset 0〜5 のラベル規則は揃える**（下表）。

**案 B を不採用にした理由（代替案として記録）**

- マップ帯は高さが限られ、**5 可視固定**にすると 1 チップ幅が極小化しやすい（案 A ドキュメントが避けている「極小フォント」に近づく）。
- 6 枚目だけ隠すと、**5 日後**が見つけにくくターゲット A の比較用途にも不利。

---

## 2. ラベル規則（JA / EN）

**原則:** `data-offset` は既存どおり **0〜6**（`setTargetDayOffset`）。マップレールは **0〜5 のみ描画**（前日 `-1` は出さない）。

### 2.1 マップレール（`#map-date-btns`）

| offset | JA（`.date-card__d`） | EN（`.date-card__d`） |
|--------|-------------------------|-------------------------|
| 0 | 今日 | Today |
| 1 | 明日 | Tmrw |
| 2 | 明後日 | +2d |
| 3 | 3日後 | +3d |
| 4 | 4日後 | +4d |
| 5 | 5日後 | +5d |

- 2 行目（`.date-card__s`）: 既存どおり `MM/DD (曜)`。
- 降雪行（`.date-card__snow`）: 既存どおり **アクティブチップのみ表示**（`getRegionSnowfallForDay`、無データは `—` / `.zero`）。

### 2.2 トップ／リスト（変更しない・参照用）

| offset | JA | EN |
|--------|----|----|
| 0 | 今日 | Today |
| 1 | 明日 | Tmrw |
| 2 | 明後日 | +2d |
| 3 | +3日 | +3d |
| 4〜6 | +4日〜 | +4d〜 |

マップは **「N日後」表記**で 3〜5 を統一（スクリーンショットの「4日後」と整合）。トップの「+3日」と表記差は許容（画面役割が異なる）。

---

## 3. モバイル（≤700px）レイアウト・はみ出し

1. **スクロール容器:** `#map-date-rail`（既存）。`#map-date-btns` は `display: contents` のまま可。
2. **チップ:** `.date-card` — `flex: 0 0 auto`、`min-width: 84px`（現状維持）。**半切れ常態化禁止**は、指を離したあと **アクティブチップが完全に見える**ことで満たす（`ensureActiveDateChipVisible("map-date-btns")` を **offset 0〜5 全体**に適用）。
3. **初期表示:** デフォルト `targetDayOffset` が 3 のとき、**アクティブが 3日後**なら起動時にそのチップが見えるようスクロール（`scrollLeft` をアクティブ基準に。offset ≤3 固定 `scrollLeft=0` はマップレールでは **外す** か、トップ用 `#date-btns` だけに限定する）。
4. **タップ領域:** チップ高さ・左右 padding で **実質 44px 相当**（`.date-card` の縦 padding を削らない）。
5. **禁止:** 8 列 grid をマップレールに押し込まない。JMA 前日チップをマップ日付行の横に並べない（トップの 3.2.3 と同趣旨）。

**デスクトップ（≥701px）:** 同じ 6 チップ横並び＋必要ならスクロール。8 列 grid は **リスト側 `#date-btns` のみ**。

---

## 4. 実装タッチポイント（implementer 向けメモ）

| 箇所 | 変更 |
|------|------|
| `renderDateButtonsInto` | `mapOffsets = [0,1,4]` → **`[0,1,2,3,4,5]`**（または `dates.slice(0,6).map`） |
| 同上 `isMapRail` の label 分岐 | 上表の **offset 基準**（配列 index 基準の `i===0,1` / `4日後` 固定を廃止） |
| `ensureActiveDateChipVisible` | `trackId === "map-date-btns"` のとき **アクティブチップを左寄せで完全表示**（トップ用の `targetDayOffset <= 3 → scrollLeft=0` と分岐） |
| `ski-powder-hunter-en.html` | 上記と **対称** |
| CSS | 原則 **変更不要**。足りなければ `#map-date-rail` に `scroll-snap-type: x proximity` + `.date-card { scroll-snap-align: start }` を **任意** |

**触らない:** `getDates()` の 7 日ループ、+6 日チップ（リストのみ）、JMA タイル、ポップアップ内日付ストリップ。

---

## 5. 受け入れ条件（Given / When / Then）

### AC-1 連続表示

- **Given** マップ画面を開き、気象データが 1 件以上取得済み  
- **When** `#map-date-btns` を確認する  
- **Then** **6 枚**の日付チップが **offset 0,1,2,3,4,5** の順で並び、**欠番がない**

### AC-2 ラベル（JA）

- **Given** 言語が日本語版  
- **When** 各チップの主ラベルを読む  
- **Then** 順に **今日 / 明日 / 明後日 / 3日後 / 4日後 / 5日後** と表示される

### AC-3 選択とマップ連動

- **Given** マップ上にマーカーが表示されている  
- **When** ユーザーが **5日後** チップをタップする  
- **Then** そのチップがアクティブになり、マーカー／ポップアップの降雪・スコア表示が **offset 5** の予報に切り替わる

### AC-4 モバイル・スクロールと半切れ

- **Given** ビューポート幅 ≤700px  
- **When** **5日後** を選択して指を離す  
- **Then** **5日後** チップが **左右とも完全に** ビューポート内に収まる（半切れのまま停止しない）

### AC-5 英語版

- **Given** `ski-powder-hunter-en.html` のマップ  
- **When** 日付レールを確認する  
- **Then** AC-1 と同数のチップがあり、ラベルは **Today / Tmrw / +2d / +3d / +4d / +5d**

### AC-6 回帰（トップ／リスト）

- **Given** トップまたはリストの日付行  
- **When** 既存の案 A（前日〜+6・5 可視＋スライド）を操作する  
- **Then** **マップ変更前と同等**に動作する（マップ用分岐がトップに漏れない）

---

## 6. [HANDOFF] → implementer

```
[HANDOFF]
タスク: マップ日付レールを offset 0〜5（今日〜5日後）の連続6チップにする
優先度: P1
正本: .claude/agents/product-ux/IMPLEMENTATION_ORDER_MAP_DATE_RAIL_5DAYS.md

背景:
- mapOffsets = [0,1,4] により「今日・明日・4日後」だけ表示され UX 不具合扱い。
- 方針 A: #map-date-rail 上で 6 枚横スクロール。ラベルは本書 §2.1。

実装:
1. ski-powder-hunter.html / ski-powder-hunter-en.html の renderDateButtonsInto
2. mapOffsets → [0,1,2,3,4,5]、isMapRail ラベルを offset 基準に
3. ensureActiveDateChipVisible: map-date-btns 用スクロール（アクティブ完全表示）
4. AC-1〜AC-6 を満たすこと

ゲート: ROLE: implementer + 実装して
検証: qa-accessibility が AC をチェック（本番変更は implementer のみ）
[/HANDOFF]
```

---

## 渡し先

- **implementer** — 上記 [HANDOFF] と §4
- **qa-accessibility** — §5 の AC-1〜AC-6
- **docs-knowledge** — `decision-log.md` に 1 行（マップ日付 0〜5 連続・案 A 採用）
