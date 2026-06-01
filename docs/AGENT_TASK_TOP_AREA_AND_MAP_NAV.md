# エージェントAI 作業指示：トップのエリア絞り ＋ マップの「前/次」ボタン

**対象ファイル**: `ski-powder-hunter.html`（プロジェクトルート直下の1ファイルのみ）

**目的**:  
1. トップ画面で日付の下にエリア用ピルを追加し、選択エリアでTOP10を絞り込み、見出しを「○月○日のパウダースコア TOP10（関東）」のように変更する。  
2. マップでポップアップを開いているとき、「← 前」「次 →」で、現在のフィルタ＋ソート順の前後のゲレンデに移動できるようにする。

---

## タスク1: トップのエリア絞り

### 1-1. やること一覧
- トップ画面（`#view-top`）の「ターゲット日」の**下**に、マップ画面と同じエリアの**1行横スクロールのピル**を追加する。
- トップ用の選択エリアを保持する変数を用意し、ピルクリックでそれを更新して `renderTop10()` を再実行する。
- `renderTop10()` 内で、その変数に応じて対象を `RESORTS` の `region` でフィルタし、見出しを「○月○日のパウダースコア TOP10（全国）」または「（関東）」のように**エリア名付き**にする。

### 1-2. 変更箇所と手順

#### A. HTML の追加
- **場所**: `ski-powder-hunter.html` のトップブロック内。  
  **挿入位置**: `<div class="date-btns" id="top-date-btns"></div>` の直後、かつ `<p class="top-sub" id="top-sub">` の直前。
- **追加するHTML**: マップの `region-pills` と同じ構成の、トップ専用のエリアピル1行。  
  - ラベルは「エリア」など短くしてもよい（任意）。  
  - 各ピル: `data-region` に `all`, `hokkaido`, `tohoku`, `niigata`, `nagano`, `chubu`, `kanto`, `kansai`, `chugoku`、表示文言は「全国」「北海道」「東北」「新潟」「長野」「中部」「関東」「関西」「中国・四国」とする。  
  - 最初は「全国」だけ `active` クラスをつける。  
  - 親要素にクラス `top-region-pills` を付与し、1行横スクロール用にスタイルを当てる（後述CSSで対応）。

例（構造のみ）:
```html
<div class="top-region-pills region-pills" id="top-region-pills">
  <div class="region-pill active" data-region="all">全国</div>
  <div class="region-pill" data-region="hokkaido">北海道</div>
  <!-- … 以下 tohoku, niigata, nagano, chubu, kanto, kansai, chugoku 同様 -->
</div>
```

#### B. CSS の追加
- **場所**: 既存の `<style>` 内。`.view-top` まわりのブロックの近くがよい。
- **追加するスタイル**:
  - `.top-region-pills`: 1行にし、横スクロールにする。  
    - `display: flex; flex-wrap: nowrap; overflow-x: auto;`  
    - `-webkit-overflow-scrolling: touch;`（モバイルでスムーズに）  
    - 必要なら `scrollbar-width: thin;` や `::-webkit-scrollbar` でスクロールバーを細く。  
  - 既存の `.region-pill` のスタイルがそのまま使えるので、`.top-region-pills .region-pill` で `flex-shrink: 0` を付けて折り返さないようにする。

#### C. トップ用エリア変数とラベル
- **場所**: 既存の `let activeRegion = "all";` の近く（例: 558行付近）。
- **追加**: トップ専用の選択エリアを保持する変数。  
  - 例: `let topActiveRegion = "all";`
- **追加**: エリアコード → 見出し用ラベルのオブジェクト。  
  - 例:  
    - `all` → `"全国"`  
    - `hokkaido` → `"北海道"`  
    - `tohoku` → `"東北"`  
    - `niigata` → `"新潟"`  
    - `nagano` → `"長野"`  
    - `chubu` → `"中部"`  
    - `kanto` → `"関東"`  
    - `kansai` → `"関西"`  
    - `chugoku` → `"中国・四国"`  
  - これを使って `renderTop10()` の見出しで「（○○）」を表示する。

#### D. renderTop10() の修正
- **場所**: `function renderTop10(){ ... }` のブロック（1061行付近）。
- **変更内容**:
  1. **フィルタ**: 現在は `RESORTS` をそのまま使っている。  
     - ここで `topActiveRegion` を使って、マップの `getFiltered()` と同様の**エリア条件だけ**でフィルタする（検索クエリは不要）。  
     - 条件: `topActiveRegion === "all"` なら全件、`topActiveRegion === "chugoku"` なら `r.region === "chugoku" || r.region === "shikoku"`、それ以外は `r.region === topActiveRegion`。  
     - フィルタ結果を `RESORTS` の代わりに使い、その中から「気象データあり」のものだけに絞り、パウダースコアでソートして先頭10件をTOP10とする。
  2. **見出し**: `subEl.textContent` を、日付＋エリア名にする。  
     - 例: `const regionLabel = (上で用意したオブジェクト)[topActiveRegion] || "全国";`  
     - 例: `subEl.textContent = ${dateStr}のパウダースコア TOP10（${regionLabel}）;`

#### E. トップ用ピルのクリック処理
- **場所**: 既存の `document.querySelectorAll(".region-pill").forEach(...)` の**直前か直後**（1647行付近）。マップ用の `.region-pill` はサイドバー内にあるので、トップ用は別にバインドする。
- **追加**: `#top-region-pills` 内の `.region-pill` にだけクリックを付ける。  
  - クリック時: 同じ行の他ピルの `active` を外し、クリックしたピルに `active` を付ける。  
  - `topActiveRegion = クリックした要素の data-region`。  
  - `renderTop10()` を呼ぶ。  
  - トップにいるときにエリアを変えたら、その時点でTOP10がそのエリアで再描画されるようにする。

※ マップの `.region-pill` は `activeRegion` を変えて `renderList()` を呼んでいるので、トップ用は `topActiveRegion` と `renderTop10()` だけ触るようにすれば、画面切り替えと干渉しません。

---

## タスク2: マップの「← 前」「次 →」ボタン

### 2-1. やること一覧
- マップでゲレンデのポップアップを開いているとき、「今のフィルタ＋ソート順」での**前のゲレンデ**と**次のゲレンデ**へ移動する「← 前」「次 →」ボタンを表示する。
- 対象リストは **getFiltered()** の戻り値（`activeRegion`・検索・`sortMode` が反映された並び）とする。
- ボタン配置: 「ポップアップ内」か「マップ端のフロート」のどちらか。ここでは**ポップアップ内**に置く実装を指示する（ポップアップを開き直すたびに前後が更新されるため実装が簡単）。

### 2-2. 変更箇所と手順

#### A. 前後インデックスの計算
- **場所**: `function selectResort(id, opts){ ... }` の**先頭付近**（例: `selectedId=id;` の直後、`const r=RESORT_MAP[id];` の前か後）。
- **追加するロジック**:
  1. `const filtered = getFiltered();` で現在のフィルタ＋ソート順の配列を取得。
  2. `const currentIndex = filtered.findIndex(r => r.id === id);` で、今開いているゲレンデのインデックスを取得。
  3. 前: `const prevId = currentIndex > 0 ? filtered[currentIndex - 1].id : null;`  
     次: `const nextId = currentIndex >= 0 && currentIndex < filtered.length - 1 ? filtered[currentIndex + 1].id : null;`

#### B. ポップアップ用HTMLへの「前/次」ボタン追加
- **場所**: 同じ `selectResort()` 内で、`contentHtml` を組み立てている部分。  
  **挿入位置**: ポップアップの**先頭**（`<div class="popup-name">` の前）がおすすめ。マップを動かさずに前後だけ切り替えるので、ボタンが上にあると押しやすい。
- **追加するHTML**: 1行のナビ用ラッパーと、2つのボタン。  
  - 例:  
    - `prevId !== null` のときだけ「← 前」ボタン。`onclick="selectResort(prevId,{noMove:true})"` で、地図の中心は動かさずにポップアップだけ切り替える。  
    - `nextId !== null` のときだけ「次 →」ボタン。`onclick="selectResort(nextId,{noMove:true})"`。  
  - クラス名は例: `popup-nav`（ラッパー）、`popup-nav-btn`（各ボタン）。既存の `.popup-btns` と区別するため別名にする。

例（疑似）:
```html
<div class="popup-nav">
  ${prevId != null ? `<button type="button" class="popup-nav-btn" onclick="selectResort(${prevId},{noMove:true})">← 前</button>` : ""}
  ${nextId != null ? `<button type="button" class="popup-nav-btn" onclick="selectResort(${nextId},{noMove:true})">次 →</button>` : ""}
</div>
```
このブロックを `contentHtml` の**先頭**に連結する（`contentHtml = 上記 + contentHtml` のように）。

#### C. スタイルの追加
- **場所**: 既存の `.popup-btn` や `.popup-btns` の近く（例: 207行付近の popup 用スタイル）。
- **追加**:
  - `.popup-nav`: 横並び、ポップアップ内で1行に収める。`display: flex; justify-content: space-between; gap: 8px; margin-bottom: 10px;` など。
  - `.popup-nav-btn`: 既存の `.popup-btn-secondary` に近い見た目でよい。小さめのフォント、角丸、枠線。モバイルでもタップしやすいサイズ（min-height など）。

#### D. 動作確認のポイント
- マップでエリアを「関東」に絞り、ソートを「パウダースコア順」にした状態で、あるゲレンデのピンをクリックしてポップアップを開く。
- 「次 →」で、同じリストの次のゲレンデにポップアップが切り替わること。地図の中心は動かず、ポップアップの内容だけ変わること（`noMove: true` の効果）。
- 「← 前」で前のゲレンデに戻ること。
- リストの先頭のゲレンデでは「← 前」を非表示、末尾では「次 →」を非表示にすること（上記の `prevId` / `nextId` が null のときはボタン自体を出さないので満たせる）。

---

## 実装時の注意（エージェント向け）

1. **変数スコープ**: `topActiveRegion` はトップ専用。マップの `activeRegion` はサイドバーのピル用なので、トップ用ピルでは `topActiveRegion` だけを更新すること。
2. **getFiltered()**: マップのリストとソートで使っている既存関数。タスク2では「前後のゲレンデ」の並びにこの配列をそのまま使うので、ソートやフィルタを変えると前後も連動する。
3. **selectResort(id, { noMove: true })**: 前/次ボタンから呼ぶときは必ず `noMove: true` を付ける。そうしないと地図が毎回 flyTo してしまい、「マップを動かさずに比較」にならない。
4. **モバイル**: トップのピルは `overflow-x: auto` で横スクロールにし、既存の `@media(max-width:700px)` などで崩れないようにする。ポップアップの前/次ボタンは、既存の `.popup-btn` と同程度のタップ領域を確保する。

---

## 完了条件のチェックリスト

- [ ] トップで「関東」を選ぶと、その日のパウダースコアTOP10が関東のゲレンデだけになり、見出しが「○月○日のパウダースコア TOP10（関東）」になる。
- [ ] トップで「全国」を選ぶと、従来どおり全国のTOP10で、見出しに「（全国）」が付く。
- [ ] トップのエリアピルは1行で、横スクロールでき、マップのピルと同じエリア名・同じ data-region 値である。
- [ ] マップでポップアップを開いたとき、「← 前」「次 →」が表示され（先頭/末尾では片方だけ非表示）、クリックで前後のゲレンデに切り替わる。地図の中心・ズームは変わらない（noMove: true）。
- [ ] マップでエリアやソートを変えたあと、ポップアップの前/次は新しいフィルタ・ソート順のリストに沿って動く。

以上を満たせば、本タスクの実装は完了です。
