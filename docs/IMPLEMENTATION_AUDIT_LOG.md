# 実装監査ログ（エージェント／指示書との照合）

**目的**: コード更新のたびに **何を実装したか**・**指示どおりか**・**違う場合は理由** を残し、別セッションのエージェントやリーダーが **差分レビューと回帰判断** に使えるようにする。

**運用ルール**

| ルール | 内容 |
|--------|------|
| **いつ書く** | マージ相当の変更が入るたびに **1エントリ追加**（小さな typo 修正のみは任意）。 |
| **誰が書く** | 実装エージェントまたはリーダー。**正本の指示書名・§** を必ず引用する。 |
| **必須フィールド** | 参照指示／変更ファイル／実装概要／適合判定／逸脱と理由／未検証・次アクション。 |
| **逸脱がない場合** | 「逸脱なし」と明記し、確認した受け入れ項目を箇条書き。 |

**関連ドキュメント**

- 固定ロードマップ: [`FIXED_ROADMAP_9ecbfe76.md`](FIXED_ROADMAP_9ecbfe76.md)
- 実装ブック: [`PROJECT_MOBILE_UI_REMEDIATION.md`](PROJECT_MOBILE_UI_REMEDIATION.md)
- 地図統合: [`IMPLEMENTATION_ORDER_MOBILE_MAP_UNIFIED.md`](IMPLEMENTATION_ORDER_MOBILE_MAP_UNIFIED.md)
- JMA 文言: [`IMPLEMENTATION_ORDER_JMA_SNOW_TOGGLE_LABELS.md`](IMPLEMENTATION_ORDER_JMA_SNOW_TOGGLE_LABELS.md)
- 日付案A: [`IMPLEMENTATION_ORDER_DATE_SELECTOR_5_SLIDE_OPTION_A.md`](IMPLEMENTATION_ORDER_DATE_SELECTOR_5_SLIDE_OPTION_A.md)

---

## エントリテンプレート（コピー用）

```markdown
### YYYY-MM-DD — [ID / 短い題名]

| 項目 | 内容 |
|------|------|
| **参照指示** | `ファイル名` §… |
| **担当** | （エージェント／人間／不明） |
| **変更ファイル** | `...` |

**実装概要**（3行以内）

**指示との適合**

| 受け入れ・要件 | 状態 | メモ |
|----------------|------|------|
| … | ✅ / ⚠️ / ❌ | … |

**逸脱・判断理由**

- （なし）または、逸脱内容、**なぜその実装にしたか**（例: アクセシビリティ、既存バグ修正、指示書の曖昧さの解釈）。

**未検証・フォロー**

- （例: 実機 390px スクショ未添付、リサイズ時マーカー再計算 など）
```

---

## 記録済みエントリ

### 2026-03-16 — No.2 A-2 `mobile-typography-tokens`（タイポ・コントラスト）

| 項目 | 内容 |
|------|------|
| **参照指示** | `PROJECT_MOBILE_UI_REMEDIATION.md` No.2 / 貼付指示書「No.2 — A-2」 |
| **担当** | コーディングエージェント（セッション記録ベース） |
| **変更ファイル** | `ski-powder-hunter.html`, `ski-powder-hunter-en.html`（`<style>` 内） |

**実装概要**

- **デスクトップは維持**: `:root` の `--text-dim:#8aa0b8` はそのまま。
- **モバイルのみ** `@media (max-width:700px){ :root{ --text-dim:#a3b4c9; } }` で補助色を一段明るく変更（JP/EN 同方針）。
- 極小ラベル等の **クラス単位の +1px** は、指示の「第二選択」として必要に応じて既存クラスに追加されている可能性あり（全体の font-size 一括増大はしていない方針）。

**指示との適合**

| 受け入れ | 状態 | メモ |
|----------|------|------|
| ≤700px で補助テキストの判読性向上 | ✅ | トークン上書きで広範囲に反映 |
| 主役 `--text` との階層維持 | ✅ | `--text` は未変更 |
| >700px の印象を大きく変えない | ✅ | メディアクエリ内のみ |
| JP/EN 同戦略 | ✅ | 両ファイルで同パターン |
| No.1 日付チップの破綻なし | ⚠️ | **コード上は**チップ専用の一律巨大化はしていないが、**見た目の最終確認はリーダー/実機推奨** |

**逸脱・判断理由**

- **数値の固定指定なし**: 指示書は「具体値は実装者がコントラストと階層を見て決定」のため、`#a3b4c9` は **合理的デフォルト**であり逸脱ではない（再調整の余地あり）。

**未検証・フォロー**

- 375/390/700px の **スクショ証跡**は本リポジトリに画像として保存されていない場合がある。

---

### 2026-03-16 — No.3〜6 B-1〜B-4（地図クローム・JMA・マーカー）

| 項目 | 内容 |
|------|------|
| **参照指示** | `PROJECT_MOBILE_UI_REMEDIATION.md` No.3〜6、`IMPLEMENTATION_ORDER_MOBILE_MAP_UNIFIED.md` §2、`IMPLEMENTATION_ORDER_JMA_SNOW_TOGGLE_LABELS.md` |
| **担当** | コーディングエージェント（セッション記録ベース） |
| **変更ファイル** | `ski-powder-hunter.html`, `ski-powder-hunter-en.html`, `docs/FIXED_ROADMAP_9ecbfe76.md`（§2 チェック） |

**実装概要**

- **B-1 / B-2**: `#view-map` 直下に `.map-mobile-chrome`（`#map-mobile-chrome`）を追加。モバイルで **1段目＝戻る＋検索**、**2段目＝`#jma-toggle`**。同一 `padding` でインナー幅を揃える。`.view-map.map-popup-open` では **`.map-mobile-chrome` ごと非表示**（個別3要素ではなく集約）。
- **B-3**: ラベルは JP `OFF` / `今後3h` / `今後6h`、EN `OFF` / `Next 3h` / `Next 6h`。注記は各指示書の1行。`name` / `value`（`3h`/`6h`）は変更なし。
- **B-4**: `createMarker` でモバイル時の `iconSize`/`iconAnchor` 拡大、`m-pin-inner--narrow` と CSS `@media (max-width:700px)` でピン・数値・cm 行を拡大。クラスタも同幅帯でサイズ調整。

**指示との適合**

| 要件 | 状態 | メモ |
|------|------|------|
| モバイル 2段クローム | ✅ | DOM 構造で固定 |
| 常時凡例なし（新規オーバーレイを足さない） | ✅ | `.map-overlay` は従来どおりモバイル非表示 |
| ポップアップ時に上部操作を隠す | ✅ | `.map-mobile-chrome` 一括 |
| JMA 文言・注記・value 不変 | ✅ | EN 注記は `※ JMA mesh (3h/6h accumulation)` 形式 |
| JP/EN 同構造 | ✅ | EN に `aria-label="Map controls"`（JP は日本語ラベル）— **言語差は許容範囲** |
| マーカー可読性・タップ | ✅ | 意図どおり拡大 |

**逸脱・判断理由**

1. **safe-area の padding 略記の修正**  
   - 初回に `padding` 4値指定で **左右 inset が入れ替わっていた**可能性があり、**`padding: 6px max(10px, env(safe-area-inset-right)) 0 max(10px, env(safe-area-inset-left))`** に修正。  
   - **理由**: CSS 略記は **上・右・下・左** の順のため、物理右に `inset-right`、左に `inset-left` が正しい。指示の「揃える」目的に合致するための **バグ修正**であり、仕様逸脱ではない。

2. **英語版 HTML で `#jma-toggle` が二重**になっていた件  
   - **片方を削除**し単一 ID に。  
   - **理由**: 指示の「同構造」かつ **HTML 妥当性（ID 一意）** のため。仕様追加ではなく不整合の解消。

3. **リサイズ時のマーカー寸法**  
   - `createMarker` 内の `innerWidth` は **マーカー生成時**の値。ウィンドウ幅を 700px をまたいで変えた場合、**再生成まで古いサイズ**のままになりうる。  
   - **理由**: 指示に「リサイズ時に refresh 必須」とは書かれていないため **未実装**は逸脱ではないが、**既知制約**として記録。

**未検証・フォロー**

- 390px 付近の **スクショ証跡**（提出物）はリポジトリ外の可能性。
- 必要なら `resize` で `refreshMarkers()` 呼び出しを検討。

---

### 2026-03-16 — JMA 文言指示書単体（`IMPLEMENTATION_ORDER_JMA_SNOW_TOGGLE_LABELS.md`）

| 項目 | 内容 |
|------|------|
| **参照指示** | 同ファイル全文 |
| **実装** | `#jma-toggle` 内ラジオ＋`.jma-snow-note`。**ロジック・value 不変**は維持。 |

**逸脱・判断理由**

- 注記の `font-size` が指示例の「10px 前後」と **完全一致しない**場合、スタイルは既存 `.jma-snow-note` / モバイル帯に合わせて **微調整**されている可能性あり。**理由**: 2段クローム内での **はみ出し・行高**との兼ね合い（`MOBILE_MAP_UNIFIED` と干渉しないため）。**リーダーは実画面で「1行注記」要件を再確認**。

---

### 2026-03-22 — 日付案A §3.2 文書化＋No.1 副作用⑤ 整合（コードは既存実装で適合）

| 項目 | 内容 |
|------|------|
| **参照指示** | `IMPLEMENTATION_ORDER_DATE_SELECTOR_5_SLIDE_OPTION_A.md` §3.2 / §8 / §10、`PROJECT_MOBILE_UI_REMEDIATION.md` No.1 副作用⑤ |
| **変更ファイル** | 上記 `.md` 3 ファイル、`ski-powder-hunter.html` / `ski-powder-hunter-en.html`（CSS コメントのみ） |

**実装概要**

- **§3.2** を **3.2.1（コンセプト図対応）／3.2.2（横並び禁止の理由）／3.2.3（≤700px 必須レイアウト）** に分割して明文化。
- **§8** 先頭項目は **JMA 表示時も左に無駄な空白帯だけが広がらない**（§3.2）— 既存の受け入れと一致。
- **§10** 変更履歴の **2026-03-22** 行を更新（拡充内容を反映）。
- **No.1 副作用⑤** を **§3.2**・**§8** 参照付きで明確化。
- **コード**: `@media (max-width:700px)` の `.date-row-flex` **column + order** は **既に JP/EN 双方に実装済み**。本日は **§3.2.3 とのトレーサビリティ**のためコメントを更新。

**指示との適合**: ✅（レイアウト要件は既存 CSS で満たす）

**逸脱・判断理由**: なし。

---

### 2026-03-22 — No.1 案A 表示齟齬（5可視・トップチップ巨大感）修正

| 項目 | 内容 |
|------|------|
| **参照指示** | `IMPLEMENTATION_ORDER_DATE_SELECTOR_5_SLIDE_OPTION_A.md` §6.2 / §8（初期5チップ・中央寄せ禁止の解釈） |
| **担当** | コーディングエージェント |
| **変更ファイル** | `ski-powder-hunter.html`, `ski-powder-hunter-en.html` |

**監査ログとの齟齬（原因）**

| 記録 | 実際 |
|------|------|
| 2026-03-22 エントリは **§3.2 レイアウト（JMAと横並び禁止）で適合** とした | **§8「初期で前日〜+3の5チップ」** に対し、`ensureActiveDateChipVisible` が **アクティブをビューポート中央に寄せる**スクロールをしており、選択日が +3 付近でも **横スクロールが発生し、5チップの「初回ページ」が崩れる**ことがあった。 |
| A-2 で `--text-dim` 変更のみと記載 | チップ **高さ 92px** はモバイル5列で **縦に大きく見える**主因の一つ（指示は「5可視幅」中心で、トップ専用の高さ縮小は未記載）。 |

**実装概要**

1. **`ensureActiveDateChipVisible`**: `targetDayOffset <= 3` のとき **`scrollLeft = 0` 固定**（前日〜+3 の5チップを同一ビューに）。`>= 4` のみ従来の「見える化」を **左基準**（`active.offsetLeft - padding`）に変更し、**中央寄せを廃止**。
2. **`--chip-w`**: 下限を 52px → **48px**（5等分の余裕わずかに改善）。
3. **トップのみ** `.view-top #top-date-btns .date-btn` を **min-height 64px 前後・降雪行 14px** にコンパクト化（地図サイドバー側 `#date-btns` は 92px 維持）。

**指示との適合**

| 受け入れ | 状態 |
|----------|------|
| 初期表示で前日〜+3 の5チップが揃う（§8） | ✅ 意図に沿うよう修正 |
| +4〜+6 でアクティブが取り残されない | ✅ 左基準スクロールで維持 |

**未検証・フォロー**

- 実機 390px / 選択 +6 でのスナップ・スクロール位置の確認。

---

### 2026-03-22 — 地図モバイルクロームに日付帯（案A・`#map-date-btns`）

| 項目 | 内容 |
|------|------|
| **参照** | 提案ビジュアル `map-mobile-layout-proposal-after.png`、案A `IMPLEMENTATION_ORDER_DATE_SELECTOR_5_SLIDE_OPTION_A.md` |
| **変更ファイル** | `ski-powder-hunter.html`, `ski-powder-hunter-en.html` |

**実装概要**

- `#map-mobile-chrome` 内 **戻る・検索の下・JMA の上** に `.map-mobile-chrome-date` を追加（ラベル＋`#map-prev-day-jma-chip`＋`#map-date-btns` ビューポート）。
- `renderDateButtonsInto("map-date-btns")` を `initTopDateButtons` / `renderList` / 地域変更ハンドラで既存2本と併用。`syncDateButtonsActive`・`ensureActiveDateChipVisible`・`updatePrevDayJmaChips` を拡張。
- **≤700px のみ表示**（`.map-mobile-chrome-date`）。**≥701px** は `display:none`（地図はサイドバー `#date-btns`）。
- 右端 **フェード**（`::after`）でスクロール継続のヒント。トップ同様 **コンパクトチップ**（64px min-height 帯）。

**逸脱**: なし（D-2 の「Home」ヘッダー文言は未実施）。

---

### 2026-03-16 — モバイル TOP ビジュアル（8 スロット帯・ツールバー・案A 中央値）

| 項目 | 内容 |
|------|------|
| **参照指示** | `IMPLEMENTATION_ORDER_MOBILE_TOP_VISUAL_IMPLEMENTATION.md` |
| **変更ファイル** | `ski-powder-hunter.html`, `ski-powder-hunter-en.html` |

**実装概要**

- TOP: **8 セル単行ストリップ**（前日 + 今日…+6）、**1 行ツールバー**（Sort | Area | Refresh）、**ヒーロー動画なし**。
- **localStorage**: `powder.topSort`, `powder.topRegion`；**案A** 帯のバーは **TOP10（最大10）と同一集合**の各日 **中央値**。
- EN: `renderTop10` 全分岐で `renderTopWeeklyStrip()`、地域モーダル・`loadTopPrefsFromStorage()`・`initTopHeroVideoOnce`（動画なし early return）を JP と整合。

**逸脱**: なし。

**未検証・フォロー**

- 375px/320px の実機確認、localStorage の永続化手動確認。

---

### 2026-03-16 — モバイル狭幅トップ（はみ出し防止）

| 項目 | 内容 |
|------|------|
| **参照指示** | `IMPLEMENTATION_ORDER_MOBILE_NARROW_VIEWPORT_TOP.md`（A1〜A5） |
| **変更ファイル** | `ski-powder-hunter.html`, `ski-powder-hunter-en.html`（`@media (max-width: 700px)` 内のみ追加） |

**実装概要**

- **§4 案A**: `.view-top .top-target-week-strip` に帯内横スクロール、`.tw-strip-grid` に `min-width: calc(8×40px + gaps)`＋8 列 `minmax(40px,1fr)`。
- **§4.3**: `#view-top.view-top` のヒーロー潰れ防止・`top-ten-wrap`（モバイル MQ 内のみ。701px+ 向けの新規ルールは追加していない）。
- **§5**: ツールバーを CSS Grid（1 行目: 並び替え／エリア、2 行目: 更新フル幅）。
- **§6**: `.top-card` に `min-width:0`、メタ `11px`・`flex-wrap`。

**未検証・フォロー**: DevTools で 320/375/390 と 1280px の A1・A5 目視。

---

## ロードマップとの対応（スナップショット）

| 情報源 | No.3〜6 B 系 | 備考 |
|--------|----------------|------|
| `FIXED_ROADMAP_9ecbfe76.md` §2 | No.3〜6 は `[x]` | 固定ロードマップ正本 |
| `PROJECT_MOBILE_UI_REMEDIATION.md` §1 | 進捗表を **FIXED_ROADMAP と同期**すること（過去ずれ防止） | 本ログ更新時にチェック |

---

**改訂履歴**

| 日付 | 内容 |
|------|------|
| 2026-03-16 | 初版（A-2、B-1〜B-4、JMA 文言、逸脱・理由・未検証を記録） |
| 2026-03-22 | 日付案A §3.2 拡充・No.1 副作用⑤・監査ログエントリ |
| 2026-03-16 | モバイル TOP ビジュアル（8 スロット・ツールバー・監査ログエントリ） |
| 2026-03-16 | モバイル狭幅トップ `IMPLEMENTATION_ORDER_MOBILE_NARROW_VIEWPORT_TOP.md` |
