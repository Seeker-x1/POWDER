# 降雪予測 API（B: アンサンブル / C: 気象庁 GRIB2）

Open-Meteo と同一形式の日別予報を返します。フロントは `SNOW_API_BASE` を設定するだけでこの API に切り替えられます。

## よくある質問

- **常に全部取得できる？**  
  フロントの `FETCH_ALL_ON_LOAD = true` にすると、起動時に全450件をキューし、順次取得します。

- **アクセスするたびに取得している？**  
  **フロントだけ（HTML を開くだけ）のとき**: はい。ページを開くたびにブラウザが API を叩くので、そのたびに取得です。タブを閉じればキャッシュも消えます。  
  **このサーバーを経由するとき**: 同じ (lat, lng) は **1時間はキャッシュ**から返すので、その間は外部API（Open-Meteo）を再取得しません。

- **サーバーを立てれば最新情報を常に更新し続けられる？**  
  はい。この API はメモリ上に「(lat, lng) ごとの結果」を TTL 1時間でキャッシュします。cron やスケジューラで「全450ゲレンデ分の `/api/forecast?lat=...&lng=...` を定期的（例: 1時間ごと）に叩く」ようにすれば、サーバー側キャッシュが常に更新され、ユーザーは常に最新に近いデータを受け取れます。

## 起動

```bash
cd api
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- ブラウザ: `http://localhost:8000/docs` で Swagger UI
- 例: `GET /api/forecast?lat=35.5&lng=138.0`

## データソース

| ソース | 内容 | 有効化 |
|--------|------|--------|
| Open-Meteo | 常に使用（風・気温・降雪） | 常時 |
| WeatherAPI.com（B） | 降雪のアンサンブル用 | 環境変数 `WEATHERAPI_KEY` を設定 |
| 気象庁 GRIB2（C） | 降雪を JMA に差し替え | 環境変数 `JMA_SNOW_GRIB2` に GRIB2 ファイルのパスを設定 |

## C: 気象庁 GRIB2 の用意

1. [気象庁 気象データ高度利用](https://www.data.jma.go.jp/developer/index.html) または [気象庁情報カタログ（降雪短時間予報）](https://www.data.jma.go.jp/suishin/cgi-bin/catalogue/make_product_page.cgi?id=SnowFcst) で配信形式を確認する。
2. 降雪短時間予報など GRIB2 を取得し、サーバー上にファイルとして配置する。
3. 環境変数でパスを指定: `export JMA_SNOW_GRIB2=/path/to/snow.grib2`
4. GRIB2 利用時は `pip install cfgrib xarray` を追加。`sources/jma_grib2.py` は格子データを緯度経度で補間する。実際の GRIB2 の変数名・時間次元は配信仕様に合わせて要修正。

## フロントでの利用

`ski-powder-hunter.html` 内で:

```js
const SNOW_API_BASE = 'http://localhost:8000';  // 空文字なら Open-Meteo 直叩き
```

にすると、この API を参照します。
