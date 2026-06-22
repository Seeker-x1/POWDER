# JapawSerch (POWDER)

日本のスキー場情報を扱う `POWDER` 本体プロジェクトです。  
このリポジトリ内で、必要に応じて Gemini 連携（文案生成・補助）も使える構成にしています。

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

`.env` に `GEMINI_API_KEY=...` を設定（`.env.example` 参照）。

## よく使うコマンド

- リゾート英語名生成: `npm run generate-resort-names-en`
- Gemini 単発: `python ask_gemini.py "質問文"`
- Gemini（長文入力）: `python ask_gemini.py --prompt-file daily_prompt.txt -o gemini_result.md`
- 日次X案: `python scripts/daily_x_proposal.py`

## 運用方針

- `POWDER` は JapawSerch 本体の作業を継続
- Gemini は「必要な作業だけ」補助的に利用
- `momentumX` は別運用（内容を自動共有しない）
