# scripts フォルダ

## ゲレンデ名の置き換え（今後も同じ対応で使う）

**update-resorts-list.ps1** … ゲレンデ名の変更時に、次の3ファイルを一括で置換します。

- RESORTS一覧.txt
- ski-powder-hunter.html
- ski-powder-hunter-en.html

UTF-8 で読み書きするため、日本語の名前変更でも確実に置換できます。

```powershell
# リポジトリのルート（POWDER）で実行
.\scripts\update-resorts-list.ps1 -Old "旧名称" -New "新名称"
```

くわしくは [ゲレンデ追加とリンク確認.md](../ゲレンデ追加とリンク確認.md) の「ゲレンデ名の置き換え」を参照。

---

## その他のスクリプト

### 気象・積雪精度（`docs/IMPLEMENTATION_ORDER_SNOW_ACCURACY.md`）

- **fetch-amedas-stations.js** … JMA アメダス全件 → `data/amedas-stations.json`
- **fetch-jma-snow.js** … 気象庁積雪・降雪 CSV → `data/jma-snow.json`（標高ペナルティ付き観測所選定）
- **fetch-jma-prevday-hourly.js** … 前日 JST 24h 降水・気温 → `data/jma-prevday-hourly.json`
- **fetch-weather-hourly.js** … Open-Meteo → `data/weather.json`
- **validate-snow-accuracy.js** … 予報 vs JMA 24h 実績の MAE レポート → `reports/`
- **warm-snow-api.js** … 自前 API キャッシュウォーム（`SNOW_API_BASE` 要）

### その他

- check-elevation.js / list-resorts.js … データ確認
- count-jma-coverage.js / count-jma-distance.js / debug-jma-distance.js … JMA 紐づけ診断
- check-links.js … 公式リンク確認
- merge-nearby-into-html.js / nearby-driving.js … 近隣リゾート・車距離
