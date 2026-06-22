# 実装指示書：モバイル TOP — **ビジュアル準拠（このまま実装）**

**目的**: `docs/mobile-ux-images/GOAL-full-screen-mobile-top-unified-8slot.png` の **全面表示**に、可能な限り **見た目・構造を一致**させる。  
**補助**: レイアウトの意図確認に `VERIFY-unified-8slot-vs-two-bands.png`（8 マス一本化＝正解）。

**集約方針（確定）**: TOP の週間棒は **案 A** — **表示中ランキング（最大 10 件）のリゾートについて日ごとの値を取り、その日の中央値**を棒の高さに使う（§6）。

**関連する広い文脈**: `IMPLEMENTATION_ORDER_MOBILE_TOP_GOAL_UNIFIED.md`（方針・リスク）。**実装作業の手順は本書を正とする。**

---

## 0. ビジュアルの優先順位（実装者は必読）

| 順位 | ファイル | 使い方 |
|------|----------|--------|
| **1（主）** | `docs/mobile-ux-images/GOAL-full-screen-mobile-top-unified-8slot.png` | **最終見た目**の基準。実装後スクリーンショットと並べてレビュー。 |
| **2** | `docs/mobile-ux-images/VERIFY-unified-8slot-vs-two-bands.png` | **二段 UI に戻さない**ことの確認用。 |
| **3** | `docs/mobile-ux-images/CANONICAL-powder-ranking-top-mock.png` | **色・タイポ・カード密度**の参考。**レイアウトは二段にしない**（VERIFY 優先）。 |

---

## 1. スコープと対象ファイル

### 1.1 やること（必須）

- **`#view-top`（トップランキング）** を、ゴール PNG と同じ **情報アーキテクチャ**に作り替える。
- **8 マス一本化ストリップ**（前日＋7 日）を **1 行のみ**で実装する（§3）。
- **Sort | Area | Refresh** を **1 行**にまとめる（§4）。
- **ダーク**基調。トップの **ヒーロー動画は表示しない**（削除または `display:none`）。
- **エリア・並び替え**を `localStorage` に保存し、**再訪問で復元**（§7）。
- **文言**は i18n 一元化方針に従う（§8）（本書は英語 UI をゴール PNG に合わせる）。

### 1.2 主に触るファイル（想定）

- `ski-powder-hunter.html`（マークアップ・`#view-top` 内）
- 同一ファイル内の **`<style>`** または分割 CSS があれば該当箇所
- インライン **`<script>`** 内: `renderTop10`、日付オフセット、新規 `renderTopWeeklyStrip` 相当

### 1.3 やらないこと（本タスク外）

- マップの日付 UI をトップと **DOM 共有**にすること（別タスク可）。
- ピクセルパーフェクトの **Figma 固定**（ブラウザ差異は許容。ただし **構造は一致**）。

---

## 2. 画面構造（DOM の正解）

上から順に **次のブロックのみ**（ゴール PNG と対応）。

```
view-top
├── (optional) status はブラウザ任せでよい
├── .top-brand
│   ├── h1.top-title          … "Powder Ranking"（i18n）
│   └── p.top-subtitle        … "Snow depth & powder outlook"（i18n）
├── section.top-target-week-strip（8 マス一本・**単一コンテナ**）
│   └── .tw-strip-grid        … display:grid; 8 列
│       └── ×8 .tw-strip-cell[data-slot="prev|d0|d1|…|d6"]
├── .top-toolbar（1 行）
│   ├── .top-toolbar-sort（select または同等）
│   ├── .top-toolbar-area（button または a）
│   └── .top-toolbar-refresh（button）
└── .top-ten-wrap / 一覧（既存をスタイル合わせ）
```

**禁止**: `.top-target-week-strip` の外に **別の**「日付チップだけの行」や「週間だけの行」を **追加**すること（二段化）。

---

## 3. 8 マスストリップ（ビジュアルそのまま）

### 3.1 列の意味

| 列 index | 内容 | `targetDayOffset` | タップ |
|----------|------|-------------------|--------|
| 0 | **前日**（参照・JMA/実績の文脈は既存ロジックに準拠） | **選択不可**（`aria-disabled`） | 無効 |
| 1〜7 | **今日〜+6**（予報ベースの降雪見立て） | **0〜6** | `setTargetDayOffset(n)` |

**データ上の前日値**は、既存 `getPrevDayDisplayForResort` 系と **同じ定義**を使う。TOP では **集約**する（§6）。

### 3.2 各セルの中身（上から下）

1. **ラベル行 1**: 日付（例: `3/22`）— **英語ロケールなら `M/D`**、日本語なら `3/22` または `3月22日` はプロダクトで統一。
2. **ラベル行 2**: 曜日（例: `Sun` / `日`）。
3. **棒**: 降雪見立ての相対量（既存 `snow-bars` と同様の **正規化した高さ**）。色はティール系グラデ。

**CSS（必須）**

- コンテナ: `display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 2px 4px;`（gap はビジュアルに合わせ微調整可）
- セル: `min-width: 0;`  
- ラベル: **2 行**。**セル全体に `white-space: nowrap` をかけない**。
- アクティブ列（選択中の `targetDayOffset`）: **アウトラインまたは下線**でゴール PNG に近い強調。

### 3.3 はみ出し対策（受け入れ）

- **375px / 320px** で確認。溢れる場合は **§3.2 の gap・フォントサイズのみ**調整。
- それでも不可のとき **限り**、`.top-target-week-strip` に **`overflow-x: auto`** と `scroll-snap-type: x mandatory`、セル **`min-width: 44px`**（**ページ全体**は横スクロールさせない）。

---

## 4. ツールバー（1 行）

ゴール PNG と同じ **3 ゾーン**:

1. **Sort** — 既存 `top-sort-select` と同等の **値**（`powder` / `snow` / …）。見た目は **左寄せ**、ラベル "Sort" またはアイコン＋短縮は PNG に合わせる。
2. **Area** — 現在のエリア名（例: `Kanto–Koshinetsu`）＋ chevron。クリックで **モーダル / ボトムシート**で地域選択（既存 `region-pill` のデータソースを流用）。
3. **Refresh** — 右端。**押下**: 既存 `btn-top-refresh` と同様に **`renderTop10()`**（＋ストリップ用データの再計算）。

**CSS**: `display: flex; align-items: center; justify-content: space-between; gap: 8px;`  
中央が詰まる場合は **Area を `flex: 1; min-width: 0; text-overflow: ellipsis`**。

---

## 5. 一覧カード（ランキング）

- ゴール PNG に合わせ: **左に順位**、**サムネ**、**名称**、**Powder score / 24h snow / Depth**（ラベルは i18n）。
- 既存 `renderTop10` の出力を **マークアップ/CSS で寄せる**。ロジックは極力変更しない。

---

## 6. データ（TOP の 8 本の棒）— **案 A 採用（確定）**

### 6.1 方針

- **案 A のみ**を実装する。**案 B（代表点 1 点）**は採用しない。
- 各マスの棒の高さは、**いま `renderTop10` が一覧に出しているのと同じ集合**（通常は **最大 10 リゾート**、エリア・ソート適用後）を対象にする。

### 6.2 列ごとの値の定義

| 列 | 入力となる値（リゾートごと） | 集約 |
|----|------------------------------|------|
| **0（前日）** | 既存 `getPrevDayDisplayForResort(id, targetDayOffset, daily, resort).total`（cm。取得不能は `null`） | その日 **有効な値だけ**を集め、**中央値**（個数が偶数なら **中央 2 個の平均**） |
| **1〜7（今日〜+6）** | 既存 `getSnowfallAdjusted(daily, resort, dayOffset)`（`dayOffset` 0〜6） | 同上 **中央値** |

### 6.3 実装メモ

- **同じリゾート集合**を `renderTop10` の結果確定後に取得する（一覧とストリップで **順位・絞り込みが一致**するようにする）。
- 対象リゾートが **0 件**のとき: 棒は **表示しない**または **すべて「—」**（ビジュアルはチームで統一）。
- **一部だけ `null`**: 中央値計算から **null は除外**。有効値が **0 件**の列は **高さ 0 または「—」**。
- 棒の **正規化**: 8 列のうち **その表示更新内での最大値**を 100% とし、既存カード内 `snow-bars` と同様に **相対高さ**でよい（絶対 cm を棒上に出すかは任意。出す場合は §6.2 の中央値を表示）。

### 6.4 ユーザー向け説明（必須）

- ストリップまたはツールチップに **1 行**入れる（例・日本語）:  
  **「週間の棒は、表示中の上位スキー場（最大10）の予想降雪を日ごとに集めた中央値です。」**  
- 英語 UI では同等の一文を `STRINGS` に置く。

### 6.5 受け入れ

- コードコメントまたは `README` に **案 A・中央値・TOP10 同集合**と明記されていること。
- 一覧のリゾート集合やソートを変えたあと、**ストリップの棒が連動して更新**すること。

---

## 7. 永続化（localStorage）

キー例（プレフィックスはプロジェクトで統一）:

| キー | 値 |
|------|-----|
| `powder.topSort` | ソート select の value |
| `powder.topRegion` | 選択エリア ID（既存 `data-region` と同一） |
| `powder.lang` | `en` / `ja`（i18n 実装時） |

**読み込み**: DOMContentLoaded 後、**初回描画前**に適用。  
**書き込み**: ユーザーが Sort / Area を変えたとき。

---

## 8. i18n（一元化）

- **ゴール PNG は英語**なので、英語文字列を **基準**に key を切る。
- 最終的には **単一 HTML**＋`STRINGS[lang]`（または JSON）に寄せ、**二重 HTML を廃止**（`IMPLEMENTATION_ORDER_MOBILE_TOP_GOAL_UNIFIED.md` §5）。

本タスクの最低限:

- `top.title`, `top.subtitle`, `top.strip.prev`, `top.toolbar.sort`, `top.toolbar.area`, `top.toolbar.refresh`, カードの各指標ラベル。

---

## 9. 受け入れ（ビジュアル一致の定義）

実装者は **次をすべて満たす**こと。

1. **スクリーンショット比較**: 375px 幅（またはゴール PNG と同じ想定幅）でトップをキャプチャし、`GOAL-full-screen-mobile-top-unified-8slot.png` と **並べて**レビュー。  
   - **8 マスが 1 段のみ**であること（VERIFY と矛盾しない）。  
   - **ツールバーが 1 行**であること。  
   - **動画ヒーローが出ていない**こと。
2. **320px** で §3.3 のフォールバックが発動しない、または発動しても **帯のみ**スクロールであること。
3. **前日セル**はタップしても **`targetDayOffset` が変わらない**こと。
4. **再読込**後、エリア・ソートが保持されること（§7）。

---

## 10. 実装チェックリスト（コピペ用）

- [ ] `#view-top` からヒーロー `<video>` を除去または非表示  
- [ ] 旧 `top-date-wrap` の **5 チップ専用行**をトップから撤去（8 マスに統合）  
- [ ] `grid` 8 列＋2 行ラベル＋棒  
- [ ] `top-toolbar` 1 行化  
- [ ] `renderTop10` との連携（オフセット変更で再描画）  
- [ ] **案 A**: 表示中 TOP（最大10）の **日別中央値** で 8 本の棒を計算（§6）  
- [ ] `localStorage` 読み書き  
- [ ] 受け入れ §9 実施  

---

**完了条件**: レビュアが **GOAL PNG** と並べたときに「意図したトップの完成形」と判断し、§9 のチェックがすべて付くこと。
