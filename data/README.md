# data/

## 気象庁積雪（日1回）

- **jma-snow.json** … 各ゲレンデに「最も近い気象庁観測所」の現在積雪（snc）・日最深積雪（mxsnc）・直近3時間降雪量（snd）を紐づけたデータ。`scripts/fetch-jma-snow.js` で生成（日1回実行想定）。

### 前日実績（カレンダー日・JST）— 任意

- **jma-prevday-hourly.json** … 観測所番号ごとに、**直前のカレンダー日（JST 0〜24時）**の **24 本**の `precip_mm`（1時間降水量・㎜）と `temp_c`（気温・℃）を並べたデータ。ページ読み込み時に `jma-snow.json` のエントリへマージし、**「今日」タブ**用の前日合計・時間帯バー（12–18 / 18–24）に使います（Open-Meteo の昨日で埋めません）。
- **形式例**:
  ```json
  {
    "calendar_day_jst": "2026-03-20",
    "rule_note_ja": "（省略可・HTML と同一でも可）",
    "rule_note_en": "…",
    "stations": {
      "16217": {
        "precip_mm": [0, 0, …24要素…],
        "temp_c": [-2, -2, …24要素…]
      }
    }
  }
  ```
- **更新**: 気象庁の機械可読データから生成するスクリプトを運用で用意してください（`calendar_day_jst` が null または `stations` が空のときは UI は前日実績を出しません）。
- **amedas-stations.json** … 観測所番号 → 緯度・経度・地点名。紐づけに必須。サンプルのみ同梱。本番では [LANDWATCH アメダス一覧](https://landwatch.info/topic/ame-code/) 等から全観測所を用意するとよい。詳細は `docs/気象庁積雪データの紐づけ.md` を参照。

## ゲレンデ公表積雪（気象庁に紐づかないゲレンデ用）

- **resort-snow.json** … ゲレンデ公式サイト等で公表されている積雪を集計したデータ（任意）。存在しない場合はスキップされます。
- **形式**: `{ "リゾートID（文字列）": { "depth_cm": 数値, "updated_at": "YYYY-MM-DD" }, ... }`
- **使い方**: 気象庁の観測地点に紐づかないゲレンデは、このファイルに ID と積雪を書いておくと「積雪」表示と「積雪量ランキング」で使われます。優先順は **気象庁 > resort-snow.json > RESORTS の snowDepth > Open-Meteo モデル** です。
- **更新**: 手動で編集するか、各ゲレンデの公式ページからスクレイプして生成するスクリプトを用意して更新してください。`docs/気象庁積雪データの紐づけ.md` に方針を記載しています。
- **サンプル**: `resort-snow.sample.json` をコピーして `resort-snow.json` にリネームし、リゾート ID と積雪を編集して使えます。

## 近隣ゲレンデ（実走行距離）

マップでリゾートをクリックしたときに「車で近いゲレンデ」を表示するためのデータです。

### 初回セットアップ（1回だけ）

1. **実走行距離を計算**（約1〜2時間。OSRM のレート制限のため間隔を空けて取得）
   ```bash
   node scripts/nearby-driving.js
   ```
   - 出力: `data/nearby.json`（各 id ごとに近い5件の id と km）
   - 途中で止めた場合は再実行でキャッシュから続行可能

2. **HTML に埋め込む**
   ```bash
   node scripts/merge-nearby-into-html.js
   ```
   - `ski-powder-hunter.html` の RESORTS の各要素に `nearby` が追加されます

これでマップのポップアップに「車で近いゲレンデ」が表示され、クリックでそのゲレンデに飛べます。

---

## 本番デプロイ（404 を出さない）

`ski-powder-hunter.html` は読み込み時に **`data/` 以下の JSON を相対パスで取得**します。本番では **HTML と同じ階層に `data/` ディレクトリごと**置いてください（GitHub にプッシュしただけでは、ホスティングがリポジトリ全体を公開していない／別フォルダだけをアップしていると 404 のままです）。

リポジトリには次の **ファイル名**でコミットしてあります（中身が `{}` のものはプレースホルダ。運用で上書き可）。

| ファイル名 | 備考 |
|------------|------|
| `weather.json` | 任意キャッシュ。空オブジェクト可。 |
| `jma-snow.json` | 気象庁積雪（別途生成・更新） |
| `resort-snow.json` | 公表積雪。空なら `RESORTS` / API にフォールバック。 |
| `lift-times.json` | リフト開始。空なら `RESORTS` にフォールバック。 |
| `resort-operating.json` | 営業期間上書き。空なら `RESORTS` にフォールバック。 |
| `jma-prevday-hourly.json` | 前日時間帯。形式は上記「前日実績」節参照。 |

ブラウザで `https://（本番ドメイン）/data/weather.json` などを **直に開いて 200 になること**を確認すると早いです。

### Search Console の「リダイレクト」との関係

**JSON の 404 を直すことと、GSC のリダイレクト指摘の解消は別問題です。**  
HTTPS / www の正規化やインデックス対象 URL はサーバー設定と GSC プロパティの揃え方が中心です。詳細は `docs/GSC-DEPLOY-NOTES.md` を参照してください。

### そもそも GitHub に `resort-snow.json` 等が無かったのはなぜか

1. **任意キャッシュの設計** … 本番 HTML は「ファイルがあれば読む・無ければ API／`RESORTS` にフォールバック」なので、**リポジトリにはサンプル（`*.sample.json`）だけ置き、本番用ファイル名は運用でコピーする**形にしていた経緯があります（`README` でも「サンプルをコピーして `resort-snow.json` に」と記載）。
2. **自動更新は `weather.json` のみ** … `.github/workflows/update-weather.yml` が毎時更新するのは **`data/weather.json` だけ**です。他の JSON はスクリプトで生成していない限り、GitHub 上に現れません。
3. **ローカルと GitHub のフォルダが別** … Cursor で開いている `JapowSerchiProject` に **`.git` が無い**場合、ここで作ったファイルは **自動では GitHub に上がりません**。push している別のクローン（GitHub Desktop のリポジトリ等）へコピーするか、そのクローンをこのフォルダと同期する必要があります。
