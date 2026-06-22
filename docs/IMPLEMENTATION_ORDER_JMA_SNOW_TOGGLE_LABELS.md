# 実装指示書：JMA 降雪レイヤー トグル文言の変更

## 目的

地図上の JMA 降雪オーバーレイ切替を、**直感的な「今後3h / 今後6h」**表記にし、**1行の注記**でデータの性質（気象庁メッシュ・積算時間）を示す。

**ロジック変更は不要**（`value="3h"` / `value="6h"` / `name="jma-snow-kind"` はそのまま）。

---

## 対象ファイル

- `ski-powder-hunter.html`
- `ski-powder-hunter-en.html`

---

## 変更内容（HTML）

### 対象ブロック

`#jma-toggle.map-overlay-toggle` 内のラジオ3つ。

### 日本語（`ski-powder-hunter.html`）

**ラベル文言（確定）**

| value | 表示テキスト |
|-------|-------------|
| `""`（OFF） | `OFF` |
| `3h` | `今後3h` |
| `6h` | `今後6h` |

**注記（トグル直下に1行、小さめのスタイルで追加）**

```text
※気象庁メッシュ表示（3h/6h積算）
```

- 実装: `<p class="jma-snow-note">` など1要素にし、既存 `.map-overlay-toggle` の直下（ラジオ行の後）に置く。
- CSS: `font-size: 10px` 前後、`opacity: 0.85`、`line-height: 1.3`、`margin-top: 6px` 程度（モバイル帯と干渉しないこと）。

### 英語（`ski-powder-hunter-en.html`）

**ラベル文言（確定）**

| value | 表示テキスト |
|-------|-------------|
| `""` | `OFF` |
| `3h` | `Next 3h` |
| `6h` | `Next 6h` |

**注記（確定）**

```text
※ JMA mesh (3h/6h accumulation)
```

- 日本語版と同様、トグル直下に1行。

---

## 変更しないもの

- `input` の `name` / `value`（`3h` / `6h`）
- `buildJmaSnowTileUrl` / `JMA_SNOW_CONFIG` / レイヤー追加・プローブ処理
- 既存の `.map-overlay-toggle` の位置・z-index（別タスクで触っている場合はマージ時に競合解消）

---

## 受け入れ条件

- [ ] JP: ラジオが `OFF` / `今後3h` / `今後6h` と表示される
- [ ] JP: 注記 `※気象庁メッシュ表示（3h/6h積算）` が見える
- [ ] EN: ラジオが `OFF` / `Next 3h` / `Next 6h` と表示される
- [ ] EN: 注記 `※ JMA mesh (3h/6h accumulation)` が見える
- [ ] 降雪レイヤー ON 時、従来どおりタイルが表示される（文言変更のみで壊していない）

---

## 実装状況（2025-03-17）

`ski-powder-hunter.html` / `ski-powder-hunter-en.html` に反映済み。

- 構造: `#jma-toggle` に `jma-toggle-stack`、内側に `.jma-toggle-radios` と `.jma-snow-note`
- `input` の `value` / `name` は変更なし（既存 JS そのまま）

---

*本指示は文言・マークアップ追加に限定。データ仕様の変更は含まない。*
