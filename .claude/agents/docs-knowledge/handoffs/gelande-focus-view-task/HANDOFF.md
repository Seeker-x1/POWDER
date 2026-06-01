# [HANDOFF] ゲレンデフォーカスビュー・タスク（Gelande Focus View Task）

**from**: `product-ux`  
**保存日**: 2026-03-28  
**最終更新**: 2026-03-28（正本モックを **mock-015** に更新。段取りは [ROADMAP-mock015-by-agent.md](./ROADMAP-mock015-by-agent.md)）  
**フォルダ**: `.claude/agents/docs-knowledge/handoffs/gelande-focus-view-task/`

---

## タスクの位置づけ

- **和名**: ゲレンデフォーカスビュー・タスク  
- **画面状態（案）**: `FocusView_FromRanking` — トップランキング等の一覧から **一発で** 特定ゲレンデにフォーカスした直後のビュー。  
- **タスク定義（詳細）**: `.claude/agents/product-ux/gelande-focus-view-task.md`
- **エージェント分担・フェーズ段取り（mock-015）**: [ROADMAP-mock015-by-agent.md](./ROADMAP-mock015-by-agent.md)
- **architecture 観点（依存/再発防止）**: [architecture.md](./architecture.md)

**本タスクの「正」UI**: **mock-011 系**（薄マップ帯 + シート主体、L1/L2/L3、タイトル横の小さな「次 →」）。  
**カレント HTML は mock-015**（014 をベースに frontend-design 適用・暦日チップ `.day-chip__cal` 等）。英語制度は引き続き mock-013 由来。014 は `mock-archive/mock-014.html`、013 は `mock-archive/mock-013.html`。

**別経路**: マップピン → 大型ボトムシート案は `mock-archive/mock-012.html` およびフラット Handoff `handoffs/2026-03-28-product-ux.md` を参照。実装時は経路ごとにテンプレを混ぜないこと。

---

## 会話の要約（本タスクに取り込んだ決定）

1. 現状スクショは **ランキングからの一発フォーカス**に近い。マップ全面主役ではなく **mock-011** に制度を寄せる。  
2. ターゲット B の 3 秒判断・積雪の即読性・操作優先の問題は、**011 の glance 帯 + 帯レジェンド + 固定幅スロット**で吸収（詳細は mock 注釈）。  
3. 項目 1〜6（薄マップ・小「次」・B/A 等）は **一旦許容**。  
4. 項目 7（英語）のみ **mock-013** で設計し直し（`lang="en"` で CSS 変数・2 行クランプ・`aria-label` 完全形 等）。  
5. 本名称でタスク化し、本フォルダに Handoff を集約。
6. 実機スクショで **上部に大きな空白帯**が発生。ユーザー指摘により「モックは全画面前提で検証できるもの」に運用を改める。

---

## 緊急指摘（ブロッカー）— 上部余白

- 現状スクショで、フォーカスビュー上部に **意味のない空白領域**が発生している。  
- これは「薄マップ帯（72px）」の設計意図を壊し、**情報の第一視認を遅らせる重大なUI欠陥**。  
- 本タスクではこれを **P0 ブロッカー**として扱う。

### 受け入れ条件（上部余白）

1. FocusView_FromRanking の先頭は `map-strip`（意図した高さ）で始まり、**その直後に `sheet` が接続**される。  
2. 画面上端から最初のUI要素までに、仕様外の空白（黒帯）が出ない。  
3. シート開閉中も同欠陥が再発しない（初回表示・再表示の両方）。  
4. モック比較は **全画面（デバイス相当）**で実施し、部分切り出しだけで合格にしない。

---

## 緊急指摘（ブロッカー）— はみ出し・切れ（Overflow）

- 最新スクショで、UIの複数箇所に **切れ / はみ出し / 余白不足**が見える。  
- 本タスクではこれを **P0 ブロッカー**として扱う（上部余白と同格）。

### 受け入れ条件（Overflow）

1. `.map-focus-screen` 内の主要ブロック（`l1-head` / `b-glance` / `day-chips` / `tl-scroll` / CTA群）は **左右に欠けない**。  
2. 見出し・行頭テキスト（例: 「車で近いゲレンデ（今日の予報）」）が **左端でクリップされない**。  
3. タイムスロット列はスクロール可能でも、**コンテナ外に常時はみ出さない**（意図した範囲のみ横スクロール）。  
4. 下部CTA行（`詳細確認` / `Googleマップ` / `公式`）は **全ボタンが同一高さ・同一行内に収まる**。  
5. 320px幅・390px幅で再現しない（両方で確認）。

---

## 成果物パス（カレント）

| 種別 | パス |
|------|------|
| **カレントモック** | `.claude/agents/product-ux/mock-015.html` |
| mock-014（アーカイブ・015 の直前版） | `.claude/agents/product-ux/mock-archive/mock-014.html` |
| mock-013（アーカイブ） | `.claude/agents/product-ux/mock-archive/mock-013.html` |
| 参照 mock-011（アーカイブ） | `.claude/agents/product-ux/mock-archive/mock-011.html` |
| マップ大型シート案（アーカイブ） | `.claude/agents/product-ux/mock-archive/mock-012.html` |
| 画面フロー | `.claude/agents/product-ux/screen-flow.md` |
| タスク定義 | `.claude/agents/product-ux/gelande-focus-view-task.md` |
| 本番の当たり（索引） | `.claude/agents/architecture/touch-points.md` |

---

## フロー（ランキング → フォーカス）

```text
[ランキング一覧]
  └ 行タップ（一発）
       └ ゲレンデフォーカスビュー（薄マップ帯 + シート）
            ├ L1: 閉じる（FAB）· 地名 · 小「次 →」（一覧の次候補）
            ├ B: glance 帯（雪一行 · 雨バッジ）· 日付チップ
            ├ A: L2 数値ブロック（トグルで表示）
            └ L3: レジェンド + 固定幅スロット横スクロール（長文はスロット外）
```

**操作優先（本タスク）**: 閉じる → 対象日 → B/A → 次の候補。

---

## 状態機械・経路（本番方針）

| 呼称（案） | 流入 | 正とするモック | 本番での扱い |
|------------|------|----------------|--------------|
| `FocusView_FromRanking` | トップランキング等・一覧行タップ | **mock-011 / mock-013** | **011/013 型テンプレ専用**。012 型 DOM と混在させない。 |
| `FocusView_FromMap`（仮） | マップピンタップ | **mock-012 系は別案**（アーカイブ） | 現行は `selectResort` ＋ `#map-detail-sheet` が近い。**経路でテンプレ分岐**するか、別関数・別ルート HTML に分離する（**実装時に確定**）。 |

**リスク（混在禁止の理由）**: 現状モバイル地図詳細は `selectResort` が **単一の `contentHtml`** に日付帯・時間帯バー等を載せており、見た目が 012 に近くなりやすい。ランキング経路で 011/013 を載せる場合、**同一 DOM に両テンプレを足し込まない**こと。

---

## 本番コードの当たり（リポジトリ直下 `ski-powder-hunter.html`／EN は同構造）

実装前の索引。**行番号は変動しうる** — 関数名・ID で grep すること。

| 領域 | 当たり |
|------|--------|
| リゾート詳細の組み立て | `selectResort(id, opts)` — `contentHtml` 生成、モバイルは `#map-detail-sheet-body` へ `innerHTML` |
| シート開閉 | 同一関数内 `openDetailUi`（閉じる: `closeResortPopup`） |
| デスクトップポップアップ | `L.popup(...).setContent(contentHtml)` |
| グローバル日付 | `targetDayOffset`、`setTargetDayOffset(offset)`（0〜6） |
| 地図内日付タブ（現行） | `selectResort` 内 `dayStripHtml`（`.popup-day-strip--scroll` / `.popup-day-tab`） |
| 時間帯バー（現行） | `selectResort` 内 `hourlyHtml`（`.popup-hourly-strip` / `.popup-hourly-bar`） |
| 静的 DOM（シート） | `#map-detail-sheet`, `#map-detail-scrim`, `#map-detail-sheet-body` |
| ランキング → 地図 | `scrollToCard`、TOP カード／リストのタップハンドラ（フォーカス遷移の差し込み点） |

**Focus View 新設時（未決定・要設計）**: 薄マップ帯＋シートの **ルートラッパ**を `#view-map` 内に追加するか、既存 `#map-detail-sheet` を **経路別に差し替え**るか。詳細は implementer と product-ux で確定後、`touch-points.md` を更新する。

---

## 未解決（優先度）

| 優先度 | 項目 | 想定担当 |
|--------|------|----------|
| **P0** | 上部余白（map-strip と sheet の間/前に不要空白が出る） | implementer / product-ux |
| **P0** | はみ出し・切れ（Overflow） | implementer / product-ux |
| **P0** | ゴー/リスクの算法と文言 | snow-data / 実装 |
| **P1** | B/A の永続・自動判定の要否 | product-ux / 実装 |
| **P2** | 薄マップ帯からの「マップ全画面」導線の有無 | product-ux |

---

## 完了条件（DoD）案

- **JA**: 視覚・操作が `mock-archive/mock-011.html`（および注釈）と整合するチェックリストを満たす（L1/L2/L3、小「次」、固定幅スロット・レジェンド）。
- **EN**: `mock-015.html` の `lang="en"`（013 制度：`--slot-w`、2 行ラベル、雨バッジ折返し、`labelShort` / `labelAria`）を満たす。
- **A11y**: `mock-015.html` のタッチ目安（44px 系）・`--muted-caption`・`prefers-reduced-motion` を本番で再現する（数値は実測で確定可）。
- **暦日**: チップの `.day-chip__cal` 相当が本番 DOM にあり、欠落しない（map-view-correction **MVC-17**）。
- **日付チップの表示契約**: 各 `.day-chip` は「相対ラベル + `.day-chip__cal` + `strong`（`N cm` / `—`）」の **3要素**で構成し、`❄N` のような snow emoji 付表記は入れない（mock-015 準拠）。**欠損時のみ** `—`、0 は `0 cm`。
- **日付チップ数**: FocusView_FromRanking は **今日〜+4の5チップ**で表示する（mock-015 準拠）。
- **温度チャート非表示**: FocusView_FromRanking は `tl-legend` / `tl-scroll` までで完結し、`tempChartMobile` 相当の温度グラフは表示しない（mock-015 準拠）。
- **上部余白なし**: `map-strip` より上、および `map-strip` と `sheet` の間に仕様外の空白帯がない（全画面確認）。
- **Overflowなし**: 見出し・カード・CTAの左右欠け、下端切れ、想定外スクロールがない（320/390 幅確認）。
- **経路**: `FocusView_FromRanking` で **012 型大型シートテンプレと DOM 混在がない**（コードレビューで確認）。
- **本番変更**: ワークスペース **implementer ゲート**済み。

---

## 次 Handoff・担当（目安）

| 担当（目安） | 渡す内容 |
|--------------|----------|
| **snow-data** | P0 算法・コピー、API／キャッシュとの接続 |
| **implementer** | `selectResort` 分岐・新シェル DOM・**mock-015** トークン／タッチ／暦日チップ移植 + 上部余白解消（ゲート遵守） |
| **qa-accessibility** | `aria-label` 完全形、フォーカス順、シート／FAB |
| **product-ux** | B/A 仕様確定、DoD チェックリストの最終調整 |

進行スナップショットは本フォルダに `YYYY-MM-DD-<from>.md` を増やしてもよい（`README.md` 参照）。

---

## 英語版（mock-013）制度（要約）

- `lang="en"` で `--slot-w` 拡張、スロットラベルは **最大 2 行** + `hyphens` / `overflow-wrap`。  
- JA は **1 行 ellipsis**（011 互換）。  
- 施設名 **2 行クランプ**（両言語）。  
- EN 雨バッジは **折り返し全幅**。  
- データ: `labelShort`（UI）と `labelAria`（読み上げ）分離。

---

## mock-014（QA アクセシビリティ差分・2026-03-28）

**前提**: `mock-archive/mock-013.html` と **同一の画面ゴール・i18n・B/A トグル**。別物の「マップクローム比較モック」ではない。

| 項目 | mock-013 基準 | mock-014 での追記 |
|------|----------------|-------------------|
| 閉じる FAB | 40×40 | **44×44**、flex 中央寄せ |
| 「次 →」 | `min-height: 30px` | **`min-height: 44px`**、`inline-flex` 中央寄せ |
| 日付チップ | 従来パディング | **`min-height: 44px`** + `flex` 縦積み |
| 補助テキスト | `var(--muted)` 相当 | **`--muted-caption: #b8c8dc`** をメタ・L2・凡例・スロットラベル・チップ1行目に適用（本番は背景ごと **コントラスト実測**） |

**本番への写し先（目安・`ski-powder-hunter.html`）**: `.fv-close-fab`、`.fv-btn-next-sm`、`.fv-day-chip`、`.fv-l1-meta` / `.fv-l2` / `.fv-tl-legend` / `.fv-tl-slot__label` 等。トークン名は実装側で既存 `--fv-muted` と統合してよい。

**レビュー経緯**: `qa-accessibility` が挙げたタッチ・コントラストを、**013 の構造を壊さず**モックに落とした版。

---

## mock-015（カレント・2026-03-28）

**前提**: mock-014 をアーカイブし、**014 の DOM／i18n／B/A を継承**。追加は主に次のとおり（詳細はモック注釈）。

| 項目 | 内容 |
|------|------|
| 深度・モーション | マップ帯のレイヤー／シートの ease-out 入場／ホバー・フォーカス（`prefers-reduced-motion` 対応） |
| 暦日 | `.day-chip__cal`（Space Mono）＋降雪 `strong` の 3 段チップ |
| 運用 | 本番合わせの段取りは [ROADMAP-mock015-by-agent.md](./ROADMAP-mock015-by-agent.md) |

---

## 本番実装フェーズ（概要）

詳細は `.claude/agents/product-ux/gelande-focus-view-task.md` の「本番実装フェーズ」を参照。

1. **P0 経路分離** — ランキングタップとマップピンでテンプレ／分岐を分ける。  
2. **P1 シェル DOM** — 薄マップ帯＋シートのルート。  
3. **P2 L1/L2/L3** — mock 準拠のブロック移植（012 と共有しない）。  
4. **P3 i18n** — EN は mock-015（013 制度）。  
5. **P4 a11y** — mock-015 の 44px・`--muted-caption`・reduced-motion を本番 CSS に反映。  
6. **P5 データ** — P0 未解決の算法・文言。  
7. **段取り詳細** — [ROADMAP-mock015-by-agent.md](./ROADMAP-mock015-by-agent.md) のフェーズ 0–5。

---

## [HANDOFF] ブロック（実装・他エージェント向け）

```text
[HANDOFF]
from: product-ux
task: ゲレンデフォーカスビュー・タスク（gelande-focus-view-task）
決定事項:
  - ランキングからの一発フォーカスは mock-011 系を正とする（薄マップ帯・シート・L1/L2/L3・タイトル横の小「次 →」）。
  - 英語 UI は mock-013 由来の lang 別トークン・2 行ラベル・aria 完全形に従う（カレント HTML は mock-015）。
  - mock-015 は mock-014 を土台に、深度・モーション・暦日チップ（.day-chip__cal）等を足した版。エージェント分担は ROADMAP-mock015-by-agent.md。
  - マップ経路の大型ボトムシート（mock-012）は別テンプレ。同一 DOM に混在させない。
設計意図:
  - B は glance と帯色で即判断。A は L2 で密度。タイムラインは短ラベル + レジェンドで重なりを作らない。
  - 補助文は読み取りやすいトークンで統一し、主要操作は 44px タップ目安に寄せる。
モックファイル: mock-015.html（カレント）／mock-archive/mock-014.html／mock-archive/mock-013.html
本番当たり: 本ファイル「本番コードの当たり」＋ architecture/touch-points.md
未解決（優先度）:
  - P0: ゴー/リスクの算法と文言（snow-data / 実装）。
  - P1: B/A の永続・自動判定の要否。
  - P2: 薄マップ帯からの「マップ全画面」導線の有無。
実装エージェントへの指示:
  - 本番は implementer ゲートで依頼。DOM/スタイルの基準は mock-015（ROADMAP-mock015-by-agent.md のフェーズ順）。
  - 実装順は本ファイル「本番実装フェーズ」に従う。P4 で a11y トークンを本番 CSS に反映。
```

---

## メタ

- 以降、**本タスクの Handoff の追加・更新は本フォルダ内**にファイルを増やすか `HANDOFF.md` を更新する運用とする。  
- 汎用 product-ux 記録: `../2026-03-28-product-ux.md`（マップ経路の初版メモ）。
