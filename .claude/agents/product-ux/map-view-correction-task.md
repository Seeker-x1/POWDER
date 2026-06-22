# マップビュー補正タスク（Map View Correction Task）

## 名称

- **和名**: マップビュー補正タスク  
- **目的**: 本番のマップ上フォーカス／ボトムシート UI を **`mock-016.html` の `#device` / `.device-screen` 内と同一**にする。**モックに無い UI・文言は置かない**（独自解釈・勝手なラベル禁止）。  
- **日付チップ（MVC-06）**: 各 `.day-chip` は **3 段** — 相対ラベル `span` ＋ `.day-chip__cal`（暦日）＋ `strong`（降雪 `N cm` / `—`）。mock-016 が正本。**MVC-17 は MVC-06 に統合済み**（2026-06-22 docs-knowledge フェーズ 1）。  
- **参照モック（正）**: `.claude/agents/product-ux/mock-016.html`（比較対象は **`.device-screen` のみ**。注釈列は検証用で本番に出さない）

## 参照スクショ（差分の元）

- ワークスペース保存例: `assets/c__Users_Takum_AppData_Roaming_Cursor_User_workspaceStorage_f1498409104ada3d643a485f8570bd2d_images_image-1ec1b635-4905-4ca4-b7d9-0836db22864f.png`  
- 内容: キロロ／「ひと目」「詳細」タブ／降雪ボックス／日付チップ（明日選択）／背面フルマップ

## Handoff

- `.claude/agents/docs-knowledge/handoffs/map-view-correction-task/HANDOFF.md`（**洗い出し一覧のマスター**）

## 関連タスク

- **ゲレンデフォーカスビュー・タスク**: 流入・情報階層の「正」は mock-011/016 系。本タスクは **見た目・構造の実装ギャップを閉じる**工程として位置づける。

## 本番実装

- `ski-powder-hunter.html` 等は implementer ゲートで改変する。
