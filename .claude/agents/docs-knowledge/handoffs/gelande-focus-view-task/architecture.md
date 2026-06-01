[HANDOFF]
from: architecture
触るべき箇所:
- `selectResort(id, opts)`：`mobileDetailEntry` / `useFocusRankingShell` / `contentHtml` の分岐点。
- `buildFocusViewRankingBlock(...)`：FocusView_FromRanking の実DOM生成（`map-focus-screen` 内）。
- `openDetailUi`：`#map-detail-sheet-body` への注入と `view-map--focus-ranking` クラス付け。
- `#map-detail-sheet` / `#map-detail-sheet-body` / `.map-detail-sheet__handle` 周辺CSS（`@media (max-width:700px)`）。

依存関係の注意点:
- ランキング経路（FocusView_FromRanking）とマップピン経路（従来 popup/dayStrip/hourly）を**同一テンプレで混在させない**。
- 上部余白は単体CSSではなく、`sheet`コンテナ・`scroller`・`handle`・`transform`・`padding` の合成で再発しやすい。`view-map--focus-ranking` 時だけ上書きする枝を持つ。
- 日付チップは `targetDayOffset` と連動するため、表示仕様を変える際は `setTargetDayOffset` 呼び出し契約を維持する。
- FocusView の表示要素は `mock-015` 基準（day-chip 3要素、5チップ、温度チャート非表示）。

snow-dataへの確認事項:
- day-chip の降雪値表記（`N cm` / `—`）の欠損規則（0の扱い含む）。
- `day-chip__cal` の日付文字列供給元（クライアント算出かAPI供給か）。
- タイムライン `labelShort` / `labelAria` / `band` のデータ契約。

備考:
- この文書は architecture 観点の最小チェックリスト。実装フェーズごとに `touch-points.md` へ差分追記し、最終的に本タスク HANDOFF に完了記録を戻す。
