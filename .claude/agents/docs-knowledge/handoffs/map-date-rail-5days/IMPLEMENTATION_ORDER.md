# 実装指示書（implementer 正本）— マップ日付レール 0〜5

**Handoff**: [HANDOFF.md](./HANDOFF.md)  
**優先度**: P1  
**ゲート**: 同一メッセージに `ROLE: implementer` + **実装して**  
**対象ファイル**: `ski-powder-hunter.html`, `ski-powder-hunter-en.html`（**対称**）

---

## 0. スコープ（最小差分）

| やる | やらない |
|------|----------|
| `mapOffsets` → `[0,1,2,3,4,5]` | `getDates()` の 7 日ループ変更 |
| `isMapRail` ラベル分岐（offset 基準） | トップ `#top-date-btns` / リスト `#date-btns` の案 A ロジック |
| `ensureActiveDateChipVisible` の **map 専用分岐** | JMA 前日チップ・ポップアップ `.popup-day-strip` |
| 任意: `#map-date-rail` の scroll-snap CSS | 8 列 grid をマップに移植 |

---

## 1. `renderDateButtonsInto`

**現状**

```javascript
const mapOffsets = [0,1,4];
// isMapRail: if(i===0) label="今日"; else if(i===1) label="明日"; else label="4日後";
```

**変更**

1. `mapOffsets = [0,1,2,3,4,5]`（または `dates.slice(0,6).map((d,i)=>({d,offset:i}))` と同等）
2. `isMapRail` の `label` を **`dayOffset`（= `entry.offset`）の switch** に置換:

| `dayOffset` | JA | EN |
|-------------|----|----|
| 0 | 今日 | Today |
| 1 | 明日 | Tmrw |
| 2 | 明後日 | +2d |
| 3 | 3日後 | +3d |
| 4 | 4日後 | +4d |
| 5 | 5日後 | +5d |

3. `.date-card__snow` のマップ行は **現状維持**（アクティブのみ表示するなら既存どおり）

---

## 2. `ensureActiveDateChipVisible`

**問題**: 共用ロジックの `targetDayOffset <= 3 → vp.scrollLeft = 0` がマップで **右端チップ（4・5）を半切れ**にする。

**変更案（いずれかで可、トップ挙動を壊さないこと）**

- **A**: 関数先頭で `trackId === "map-date-btns"` のときはトップ用 early-return をスキップし、常にアクティブ `.date-card.is-active` を **左寄せ・完全表示**（`offsetLeft - pad`、clamp `maxScroll`）
- **B**: マップだけ別関数 `ensureMapDateRailVisible()` を呼ぶ

**デスクトップ（≥701px）**: 現状 `scrollLeft=0` でよいなら map も同様で可（qa は ≤700px 必須）。

---

## 3. CSS（原則不要・任意）

既存: `#map-date-rail { overflow-x: auto }`, `.date-card { flex: 0 0 auto; min-width: 84px }`

足りない場合のみ:

```css
#map-date-rail {
  scroll-snap-type: x proximity;
}
#map-date-rail .date-card {
  scroll-snap-align: start;
}
```

**禁止**: マップレールに `.date-btns-viewport` の 5 可視幅計算・8 列 grid をコピーしない。

---

## 4. 実装順序

1. `renderDateButtonsInto` — `mapOffsets` + ラベル（JA）
2. 同ファイル — `ensureActiveDateChipVisible` 分岐
3. `ski-powder-hunter-en.html` — 上記 2 点を **対称**
4. 任意 CSS
5. 手動: マップ表示 → 6 枚確認 → 5日後タップ → 半切れなし（≤700px）

---

## 5. 受け入れ条件（grep 用）

| ID | Then |
|----|------|
| AC-1 | `#map-date-btns` に 6 枚、`data-offset` 0..5 連続 |
| AC-2 | 5日後タップでマーカー降雪が offset 5 に変化 |
| AC-4 | ≤700px で 5日後チップが完全表示 |
| AC-5 | EN ラベル表 |
| AC-6 | トップ／リスト日付は変更前と同じ |

---

## 6. 仕様との関係（再掲）

- **トップ／リスト**: `docs/SPEC_DATE_SELECTOR_5_PLUS_SLIDE.md` + `docs/IMPLEMENTATION_ORDER_DATE_SELECTOR_5_SLIDE_OPTION_A.md` — **8 チップ・5 可視・前日込み**
- **マップ（本書）**: **6 チップ（0〜5）・`#map-date-rail` 横スクロール** — 上記ドキュメントのビューポート幅計算は **流用しない**
