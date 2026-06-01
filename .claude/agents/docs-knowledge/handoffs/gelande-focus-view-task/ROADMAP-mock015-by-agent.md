# mock-015 準拠 UI への段取り（エージェント役割分担）

**正本 UI（見た目・DOM 意図）**: `.claude/agents/product-ux/mock-015.html` の **`.device-screen` 内のみ**（注釈列は検証用）。  
**経路**: **A案** — ランキング行タップ → `FocusView_FromRanking`（薄マップ帯＋シート）。マップピンは **別テンプレ／分岐**（012 型と混在禁止）。  
**本番編集**: **`implementer` スレッド**で `ROLE: implementer` ＋ `実装して`（workspace ルール）。

---

## エージェントと役割（RACI 風）

| エージェント | R / A / C / I | 担当 |
|--------------|---------------|------|
| **product-ux** | **A**（UI 正本） / **C** | mock-015 と本番の **見た目・ブロック順・文言**の突合。差分は **チャット or Handoff 追記**（本番には直接編集しない）。必要なら **次連番モック**で DOM 追補。 |
| **implementer** | **R**（本番コード） | `ski-powder-hunter*.html` / `scripts/` の **唯一のツール編集者**。フェーズごとに Handoff／本 ROADMAP を入力に差分を出す。 |
| **architecture** | **C** | `touch-points.md` の **当たり・索引**更新。`selectResort` 分岐・新ラッパ・ID 変更の **設計メモ**を短く残す。 |
| **snow-data** | **C** | 日付チップ・タイムライン・ラベルに必要な **データ契約**（`labelShort` / `labelAria`、暦日フィールド等）。実装と食い違う場合は辞書・境界テスト側を更新提案。 |
| **qa-accessibility** | **C** / **I** | mock-015 注釈の **44px・コントラスト・reduced-motion** を本番 CSS で満たすかレビュー。チェックリストをチャット or Handoff に返す。 |
| **docs-knowledge** | **I**（任意） | Handoff の日付・リンク整理、`decision-log` への一行追記が必要ならユーザー指示に従う。 |

※ **A（Accountable）** は各フェーズの「受け入れに答える人」。UI は **product-ux**、動く本番は **implementer**。

Architecture 観点の補助メモ: [architecture.md](./architecture.md)

---

## フェーズ段取り（順番固定）

### フェーズ 0 — 合意の固定（全員・テキストのみ）

- **目的**: 正本パスと「混在禁止」を再確認。  
- **product-ux**: `mock-015` を正として宣言（暦日 `.day-chip__cal` を含む）。  
- **architecture**: `touch-points.md` の「未実装」注記と本 ROADMAP を相互リンク。  
- **成果物**: 本ファイルを参照する一言を `gelande-focus-view-task.md` または `HANDOFF.md` に残す（済）。

---

### フェーズ 1 — 経路分岐（P0）

- **目的**: ランキングタップとマップピンで **別テンプレ or `selectResort(id, opts)` の `opts` 分岐**を入れる。同一 `contentHtml` に 011 と 012 を足し込まない。  
- **implementer**: 分岐の実装（最小差分）。  
- **architecture**: 触った関数・`opts` キー名を `touch-points.md` に追記。  
- **product-ux**: 分岐後も **ランキング側が mock `.device-screen` と同じブロック順**になる見込みかレビュー。  
- **DoD**: ランキングから開いたときだけ **薄マップ帯＋シート**用のルートに流せる（中身は空でも可）。

---

### フェーズ 2 — シェル DOM（P1）

- **目的**: 72px 帯・FAB・`.sheet`・`.l1-head`（タイトル・メタ・小「次 →」）を mock-015 に合わせる。  
- **implementer**: `#map-detail-sheet` 再利用 or 専用ラッパ — Handoff の方針に従い **DOM を組む**。  
- **product-ux**: mock-015 と **ピクセル／トークン**の突合（スキル由来の影・アニメは「あればよい」で必須度は要約）。  
- **DoD**: ランキング経路で **モックと同じ L1 シェル**が見える。`map-strip` の前後に **不要な上部余白がない**。

---

### フェーズ 3 — L1 中身・B 帯・日付チップ（P2 前半）

- **目的**: `.b-glance`（雪一行・雨バッジ）・`.day-chips`（**相対＋暦日＋降雪行**）をデータ接続。  
- **implementer**: `dayStripHtml` 等の置換。  
- **snow-data**: 暦日・降雪の **フィールド定義**を固定（欠損時の表示規則）。  
- **product-ux**: チップ 3 段構造が mock と一致するか。  
- **DoD**: マップビュー補正 **MVC-17**（暦日）を満たす（Handoff 参照）。

---

### フェーズ 4 — L2 / L3（P2 後半）

- **目的**: A 相当の `.l2`、タイムライン `.tl-legend` + `.tl-scroll`（固定幅スロット・帯色）。  
- **implementer**: 既存 `hourlyHtml` 等から **mock セマンティクス**へ寄せる（長文はスロット外）。  
- **snow-data**: スロット `band` / `labelShort` / `labelAria`。  
- **product-ux**: mock-015 EN 切替と **2 行ラベル**の確認。  
- **DoD**: B でも L3 が見える（MVC-08 相当）。

---

### フェーズ 5 — i18n・仕上げ（P3–P4）

- **目的**: `ski-powder-hunter-en.html` で **`lang="en"` 時の `--slot-w`・バッジ折返し**等。  
- **implementer**: EN ファイル同期。  
- **qa-accessibility**: タッチ 44px、`prefers-reduced-motion`、コントラスト。  
- **product-ux**: `map-view-correction-task` の **MVC 一覧**をチェックリストで潰す。  
- **DoD**: ランキング経路が mock-015 と **受け入れ可能な一致**（残差は Handoff「未解決」に明示）。

---

## セッションの切り方（運用）

1. **設計・疑義**: `product-ux` / `architecture` / `snow-data`（本番にツールを向けない）。  
2. **実装タスク**: ユーザーが **`ROLE: implementer` + `実装して`** のメッセージで依頼し、入力に **本 ROADMAP のフェーズ番号**と `HANDOFF.md` を添える。  
3. **モック更新**: `product-ux` が **mock-archive 手順**で連番のみ（本番は触らない）。

---

## 実装工程の詳細（フェーズごとの具体手順）

以下は **本番に手を入れる前〜各フェーズ完了まで**の流れを、作業単位に分解したもの。実コード変更はすべて **implementer ゲート**後に行う。

### 実装に入る前（共通）

1. **正本を開く**  
   ブラウザで `mock-015.html` の `.device-screen` を見ながら、ブロック順を頭に入れる（map-strip → sheet → l1-head → b-glance → day-chips → l2 → tl-legend → tl-scroll）。

2. **本番の当たりを grep**  
   `ski-powder-hunter.html` で `selectResort`、`openDetailUi`、`map-detail-sheet-body`、`dayStripHtml`、`hourlyHtml`、`scrollToCard` を検索し、**どこから `contentHtml` が流れ込むか**を把握する（索引は `architecture/touch-points.md`）。

3. **分岐の「旗」を決める（フェーズ1の設計メモ）**  
   例: `selectResort(id, { focusView: 'ranking' })` のような **オプション名**、またはランキング側だけが呼ぶ **薄いラッパ関数**（`openFocusFromRanking(id)`）を経由するか。  
   **決めたら** `touch-points.md` に1段落書く（後から読めるようにする）。

4. **implementer 依頼文の型**  
   同一メッセージに: `ROLE: implementer` / `実装して` / 「ROADMAP フェーズ N」/ `HANDOFF.md` へのパス参照 / このフェーズの DoD。

---

### フェーズ 1 — 経路分岐（具体）

| ステップ | 内容 |
|----------|------|
| 1a | **ランキング行タップ**のコールバックを特定（`scrollToCard` 後に `selectResort` を呼んでいる箇所など）。 |
| 1b | その呼び出しにだけ **「ランキング経路」フラグ**を付与する（上記オプション or 専用関数）。 |
| 1c | `selectResort` 内でフラグを見て、**モバイル用 `contentHtml` を組まない早い return** でもよいが、通常は **別テンプレ文字列**（当面プレースホルダーで可）を `#map-detail-sheet-body` に流す分岐を入れる。 |
| 1d | **マップピン**側の `selectResort` 呼び出しは **フラグなし**のままにし、現行 UI を維持（ここで 012 型を壊さない）。 |
| 1e | 手元検証: ランキングタップ → プレースホルダーでも「マップ経路と中身が違う」ことを確認。マップピン → 従来どおり。 |
| 1f | **architecture**: `touch-points.md` に「`opts.focusView`（仮名）の意味」「どの呼び出しが true」を追記。 |

**完了の目安**: コード上で二本の経路が読み分けられ、ランキング側に **mock 用の空シェル**を載せられる状態。

---

### フェーズ 2 — シェル DOM（具体）

| ステップ | 内容 |
|----------|------|
| 2a | **72px マップ帯**を `contentHtml`（またはテンプレ関数）の先頭に出力。Leaflet の実タイルを埋め込むか、現状は **グラデ＋疑似テクスチャの div** でよい（mock-015 に寄せる）。 |
| 2b | 帯の右上に **閉じる FAB**（44×44 目安）。既存 `closeResortPopup` にバインド。 |
| 2c | 帯の下に **`.sheet` 相当のラッパ**（本番では `class` 名を BEM で `fv-*` 等にしてもよいが、**ブロック順は mock と同じ**）。 |
| 2d | **L1**: 施設名（2行クランプ用の CSS）、メタ行（北海道・標高）、右端 **小「次 →」**（ランキングの次候補へ。未接続ならボタン disabled でも可）。 |
| 2e | **CSS**: `@media (max-width:700px)` 内に mock-015 のトークン（`--accent` 等）を **本番変数と衝突しない名前**で追加するか、既存変数にマップする（implementer 判断）。 |
| 2f | **product-ux**: スクリーンショット or 並べて mock-015 と **帯の高さ・角丸・余白**を突合。特に **上端から map-strip までの空白**を0にする。 |
| 2g | **実装側の技術チェック**: `#map-detail-sheet` / `__scroller` / `__handle` / `padding-top` / `min-height` / `transform` の初期値を確認し、`map-focus-screen` 時だけ余白原因のスタイルを無効化する。 |
| 2h | **Overflowチェック（P0）**: `.sheet` / `.popup-nearby` / `.popup-btns` の左右padding・width計算を確認し、行頭テキストとCTAが欠けないよう `box-sizing` と `overflow-x` を調整。 |

**完了の目安**: ランキング経路だけ、**タイトルまで見える「から壳」**が完成。

---

### フェーズ 3 — B 帯・日付チップ（具体）

| ステップ | 内容 |
|----------|------|
| 3a | **`.b-glance` 相当**: 左アイコン（雪）、中央に「当日／前日」の一行＋数値（Space Mono）、右に **雨バッジ**（データが無い場合はプレースホルダー or 非表示ルールを snow-data と合意）。 |
| 3b | **日付チップ**: 各チップ **3要素** — 相対ラベル（今日／明日…）、**暦日**（`.day-chip__cal` 相当）、**降雪行**（`N cm` / `—`）。snow emoji 付表記（`❄N`）は入れない。**欠損時のみ** `—`、0 は `0 cm`。FocusView_FromRanking は **今日〜+4の5チップ**表示で mock-015 と同じ挙動になるよう `setTargetDayOffset` と接続。 |
| 3c | **snow-data**: 暦日は **クライアントで offset から算出**か **API から日付文字列**かを決め、欠損時の表示を1行で Handoff に残す。 |
| 3d | **検証**: チップタップで日付が切り替わり、**暦日が消えない**（MVC-17）。 |

---

### フェーズ 4 — L2 / L3（具体）

| ステップ | 内容 |
|----------|------|
| 4a | **L2（A モード）**: mock の3行サマリー。本番では **注釈トグルに相当する UI** をデバイス内に置くかは product-ux と合意（モックは注釈外トグル）。合意した操作で `hidden` を切替。 |
| 4b | **凡例** `.tl-legend`: 前日／当日／翌朝の色帯説明。 |
| 4c | **スロット行** `.tl-scroll`: 固定幅・横スクロール、各スロット先頭に **帯色**（`band-prev` 等）、ラベルは **1行 ellipsis（JA）**。既存 `hourlyHtml` のマークアップを **置換または二系統化**（ランキング経路だけ新マークアップ）。 |
| 4d | **snow-data**: 各スロットの `labelShort` / `labelAria` / `band` をどこから組むか確定。 |
| 4e | **検証**: B のときも **L3 が見える**（スクロールで隠れないことが多いので、ビューポート内に収まるか確認）。あわせて FocusView では **温度チャートが表示されない**ことも確認。 |
| 4f | **はみ出し再検証**: 320px / 390px で `day-chips` / `tl-scroll` / CTA行の欠け・重なり・横はみ出しがないことを確認。 |

---

### フェーズ 5 — i18n・仕上げ（具体）

| ステップ | 内容 |
|----------|------|
| 5a | `ski-powder-hunter-en.html` に **同じ DOM 構造**を反映（差分は文言・`lang` 属性）。 |
| 5b | EN 時のみ **スロット幅・2行ラベル・雨バッジ折返し**の CSS を mock-015 に合わせる（`[lang="en"]` またはルートクラス）。 |
| 5c | **qa-accessibility**: 主要ボタン 44px、`prefers-reduced-motion`、フォーカスリング、主要 `aria-label`（スロットの完全形など）。 |
| 5d | **map-view-correction-task** の MVC 一覧を上から潰し、残りを Handoff「未解決」に記載。 |

---

### フェーズ横断の注意

- **1 PR = 1 フェーズ**を推奨（レビューとロールバックが容易）。  
- **データ算法（ゴー/リスク）**が未決のままでも、フェーズ2–4は **プレースホルダー文言**で進められる。決まったら差し替えのみ（snow-data 連携）。  
- **本番以外**の更新: フェーズ完了ごとに `touch-points.md` と、必要なら `HANDOFF.md` に「完了: フェーズ N」と1行。
- **モック確認の形式**: 以後のUI確認は **全画面表示（デバイス相当）**で実施。部分切り出し画像のみで合格判定しない。
- **最終確認幅**: 320px と 390px を必須。片方だけ通っても完了扱いにしない。

---

## 参照パス（共有用）

| 内容 | パス |
|------|------|
| 正本モック | `.claude/agents/product-ux/mock-015.html` |
| ゲレンデタスク | `.claude/agents/product-ux/gelande-focus-view-task.md` |
| Handoff | `.claude/agents/docs-knowledge/handoffs/gelande-focus-view-task/HANDOFF.md` |
| 本番索引 | `.claude/agents/architecture/touch-points.md` |
| マップ補正 MVC | `.claude/agents/docs-knowledge/handoffs/map-view-correction-task/HANDOFF.md` |

---

## メタ

- 作成: 会話に基づく段取り文書。フェーズ完了時に **DoD チェック**を Handoff に1行ずつ残すと追跡しやすい。
