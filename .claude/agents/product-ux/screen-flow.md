# 画面フロー（product-ux）

必要に応じて product-ux エージェントが画面単位のフローとモック参照をここに追記する。

---

## 分岐の原則（ゲレンデ詳細）

**同一 DOM に「ランキングフォーカス用（011/013）」と「マップ大型シート案（012）」を混在させない。** 流入経路ごとにテンプレート／分岐を分ける（詳細: `handoffs/gelande-focus-view-task/HANDOFF.md`）。

```text
                    ┌─ [トップランキング・一覧] ─ 行タップ（一発）
                    │         │
                    │         ▼
                    │   FocusView_FromRanking  （正: mock-011 / mock-013）
                    │         薄マップ帯 + シート（L1/L2/L3・小「次 →」）
                    │
[アプリ] ───────────┤
                    │
                    └─ [マップ] ─ ピンタップ
                              │
                              ▼
                        FocusView_FromMap（仮称）
                        別テンプレ（現行は selectResort + シートに近い）
                        012 案は mock-archive/mock-012.html（アーカイブ）
```

---

## マップビュー補正タスク（mock-013 乖離の解消）

- **タスク定義**: `.claude/agents/product-ux/map-view-correction-task.md`
- **Handoff（乖離 MVC-01〜17・正本は mock `.device-screen` のみ）**: `.claude/agents/docs-knowledge/handoffs/map-view-correction-task/HANDOFF.md`
- **正本モック**: `mock-013.html` の `.device-screen` 内

## ゲレンデフォーカスビュー・タスク（一覧 → 一発フォーカス）

- **画面状態の呼称**: `FocusView_FromRanking`
- **タスク定義**: `.claude/agents/product-ux/gelande-focus-view-task.md`
- **Handoff（本タスク用フォルダ）**: `.claude/agents/docs-knowledge/handoffs/gelande-focus-view-task/HANDOFF.md`
- **カレントモック**: `mock-013.html`（mock-011 準拠 + 英語レイアウト）
- **公式フロー（主）**:

```text
[ランキング一覧]
  → 行タップ（一発）
  → ゲレンデフォーカスビュー（薄マップ帯 + シート）
  → 閉じる / 対象日（チップ）/ B・A / 小「次 →」で次候補
```

---

## マップ詳細ボトムシート（モバイル・ターゲットB優先）— mock-012

- **流入**: **マップピン**（`FocusView_FromMap`）。ランキング一発フォーカスとは **別経路**。
- **モック**: `.claude/agents/product-ux/mock-archive/mock-012.html`（アーカイブ）
- **フロー**: マップ → ピンタップ → ボトムシート（デフォルト: 直前モード ON）→ 閉じる / 日付変更 / モード切替 / 別ゲレンデ（Secondary）
- **詳細**: Handoff `.claude/agents/docs-knowledge/handoffs/2026-03-28-product-ux.md`
- **注**: ゲレンデフォーカス経路の正は上記 **ゲレンデフォーカスビュー・タスク** と `mock-013`。
