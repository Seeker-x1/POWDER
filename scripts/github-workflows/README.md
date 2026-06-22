# GitHub Actions workflow テンプレート

`git push` で workflow を追加するには OAuth の **workflow** スコープが必要です。
ローカルから push できない場合は、次のいずれかで `.github/workflows/` に配置してください。

## 方法 A（推奨）: gh でスコープ追加後に push

```powershell
gh auth refresh -h github.com -s workflow,repo
Copy-Item scripts/github-workflows/*.yml .github/workflows/
git add .github/workflows/
git commit -m "Add JMA update workflows"
git push
```

## 方法 B: GitHub Web UI

1. リポジトリ → **Add file** → **Create new file**
2. パス: `.github/workflows/update-jma-snow.yml`
3. このフォルダの `update-jma-snow.yml` の内容を貼り付けて commit
4. 同様に `update-jma-prevday-hourly.yml` を追加

## 登録後の確認

Actions タブに次が表示されれば OK:

- **Update JMA snow cache**（毎時55分 JST）
- **Update JMA prev-day hourly**（毎日1:10 JST）
- **Update weather cache**（既存・毎時）

手動テスト: 各 workflow → **Run workflow**
