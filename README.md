# Japowserch (JAPOWSERCH)

日本のスキー場情報を扱う本体プロジェクトです。ブランド名は **Japowserch**。ローカルの作業フォルダは **JAPOWSERCH**（例: `デスクトップ\Cloude\JAPOWSERCH`）。GitHub 上のリポジトリ名は **`japowserch`** を推奨しますが、既存の別名でも問題ありません。  
このリポジトリ内で、必要に応じて Gemini 連携（文案生成・補助）も使える構成にしています。

## プロジェクト構成

- `ski-powder-hunter.html` / `ski-powder-hunter-en.html`: メイン表示ページ
- `data/`: ゲレンデ名・観測データ・サンプル
- `scripts/`: データ加工・確認スクリプト（Node/Python）
- `ask_gemini.py`: Gemini 単発実行
- `scripts/daily_x_proposal.py`: 日次のX投稿案生成パイプライン
- `.cursor/rules/`: Cursor 運用ルール

## セットアップ

### Node 側（Japowserch 本体）

```bash
npm ci
```

依存の追加・更新時のみ `npm install <pkg>` を使い、`package-lock.json` をコミットする。

### Gemini 側（必要時のみ）

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

`.env` に `GEMINI_API_KEY=...` を設定（`.env.example` 参照）。

## Git（push はこのフォルダから）

このフォルダが **Git 管理の正本** です。リモートは `https://github.com/momentum-create/POWDER.git`（リポジトリ名は POWDER のまま）。

```powershell
cd $HOME\Desktop\Cloude\JAPOWSERCH
git status
git add .
git commit -m "変更内容の要約"
git pull --rebase origin main
git push origin main
```

GitHub Desktop を使う場合も、**ローカルリポジトリのパスを `JAPOWSERCH` に変更**してください。旧 `Desktop\Cloude\POWDER` には `.git` はありません。

## よく使うコマンド

- リゾート英語名生成: `npm run generate-resort-names-en`
- Gemini 単発: `python ask_gemini.py "質問文"`
- Gemini（長文入力）: `python ask_gemini.py --prompt-file daily_prompt.txt -o gemini_result.md`
- 日次X案: `python scripts/daily_x_proposal.py`

## 運用方針

- `JAPOWSERCH` で Japowserch 本体の作業を継続（ローカルは OneDrive からデスクトップへ移動済み）
- Gemini は「必要な作業だけ」補助的に利用
- `momentumX` は別運用（内容を自動共有しない）
