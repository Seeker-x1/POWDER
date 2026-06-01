# マップビュー：降雪予測レイアウト実装指示書

## 1. 目的（完成イメージ）

- **表示名**: 気象庁メッシュの ON/OFF 帯を、ユーザー向けには **「降雪予測」** として扱う（提案画像 `map-view-yuki-yosoku-compact-row.png` 参照）。
- **レイアウト**: モバイル（`max-width: 700px`）で  
  - **地図より上のクローム**を薄くし、**地図が主役**になること。  
  - **降雪予測**行は **1 行のみ**（`降雪予測` ラベル + `OFF` / `今後3h` / `今後6h` を **横一列**、コントロールは **やや小さめ**）。  
  - **JMA 直下の注釈**（現状 `.jma-snow-note`）は **表示しない**。
- **データソース**: 既存の JMA メッシュタイル（`3h` / `6h`）ロジックはそのまま利用可能。**値 `""` / `"3h"` / `"6h"` と `name="jma-snow-kind"` は維持**すれば、フロントの取得・レイヤー切替は流用できる。

## 2. 実装可能性（現行コード）

**可能。** 対象は主に次のファイル。

| 対象 | 内容 |
|------|------|
| `ski-powder-hunter.html` | マップ用クローム DOM、`#jma-toggle` 周り CSS、注釈の表示制御 |
| `ski-powder-hunter-en.html` | 同上（英語ラベル） |

**変更不要でよい（原則）**

- `jmaSnowKind`、タイル URL、Leaflet レイヤー、`value=""` / `"3h"` / `"6h"` のラジオ値。  
- 文言だけ「降雪予測」に寄せ、**内部変数名・ストレージキーは既存のまま**でよい（リネームは別タスク）。

**注意**

- 注釈を消すと、**データの出所・メッシュの意味**が画面上に出なくなる。必要なら **別途**（初回ツールチップ、設定、ヘルプ、`title` 属性など）で補うか判断する。

## 3. DOM 変更（マップ用 `#jma-toggle`）

**現状（抜粋）**

```html
<div id="jma-toggle" class="map-overlay-toggle jma-toggle-stack">
  <div class="jma-toggle-radios">
    <label>…OFF…</label>
    …
  </div>
  <p class="jma-snow-note">※気象庁メッシュ表示（3h/6h積算）</p>
</div>
```

**指示**

1. `.jma-toggle-radios` の **先頭**に、見出し相当の要素を追加する。  
   - 例: `<span class="snow-forecast-toggle__title" id="snow-forecast-toggle-heading">降雪予測</span>`  
   - `role="group"` と `aria-labelledby="snow-forecast-toggle-heading"` を付与してよい。
2. **ラジオの `value` は変更しない**（`""` / `3h` / `6h`）。
3. `.jma-snow-note` は **削除**するか、**モバイルのみ非表示**（`display:none`）にする。  
   - デスクトップのみ残す、など分岐も可（要デザイン判断）。
4. `label` 内の文言 **「今後3h」「今後6h」** は維持。`title` は「気象庁メッシュ…」のままでも、「降雪予測・3時間積算」などに揃えてもよい。

## 4. CSS 変更（`@media (max-width: 700px)` 中心）

**現状の問題**: `#jma-toggle` 周りで `label` に `min-height:40px`・背景・`flex:1` が当たり、**太いセグメント**になっている（`.map-overlay-toggle label` のモバイルルール）。

**指示**

1. **`#jma-toggle` にだけ**スコープしたルールに置き換える（他オーバーレイがあれば干渉しないように）。  
2. **降雪予測行**  
   - `.jma-toggle-radios`（または新クラス）を `display:flex; flex-direction:row; align-items:center; flex-wrap:nowrap; gap:…; min-width:0; overflow-x:auto` などとし、**1 行に収める**。狭い幅では **横スクロール**可。  
   - タイトル「降雪予測」は `flex-shrink:0`、各 `label` は `flex:0 0 auto`。  
   - **セグメント風をやめる**: `min-height:40px` や大きな `padding` / 角丸背景を **降雪予測ブロックでは撤廃**。  
   - `input[type="radio"]` は `width`/`height` を **14–16px** 程度、`accent-color: var(--accent)` で統一。  
   - フォント **10–11px** 程度に下げ、**横一列に収める**ことを優先。
3. **コンテナ** `#jma-toggle.map-overlay-toggle`  
   - `padding` を **4px 8px 前後**に抑え、`border-radius` は維持またはやや小さく。  
   - **下に注釈がない**前提で、`.jma-toggle-stack` の `padding-bottom` を必要なら削減。
4. **`.map-mobile-chrome`**  
   - `gap` / 各ブロックの `margin` を見直し、**上段の合計高さを抑える**（目安: 地図が **約 60% 以上**の高さを取れること。厳密な % は端末依存のため **比率より flex で地図 `flex:1`** を推奨）。
5. **`#map` と `.view-map`**  
   - マップが **残り高さをすべて使用**するよう、既存の `flex` / `min-height` を確認。`#map` に `flex:1; min-height:0` 等が未適用なら追加（親の `flex` 列に合わせる）。

## 5. デスクトップ（`min-width: 701px`）

- `#jma-toggle` は引き続き **右上フローティング**。  
- 同じ DOM にする場合、**タイトル「降雪予測」**を入れた **1 行構成**に揃えるか、デスクトップのみ **折りたたみ**は不要。  
- 注釈 `.jma-snow-note` を完全削除する場合は **デスクトップでも消える** — 問題なければ削除、残すなら **モバイルのみ非表示**のクラスを付与。

## 6. 英語版 `ski-powder-hunter-en.html`

- タイトル例: **「Snow forecast」** または **「Forecast layer」**。  
- 注釈を消す場合は日本語版と同様。  
- ラジオ文言は既存の `Next 3h` / `Next 6h` または短縮表記でよい。

## 7. JavaScript

- **イベント・値**: `jma-snow-kind` の変更リスナはそのまま。  
- **文言置換**: 動的に「JMA」と出している箇所があれば（ポップアップ・ログなど）、プロダクト方針に合わせて **降雪予測** 表記に寄せる（任意・別チケット可）。

## 8. 受け入れ条件（チェックリスト）

- [ ] モバイル幅で **降雪予測 + OFF + 今後3h + 今後6h** が **1 行**（はみ出す場合は **横スクロール**でよい）。  
- [ ] **JMA 下の注釈**が仕様どおり **出ない**（または出す場合は仕様で明示）。  
- [ ] **地図**が画面下半分を大きく占め、**下端まで**表示される（スクロールで地図だけが切れないこと）。  
- [ ] `3h` / `6h` 選択時に **従来どおり**メッシュが表示される。  
- [ ] タップしやすさ: 極端に小さくしすぎて **誤操作**が多くなっていないか実機確認。

## 9. 参考ファイル（提案画像）

- `docs/mobile-ux-images/map-view-yuki-yosoku-compact-row.png`

---

**結論**: 現行の HTML/CSS と JMA タイル処理のまま、**DOM の軽い追加・CSS の差し替え・注釈の非表示**で実装可能。厳密な「上 40% 未満」は端末依存のため、**flex で地図を `flex:1`** に寄せる実装を推奨する。
