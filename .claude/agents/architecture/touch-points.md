# 触るべき関数・ブロック（本番索引）



**対象**: リポジトリ直下 `ski-powder-hunter.html` / `ski-powder-hunter-en.html`（構造はほぼ同一）。行番号は変動しうるため **関数名・ID で grep** すること。



詳細なタスク文脈（ゲレンデフォーカスビュー）: `.claude/agents/docs-knowledge/handoffs/gelande-focus-view-task/HANDOFF.md`  

段取り: `.claude/agents/docs-knowledge/handoffs/gelande-focus-view-task/ROADMAP-mock015-by-agent.md`（**フェーズ 5-1 経路分岐 — 実装済 2026-06**）



---



## リゾート詳細（地図ポップアップ / モバイルボトムシート）



| 内容 | 当たり |

|------|--------|

| HTML 組み立て | `selectResort(id, opts)` 内の `contentHtml` |

| モバイル表示 | `openDetailUi` → `#map-detail-sheet-body` に `innerHTML` |

| Leaflet（幅広） | `L.popup(...).setContent(contentHtml)` |

| 閉じる | `closeResortPopup()` |

| シート DOM | `#map-detail-sheet`, `#map-detail-scrim`, `#map-detail-sheet-body` |

| スタイル | `.leaflet-popup-*`, `.popup-*`, `@media (max-width:700px)` 内の `#map-detail-sheet` 周り |



---



## 経路分岐（フェーズ 5-1 — FocusView）



**混在禁止**: ランキング経路（mock-016 `.device-screen` 型 `.map-focus-screen`）とマップピン経路（012 型 `.popup-day-strip` / `.popup-hourly-strip`）を **同一 `contentHtml` に足し込まない**。ランキング経路では `if(!useFocusRankingShell)` で 012 ブロック（popup-pw / nearby / popup-btns 等）を組まない。



### 旗（状態・オプション）



| 旗 | 型 | 意味 |

|----|-----|------|

| `opts.focusFromRanking` | `boolean` | `true` で **FocusView_FromRanking** 経路。`selectResort` 先頭で `mobileDetailEntry = "ranking"` にセット |

| `opts.focusFromRanking === false` | 明示 false | 近隣タップ等で **マップ経路**に戻す（`selectResortGroup`） |

| `mobileDetailEntry` | `"ranking"` \| `"map"` | セッション内の経路記憶。`"ranking"` = FocusView_FromRanking / `"map"` = FocusView_FromMap（012 型） |

| `useFocusRankingShell` | `boolean` | `selectResort` 内ローカル。`true` のとき `buildFocusViewRankingBlock` を `#map-detail-sheet-body` へ流し、012 型 `dayStripHtml` を組まない |

| CSS クラス | — | `useFocusRankingShell` 時: `#map-detail-sheet.map-detail-sheet--focus-ranking` + `#view-map.view-map--focus-ranking` |



### 呼び出し元



| 流入 | 呼び出し | 経路 |

|------|----------|------|

| TOP ランキング行タップ | `showMapView(id)` → `openFocusFromRanking(id)` | **FocusView_FromRanking** |

| FocusView 内日付チップ / 小「次 →」 | `openFocusFromRanking(id, { noMove: true })` | **FocusView_FromRanking**（維持） |

| マップピン | `openFocusFromMap(r.id)` → `{ focusFromRanking: false }` | **FocusView_FromMap**（012 型・現行 UI） |

| サイドバー `.pw-card` | `openFocusFromMap(r.id)` | **FocusView_FromMap** |

| 012 型日付チップ / popup-nav | `openFocusFromMap(id, { noMove: true })` | **FocusView_FromMap**（維持） |

| 近隣ゲレンデ行 | `selectResortGroup(...)` → `selectResort(id, { noMove: true, focusFromRanking: false })` | **FocusView_FromMap** |

| 「地図を見る」（ID なし） | `showMapView()` | 詳細を開かない |



### 専用関数



| 関数 | 役割 |

|------|------|

| `openFocusFromRanking(id, extraOpts?)` | ランキング／TOP 専用ラッパ。内部で `{ focusFromRanking: true }` を付与して `selectResort` を呼ぶ |

| `openFocusFromMap(id, extraOpts?)` | マップピン／サイドバー専用ラッパ。内部で `{ focusFromRanking: false }` を付与して `selectResort` を呼ぶ |

| `buildFocusViewRankingBlock(id, r, daily, ps)` | FocusView_FromRanking の DOM 生成（`.map-focus-screen` 内）。**mock-016** 準拠 |
| `scripts/focus-view-ranking.js` | `FocusViewRanking.buildSlotAriaLabel`（BUG-07）、`computeGlanceState`、`initDayChipTabs`（APG tabs）、`initAfterRender` |

| `selectResort(id, opts)` | 分岐の本体。`isFocusFromRanking` で 012 型ブロックをスキップ |



### 検証スクリプト



`node scripts/checks/check-route-branch.js` — 両 HTML に分岐旗・`openFocusFromRanking`・マップピン非混在を smoke 確認。



---



## 日付・タブ



| 内容 | 当たり |

|------|--------|

| 選択中日（0〜6） | 変数 `targetDayOffset` |

| 変更入口 | `setTargetDayOffset(offset)` → `syncDateButtonsActive`, `renderTop10`, `renderList`, `refreshMarkers` |

| FocusView 日付チップ | `buildFocusViewRankingBlock` 内 `.day-chips` / `.day-chip`（5 チップ・相対＋暦日＋降雪行） |

| 地図シート内の日付 UI（012 型・マップ経路のみ） | `selectResort` 内 `dayStripHtml`（`.popup-day-strip--scroll`, `.popup-day-tab`） |



---



## 時間帯バー・タイムライン相当



| 内容 | 当たり |

|------|--------|

| FocusView L3 | `buildFocusViewRankingBlock` 内 `.tl-legend` / `.tl-scroll` |

| 地図モバイル用セグメントバー（012 型・マップ経路のみ） | `selectResort` 内 `hourlyHtml`（`.popup-hourly-strip`, `.popup-hourly-bar`） |

| 一覧カードの時間別降雪 | `.hourly-snow-*` クラス群＋リスト描画テンプレート |

| TOP 週間帯 | `#tw-strip-grid`, `renderTopWeeklyStrip()` |

| 降水タイムライン配列（未配線） | `getPrecipTimeline(daily, dayOffset)` — 現状参照箇所なし |



---



## その他オーバーレイ



| 内容 | 当たり |

|------|--------|

| TOP エリアモーダル | `#top-region-modal`, `closeTopRegionModal` |

| 地図検索フルスクリーン | `#map-search-overlay`, `.is-open` |



---



## guides.japowserch.com 連携（詳細確認ボタン）



| 内容 | 当たり |

|------|--------|

| マッピング JSON | `data/resort-guides.json` |

| URL 組み立て | `getResortGuideUrl(resortId)` |

| ボタン分岐 | `onDetailClick(resortId)` — LP があれば新規タブ、なければ `scrollToCard` |



---



## FocusView_FromMap — マップクローム（S-2 · 2026-06-22）

| 要素 | 役割 |
|------|------|
| `#map-mock009-stack` | マップ閲覧 chrome（`hw-strip` + `chrome-bar` + `date-rail`）。詳細中は `.map-popup-open` で非表示 |
| `.leaflet-control-zoom` | デスクトップのみ。モバイルは `#map-zoom-stack` のみ |
| `getMobileMapSheetPaddingPx()` | `--m-sheet` 相当の px を推定 |
| `recenterMapForFromMapDetail(latlng)` | FromMap 詳細時、ボトムシート分 padding で `flyTo` |
| `openFocusFromMap` | マップピン／サイドバー。`focusFromRanking: false` 固定 |

**混在禁止**: ranking の `.map-strip`（016）と stack chrome は別物。016 シェルをピン経路に流さない。

---

## ゲレンデフォーカスビュー — 残フェーズ（フェーズ 2 以降）

- **正 UI（カレント）**: mock-016（`.claude/agents/product-ux/mock-016.html` の `.device-screen` 内）。

- **フェーズ 5-1（経路分岐）**: 上記「経路分岐」節 — **完了**（`openFocusFromMap`、012 DOM 非混在）。
- **フェーズ 5-2（シェル DOM）**: 72px `.map-strip` + FAB + `.sheet` + `.l1-head` + 小「次 →」 — **完了**。
- **フェーズ 5-3（B glance / day-chips）**: `computeGlanceState` + `gap:8px` tab ×5 — **完了**。
- **フェーズ 5-4（L2 / L3）**: `#l2-block` 初期 hidden + `.tl-legend` / `.tl-scroll` — **完了**。
- **フェーズ 5-5（← トップ / ranking）**: `.btn-top-sm` + `showTopView()` — **完了**。
- **サイド S-2（FromMap クローム）**: `getMobileMapSheetPaddingPx`, `recenterMapForFromMapDetail`, モバイル `hw-strip` 非表示, `leaflet-control-zoom` 非表示, FromMap スクリム `.32` — **完了（2026-06-22）**。詳細 [ROADMAP-frommap-chrome-side.md](../docs-knowledge/handoffs/gelande-focus-view-task/ROADMAP-frommap-chrome-side.md)。

- **検証**: `node scripts/checks/check-route-branch.js` / `check-focus-view-phases.js` / `check-jp-en-sync.js` / `check-focus-view-qa.js`（**34/34**）。


