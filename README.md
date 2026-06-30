# JapawSerch (POWDER)

日本のスキー場情報を扱う `POWDER` 本体プロジェクトです（**ベータ・個人開発**）。  
このリポジトリ内で、必要に応じて Gemini 連携（文案生成・補助）も使える構成にしています。

**正規リポジトリ:** https://github.com/momentum-create/POWDER  
**ライセンス:** [MIT](LICENSE) · **プライバシー:** [privacy.html](privacy.html)  
**Reddit 等の公開時:** [docs/REDDIT-PUBLISH.md](docs/REDDIT-PUBLISH.md)

## 免責（要約）

本アプリのスコア・ランキングは**参考指数**であり、滑走可否・安全判断・公式予報の代替ではありません。ゲレンデ公式・気象庁・現地判断を優先してください。

## データ出典

| データ | 出典 |
|--------|------|
| 予報（降雪・風・気温） | [Open-Meteo](https://open-meteo.com/) |
| 積雪観測・降雪タイル | [気象庁](https://www.jma.go.jp/) |
| 地図 | [OpenStreetMap](https://www.openstreetmap.org/copyright) · [CARTO](https://carto.com/attributions/) |
| ゲレンデ名・座標等 | リポジトリ内 `data/`（手動・スクリプト整備） |

第三者データの利用・再配布は各提供元の条件に従います。詳細は各 HTML フッターも参照。

## プロジェクト構成

- `ski-powder-hunter.html` / `ski-powder-hunter-en.html`: メイン表示ページ
- `data/`: ゲレンデ名・観測データ・サンプル
- `scripts/`: データ加工・確認スクリプト（Node/Python）
- `ask_gemini.py`: Gemini 単発実行
- `scripts/daily_x_proposal.py`: 日次のX投稿案生成パイプライン
- `.cursor/rules/`: Cursor 運用ルール

## セットアップ

### Node 側（JapawSerch 本体）

```bash
npm install
```

### Gemini 側（必要時のみ）

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

`.env` に `GEMINI_API_KEY=...` を設定（`.env.example` 参照）。**`.env` はコミットしない。**

## よく使うコマンド

- リゾート英語名生成: `npm run generate-resort-names-en`
- Gemini 単発: `python ask_gemini.py "質問文"`
- Gemini（長文入力）: `python ask_gemini.py --prompt-file daily_prompt.txt -o gemini_result.md`
- 日次X案: `python scripts/daily_x_proposal.py`

## 運用方針

- `POWDER` は JapawSerch 本体の作業を継続
- Gemini は「必要な作業だけ」補助的に利用
- `momentumX` は別運用（内容を自動共有しない）

## セキュリティ

公開前監査メモ: [docs/SECURITY-AUDIT-2026-06-30.md](docs/SECURITY-AUDIT-2026-06-30.md)
