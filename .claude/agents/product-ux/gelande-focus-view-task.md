# ゲレンデフォーカスビュー・タスク（Gelande Focus View Task）

## 名称

- **和名**: ゲレンデフォーカスビュー・タスク  
- **英名（内部用）**: Gelande Focus View Task  
- **画面状態の呼称（案）**: `FocusView_FromRanking` — トップランキング等の一覧から **一発で** 特定ゲレンデにフォーカスした直後のビュー

## スコープ

- **流入**: ランキング（一覧）からの遷移を主。**地図ピンタップ**は別経路としてもよいが、本タスクの「正」レイアウトは **mock-011 系**（薄マップ帯 + シート主体）。
- **ペルソナ**: ターゲット B（前日・直前の一瞬判断）をデフォルト表示に寄せ、A（比較・密度）はトグルまたはモードで展開（mock-011 / mock-013 と同じ思想）。
- **許容（当面）**: 薄マップ帯でのフル地図操作の制約、「次」小ボタンとタップ領域のトレードオフ、ランキング「次」の状態機械、B/A 自動判定の複雑さなど（過去に挙げた 1〜6）は **一旦許容**。

## 設計の柱

1. **mock-011 準拠**: L1（地名・日付・B glance）/ L2（数値・注釈）/ L3（タイムライン）。「次 →」はタイトル行右の小ボタンのみ。スロットは固定幅 + 横スクロール。複合長文ラベルはスロット内に置かない。
2. **英語版（項目 7）**: [mock-013.html](./mock-013.html) — `lang="en"` でスロット幅拡張、EN ラベルは 2 行クランプ + 略号 / `aria-label` 完全形、タイトル 2 行、雨バッジ折返し、チップ幅拡張。

## 参照ファイル

| 種別 | パス |
|------|------|
| カレントモック（011 + i18n） | `.claude/agents/product-ux/mock-013.html` |
| 参照モック（011 アーカイブ） | `.claude/agents/product-ux/mock-archive/mock-011.html` |
| 画面フロー索引 | `.claude/agents/product-ux/screen-flow.md` |
| **本タスク Handoff（正）** | `.claude/agents/docs-knowledge/handoffs/gelande-focus-view-task/HANDOFF.md` |
| 関連 Handoff（マップ経路・初版メモ） | `.claude/agents/docs-knowledge/handoffs/2026-03-28-product-ux.md` |

## 本番実装

- **`ski-powder-hunter.html` / `ski-powder-hunter-en.html` / `scripts/`** への変更は、ワークスペースルールに従い **implementer スレッド**（`ROLE: implementer` + 「実装して」等）で依頼する。
- **本番の関数・DOM 索引**: `.claude/agents/architecture/touch-points.md`
- **タスク統合 Handoff（決定事項・DoD・未解決の優先度）**: `.claude/agents/docs-knowledge/handoffs/gelande-focus-view-task/HANDOFF.md`
- **mock-015 準拠の段取り・エージェント分担（RACI）**: `.claude/agents/docs-knowledge/handoffs/gelande-focus-view-task/ROADMAP-mock015-by-agent.md`

### 本番実装フェーズ（概要）

実装順の目安。**経路分離を最優先**し、011/013 と 012 型テンプレを同一 DOM に混在させない。

| フェーズ | 内容 | 主な当たり（現行コード） |
|----------|------|---------------------------|
| **P0 経路分離** | ランキングタップで `FocusView_FromRanking`（011/013）を開く処理と、マップピン経路を **テンプレ／分岐で分離** | ランキング行のタップ、`scrollToCard`、`selectResort`、`openDetailUi` |
| **P1 シェル DOM** | 薄マップ帯＋シートのルート（mock-013 セマンティクス） | `#view-map` 内マークアップ、または JS テンプレ切替 |
| **P2 L1/L2/L3** | 閉じる FAB・地名・小「次」／B glance・日付チップ／L2 トグル／L3 固定幅スロット | `selectResort` 内 `dayStripHtml` / `summaryHtml` / `hourlyHtml` の **置換またはコンポーネント化**（012 共有禁止） |
| **P3 i18n** | EN は mock-013（`lang="en"`、トークン・2 行・aria） | `ski-powder-hunter-en.html` の style ＋ 文字列生成 |
| **P4 データ** | ゴー/リスク、B/A（Handoff の未解決 P0/P1） | `scripts/` または既存キャッシュ（snow-data と合意） |

## メタ

- タスクとしての起算: 2026-03-28（会話上で本名称を採用）
