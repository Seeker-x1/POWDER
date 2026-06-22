# 実装指示書：日付セレクタ 案A（5可視＋スライド）

## 0. 優先度と正本の関係

- **`IMPLEMENTATION_ORDER_MOBILE_MAP_UNIFIED.md` の §3.0 / §3.1（上段「8列・横スクロール禁止」）は、本書の案Aにより改訂される。**
  - **上段日付行**は本書を正とする：**常時 5 チップ幅のビューポート**に収め、**+4 / +5 / +6** は**同一行の横スクロール**で表示する。
- **下段の時間帯マス（8マス・前日2枠含む）**は、統合指示書のデータ仕様を維持する（本書では **DOM/CSS の変更対象外**とする。別タスクで縮小調整が必要なら別指示）。

---

## 1. 案Aの定義（確定）

### 1.1 チップの並び（左→右、計8）

| # | 内容 | `data-offset` | 備考 |
|---|------|----------------|------|
| 1 | 前日（カレンダー・降雪の参照表示） | `-1` | 現状どおり **選択不可**（`disabled`）でよい。`setTargetDayOffset` は **0〜6 のみ**（データモデル変更なし）。 |
| 2 | 今日 | `0` | |
| 3 | 明日 | `1` | |
| 4 | 明後日 | `2` | |
| 5 | +3日（または「3日後」表記） | `3` | |
| 6 | +4日 | `4` | **第1ビュー外**→スライドで表示 |
| 7 | +5日 | `5` | |
| 8 | +6日 | `6` | |

### 1.2 画面に常に収める幅

- **ビューポートの幅**＝親（`.top-date-wrap` 等）の **100%**（パディング除く）。
- **一度に「完全に」見えるチップは 5 個分**（前日〜+3 相当）。
- **+4〜+6** は、ビューポート右外にあり、**横スクロール**で持ってくる。

### 1.3 禁止事項（必須）

- チップが**右端で半分だけ見える**「チラ見せ」状態を常態化しない。
- `overflow-x: visible` で 8 列を無理に押し込まない（**極小フォント回避**のため案Aを採用している）。

**許容**: スクロール中は指で動かしている間だけ中間位置があり得る。**指を離した後**は `scroll-snap` 等で **チップ境界に揃う**こと。

---

## 2. 対象ファイル

- `ski-powder-hunter.html`
- `ski-powder-hunter-en.html`

**変更箇所**: 上記の **`<style>`（日付行まわり）**、**日付行の HTML ラッパー**、**`renderDateButtonsInto` およびスクロール同期**。

---

## 3. HTML 構造

### 3.1 ラッパー追加

各 `id="top-date-btns"` / `id="date-btns"` を、次のように **ビューポートで包む**（クラス名は例。実装で統一すれば可）。

```html
<div class="date-btns-viewport">
  <div class="date-btns date-btns-track" id="top-date-btns"></div>
</div>
```

- **トップ**（`#view-top` 内）と **リスト/地図側**（`#date-btns`）の **2 箇所**に同じ構造を入れる。
- `renderDateButtonsInto` の `getElementById` は **`top-date-btns` / `date-btns` のまま**（中身は `.date-btns-track` に描画）。

### 3.2 前日JMAチップと日付ビューポートの配置（必須・モバイル）

#### 3.2.1 コンセプト図（`spec-date-selector-5items-slide-visualization.png`）との対応

- 図の **日付帯**は、**横一列のビューポート**のうち **左から 5 チップ分が「見切れず」並ぶ**ことを示す（前日〜+3 相当）。
- **+4 / +5 / +6** は **同じトラック上で右側に続き**、**横スクロール**で持ってくる。これは **ビューポートの幅**が **画面（親）の与える幅いっぱい**であることが前提になる。
- よって **JMA 用の別カラム**が横に付くと、図の「5 チップ＝ビューポート幅」という対応が **数値・見た目の両方で崩れる**。

#### 3.2.2 横並び（JMA とビューポートの同一行配置）を禁止する理由

- `.date-row-flex` 内で **`#top-prev-day-jma-chip` / `#prev-day-jma-chip`** と **`.date-btns-viewport`** を **横並び**にすると、JMA が表示された瞬間に **フレックスが幅を分配**し、**日付ビューポートの `clientWidth` が狭まる**。
- その結果、`ResizeObserver` / `--chip-w` の計算と **実際の見え方**がずれ、**5 チップが収まらない**・**左に無駄な空白だけが広がる**・**1 枚しか見えない**など、案Aの必須要件に反する。

#### 3.2.3 ≤700px での必須レイアウト（明文化）

- **`max-width: 700px`** では **必ず**:
  - `.date-row-flex` に **`flex-direction: column`**
  - **日付 `.date-btns-viewport`**: **`order: 1`**・**`width: 100%`**（ビューポートが親の内側で全幅）
  - **前日 JMA `.prev-day-jma-chip`**: **`order: 2`**（**ビューポートの下**に積む。DOM 順序と表示順のずれは `order` で吸収）
- **`min-width: 701px`**: デスクトップでは **横並びのまま**でよい（ビューポートが十分な幅を取れる）。

---

## 4. CSS（モバイル必須・デスクトップは従来維持）

### 4.1 ブレークポイント

- **`max-width: 700px`**（既存のモバイル地図と揃える）：**案A を適用**。
- **`min-width: 701px`**：**従来の 8 列 `grid`**（`repeat(8,minmax(0,1fr))`）を維持し、**スクロール不要**。

### 4.2 モバイル（≤700px）の要点

1. **`.date-btns-viewport`**
   - `width: 100%`
   - `overflow-x: auto`（縦は `hidden`）
   - `overflow-y: hidden`
   - `-webkit-overflow-scrolling: touch`
   - `scroll-snap-type: x mandatory`（または `proximity`＋調整）
   - `scrollbar-width: none` / `::-webkit-scrollbar { display: none }`（既存トップの方針に合わせる）
   - `box-sizing: border-box`
   - **左右パディング**は親の `.top-date-wrap` と整合（はみ出し計算に含める）

2. **`.date-btns-track`（`#date-btns` / `#top-date-btns`）**
   - `display: flex`
   - `flex-direction: row`
   - `gap: 4px`（現状の `gap` に合わせる）
   - `width: max-content` または子の合計幅で自然に伸長

3. **各 `.date-btn`（モバイル時のみ）**
   - **幅**: ビューポート基準で **5 チップ＝100%** になるよう、  
     `flex: 0 0 calc((100% - 4 * gap) / 5)` は **親が track のため `100%` が効かない**点に注意。
   - **推奨実装（いずれか）**:
     - **Container Queries**: `.date-btns-viewport { container-type: inline-size; }` とし、  
       `.date-btn { width: calc((100cqw - 4*gap) / 5); }`（`gap` は `calc` 内で px 指定）
     - または **`ResizeObserver` + CSS 変数**: 描画後に `--chip-w` をビューポート幅から設定（下記 §5）

4. **`scroll-snap-align`**
   - 各 `.date-btn` に `scroll-snap-align: start`（または `center` だが、端の半分表示を避けるなら `start` 基準で調整）

5. **第2画面（+4〜+6）**
   - トラック末尾に `padding-right` を足し、**最後のチップが左端にスナップしたときに右に余白**が出てもよい（半分欠け防止）。

### 4.3 デスクトップ（>700px）

- `.date-btns-viewport { overflow: visible; }`
- `.date-btns-track` に対し **`display: grid; grid-template-columns: repeat(8, minmax(0, 1fr));`** を維持（現状と同等）。
- スクロール関連プロパティは無効化。

---

## 5. 「開いた瞬間5項目 → その後ピッタリ」

### 5.1 挙動の意味

1. **初回ペイント**: 8 チップが DOM に乗るが、幅計算が未確定の可能性がある。
2. **レイアウト確定後**: ビューポート幅に対して **1 チップ幅＝(幅 − 4×gap)/5** を再計算し、**5 チップ分がちょうどビューポートに収まる**状態にする。

### 5.2 実装手段（推奨）

- `document.fonts.ready` 後と、`ResizeObserver`（`.date-btns-viewport`）で **幅変更時**に `--chip-w` を更新。
- 初回は `requestAnimationFrame` を二重に叩いて、ブラウザのレイアウト後に `--chip-w` を確定。
- `.date-btn` の幅を `var(--chip-w)` にバインド（モバイルのみ）。

### 5.3 フォールバック

- `container-type: inline-size` + `cqw` が使える環境では **JS なし**でもよいが、**Safari 等の検証必須**。

---

## 6. JavaScript

### 6.1 `renderDateButtonsInto`（ラベル）

- **日本語**: `i===2` を **`明後日`** に変更（現状は `+2日` になりがち）。  
  `i===3` は **`+3日`** または **`3日後`**（プロダクトで統一）。
- **英語**: `Tmrw` の次を **`+2d`** のままか **`Day+2`** 等にするかは任意。**5可視の意味が通じる**こと。

### 6.2 選択中オフセットの可視化（必須）

- `targetDayOffset` が **4, 5, 6** のとき、再描画後に **該当チップがビューポート内に完全に入る**よう **`.date-btns-viewport` の `scrollLeft`** を設定する。
- **`0〜3` のときは `scrollLeft = 0` とする**（初回ページは **前日〜+3** の5チップ。**アクティブを中央に寄せるスクロールは禁止** — 5可視が崩れる）。
- **実装案**: `renderDateButtonsInto` の末尾で `queueMicrotask` または `requestAnimationFrame` の後に  
  `ensureActiveDateVisible(containerId)` を呼ぶ。
  - アクティブ要素: `#top-date-btns .date-btn.active` 等
  - `scrollLeft = active.offsetLeft - (viewport.clientWidth - active.offsetWidth) / 2` を **0〜maxScroll** にクランプ  
    または **`scrollIntoView` をラッパー内だけで効くよう** `overflow` 構造を確認。

### 6.3 `syncDateButtonsActive` 後も

- アクティブ変更だけのときも、**+4〜+6** が画面外に残らないよう **同じスクロール補正**を呼ぶ。

### 6.4 既存ロジックの維持

- `setTargetDayOffset` の **0〜6** 制約は **変更しない**。
- 前日 `data-offset="-1"` の **disabled** 方針は **維持**（前日を「ターゲット日」にする要件が出たら別指示）。

---

## 7. アクセシビリティ

- 横スクロール領域に **視覚的なヒント**（右端にフェード、または「続きあり」を示す 2px ドット）を付けるかは任意。
- **フォーカス**: キーボード操作時、非表示チップにフォーカスが当たったら **同じ `ensureActiveDateVisible`** で追従。

---

## 8. 受け入れ条件（チェックリスト）

- [ ] **≤700px**: **前日JMAチップが表示されている状態**でも、日付行は **ビューポートが画面幅いっぱい（親の内側）**で、**左に無駄な空白帯だけが広がる**表示にならない（**3.2**）。
- [ ] **≤700px**: 初期表示で **前日〜+3** の **5 チップがすべて全文表示**（日付が `03/` だけ等にならない）。
- [ ] **≤700px**: 横スクロールで **+4 / +5 / +6** に到達でき、**各チップが欠けずに**タップできる。
- [ ] **≤700px**: 指を離した後、**意図しない半チップ表示**が残らない（スナップで解消）。
- [ ] **+4〜+6** を選択した状態で再描画しても、**アクティブが画面外に取り残されない**。
- [ ] **>700px**: **8 列グリッド**が従来どおり（横スクロールなし）。
- [ ] **JP / EN** で構造・挙動が同じ。
- [ ] 下段の **8 マス・データ分岐**（統合指示書）は**壊していない**（回帰テスト）。

---

## 9. 関連ドキュメントの更新（実装完了時）

- `SPEC_DATE_SELECTOR_5_PLUS_SLIDE.md` … 案A確定を明記済みでよい。
- `IMPLEMENTATION_ORDER_MOBILE_MAP_UNIFIED.md` … §3.0 / §3.1 の **上段**に注釈「**案A 実装後は 5+スライド。本文は `IMPLEMENTATION_ORDER_DATE_SELECTOR_5_SLIDE_OPTION_A.md` を参照**」を追記する。

---

## 10. 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-03-22 | **§6.2** 追記：`targetDayOffset` 0〜3 は `scrollLeft=0`、中央寄せスクロール禁止（5可視維持）。 |
| 2026-03-22 | **§3.2** 拡充（3.2.1〜3.2.3）：コンセプト図との対応・横並び禁止の理由・≤700px 必須レイアウトを明文化。§8・§10 は同日更新済み。 |
| 2025-03-17 | 初版：案A 実装指示 |
