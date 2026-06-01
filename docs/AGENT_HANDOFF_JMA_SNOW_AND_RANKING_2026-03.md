# Agent handoff: JMA 降雪メッシュデバッグ・ランキング・ズーム対応（2026-03 セッション）

別エージェントが読む前提の**事実ベースの履歴**です。推測は「仮説」として明示しています。

---

## 1. 対象ファイル（実際に編集したもの）

| ファイル | 主な変更 |
|---------|----------|
| `ski-powder-hunter.html` | JMA snow デバッグログ、`fetchJmaSnowLatestTime` の 6h lookback、Top10 フォールバック、`L.tileLayer` の native zoom オプション |
| `ski-powder-hunter-en.html` | 上記と同等 + `jmaSnowLayer` 重複宣言の削除 + Resort/Open-Meteo デバッグログ |

`api/` 配下は**参照のみ**（コード変更なし）。

---

## 2. JMA 降雪オーバーレイ（3h / 6h）

### 2.1 目的

- `buildJmaSnowTileUrl` で組み立てた PNG タイルを Leaflet で重ねる。
- `timeStr` は `YYYYMMDDHHMMSS`。`index.json` 等が使えないため、**画像読み込み成否で時刻を遡る**方針（ユーザー要件ではロジック本体は変えずデバッグ優先だったが、後述の証拠に基づき最小限の調整あり）。

### 2.2 追加したデバッグ（プレフィックス）

- `[JMA snow debug]` … Console + 可能な箇所で `fetch` による NDJSON（セッション `e56e9e`、ingest URL はセッション設定に依存）。

主なログ種別:

- `toggle ON`（kind, zoom, center, bounds, href, protocol）
- `ensure fast-path return` / `ensure begin` / `timeStr fetched` / `ensure result` / `switch url`
- `fetchLatest range` / `fetchLatest begin` / `fetchLatest found` / `fetchLatest not found`
- `known-good probe`（固定 timeStr + z/x/y で URL 妥当性確認）
- `known6h` 系（not found 後の存在確認、`probeAny`）
- `isRenderable result` / `probe error sample` / `alt probe result`
- `start auto refresh` / `auto tick`

### 2.2b 初回表示の遅延対策（localStorage 即表示）

- `localStorage` キー `powder_jma_snow_last_time_v1` に `{ "3h": "YYYYMMDDHHMMSS00", "6h": "..." }` を保存。
- 降雪 ON 時、該当 kind の値があれば **`fetchJmaSnowLatestTime` を待たず**に `mountJmaSnowLayerFromTimeStr` でレイヤー表示し、`refreshJmaSnowTimeInBackground` で最新時刻に差し替え。
- フル探索で確定したとき・15分自動更新で変わったときも `writeJmaSnowStoredTime` で更新。

### 2.3 判明した事実（ランタイム証拠）

1. **known-good タイル**（例: 3h `20260319020000`, z=6, x=55, y=24）は `no-query` / `query` とも **hit:true** → URL 構成・画像ロード機構は有効。
2. **6h** は当初 `lookbackMin: 360`（6時間）のみだと、実在する `timeStr`（例: `20260319040000`）が**窓外**になり `fetchLatest not found` → `timeStr: null`。
3. **対応**: `fetchJmaSnowLatestTime` 内で **`kind === "6h"` のときだけ `lookbackMin = 1440`（24時間）** に拡張。3h は従来どおり `JMA_PROBE_LOOKBACK_MIN`（360）。
4. その後のログ例: `timeStr fetched { kind:'6h', timeStr:'20260319060000' }` → `isRenderable hit:true` → `ensure result { hasLayer:true, url:...snowf06h... }` → `start auto refresh`。

### 2.4 EN 側の構文エラー

- `ski-powder-hunter-en.html` に **`let jmaSnowLayer = null;` が二重宣言** → `Uncaught SyntaxError: Identifier 'jmaSnowLayer' has already been declared` → 以降のスクリプト（ゲレンデ読み込み等）が止まる。
- **後方の重複行を削除**して解消。

### 2.5 ズームでメッシュが「消える」問題（ユーザー報告 + 検証）

- ユーザー報告: `map.getZoom()` で **6, 8, 10 は表示、5, 7, 9 は非表示** のようなパターン。
- 解釈（仮説）: JMA タイルが**奇数 z で実体が無い／404 になり真っ白**に見える。レイヤーは残っているがタイルが無い。
- **対応（第1段）**: `minNativeZoom` / `maxNativeZoom` のみでは不十分な場合あり。
- **対応（第2段・補完）**: `JmaSnowTileLayer`（`L.TileLayer` 継承）で **`_clampZoom` をオーバーライドし、ネイティブ範囲内の z が奇数のとき 1 段下げて偶数に統一**。Leaflet が地図ズーム 7 でもタイルグリッドを z=6 として読み込み、表示側は `getZoomScale` で拡大（公式 GridLayer の挙動）。`fetchJmaSnowLatestTime` / `isJmaSnowTimeRenderable` は **`getJmaSnowEffectiveTileZoom` / `getJmaSnowAlternateProbeZ`（6↔8）** で同じ規則に揃えた。

**検証**: 降雪 ON のまま 3→10 を 1 段ずつズームし、欠けが解消したか確認（`debug-e56e9e.log` に `H-evenZ` が奇数ズーム時のみ出る）。

### 2.6 3h と 6h が「同じに見える」件

- ログ例: 3h は `timeStr fetched { kind:'3h', timeStr: null }`（探索窓内にタイル無し）、6h は有効な `timeStr`。
- この場合、**見えているのは 6h のみ**で、3h トグル時も実質オーバーレイが無い／6h だけ有効、などで「同じ」に見える可能性が高い（データの有無の差）。

---

## 3. Powder ranking / Open-Meteo / EN ランキング

### 3.1 現象

- EN Top10 が空、`renderTop10 stats` で `withData: 0`, `top10Len: 0`, `loading: false`。

### 3.2 原因（ランタイム証拠）

- `fetchWeather response sample`: **`httpStatus: 429`**, `topReason: "Daily API request limit exceeded. Please try again tomorrow."`
- `hasDaily: false` → `weatherCache` に有効な `daily.snowfall_sum` が無く、`withData` フィルタに誰も通らない。

### 3.3 試したこと

- `SNOW_API_BASE = "http://localhost:8000"` に切替 → ユーザ環境では **API 未起動**で `Failed to fetch` が大量発生。`Test-NetConnection 127.0.0.1:8000` は失敗。
- **`SNOW_API_BASE` を `""` に戻す** + **`FETCH_ALL_ON_LOAD = false`**（起動時の全件キューを抑える）を JP/EN で実施。

### 3.4 フォールバック Top10（JP/EN）

429 で当日 API が使えない日でも**空画面を避ける**ため、`renderTop10()` で:

- 通常の `weatherCache` ベースの `top10` が 0 件かつ `loading === false` のとき
- `RESORTS` の埋め込み **`powderScore` / `newSnow3d`** でソートした Top10 を表示
- サブタイトルに **フォールバック**であることを明示（JP: 「フォールバック」、EN: 「fallback」）

ユーザー確認: **「両方出た」**（JP/EN で Top10 表示）。

---

## 4. モバイルで JMA が出ない件

- ユーザー報告: モバイル版は表示しない。
- 本ドキュメント作成時点で、**CSS でトグル非表示か、地図ビュー未対応か**はコード未精査のメモとして残す。次エージェントは `jma-snow` ラジオ周りと `@media` を検索するとよい。

---

## 5. デバッグ用ログ・セッション

- NDJSON 用 ingest: セッション `e56e9e`（ワークスペース内 `debug-e56e9e.log` はセッションごとに削除して再利用）。
- 本番前に `[JMA snow debug]` / `[Resort debug]` の大量ログを削るかは**ユーザー合意後**が安全。

---

## 6. 次エージェント向けチェックリスト

1. JMA: 6h の `lookbackMin` 拡張（1440）が意図どおりか、JMA 配信仕様と矛盾がないか。
2. JMA: `minNativeZoom:6` / `maxNativeZoom:10` が全地域・全要素で妥当か（必要なら定数化）。
3. 3h `timeStr: null` が続く時間帯の扱い（UI メッセージ、別要素への誘導など）。
4. Open-Meteo 429: 本番では `api/` サーバ起動 + `SNOW_API_BASE`、またはキャッシュ JSON の配布を検討。
5. モバイル: JMA トグル表示と `ensureJmaSnowLayer` 呼び出し経路の確認。

---

## 7. 関連ドキュメント（既存）

- `api/README.md` … ローカル API・キャッシュ・`SNOW_API_BASE` の説明
- `docs/MAP_UI_OVERLAY_POLICY.md` … オーバーレイ方針（あれば参照）

---

*このファイルは Cursor 上のデバッグセッションの要約であり、以降のコード変更があれば本ファイルも更新すること。*
