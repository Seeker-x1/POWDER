# GitHub でこのプロジェクトを公開する手順（初心者向け）

GitHub アカウントを作ったあと、このフォルダ（POWDER）を GitHub に上げて誰でも見られるようにする方法です。

---

## 結局、何かインストールしないといけない？

**「インストールしたくない」** なら、**ブラウザだけでファイルをアップロードする方法（方法 C）** があります。  
そのかわり、**あとから更新するときも、毎回ブラウザからファイルを上げ直す**ことになります。

| 方法 | インストール | やること | 向いている人 |
|------|----------------|----------|----------------|
| **C. ブラウザでアップロード** | **なし** | GitHub のサイトで「ファイルを追加」→ フォルダごとドラッグ＆ドロップ | とにかく何も入れたくない・1回だけ公開すればよい |
| **A. GitHub Desktop** | GitHub Desktop を1つ入れる | ソフトで「このフォルダ」を選んでボタンで送る | コマンドは打ちたくない・今後も更新していきたい |
| **B. PowerShell** | Git を1つ入れる | コマンドを打って送る | コマンドで操作したい人 |

- **何も入れたくない** → **方法 C**（下に手順あり）
- **1回だけ入れて、今後は楽に更新したい** → **方法 A**（GitHub Desktop）
- **コマンドでやりたい** → **方法 B**（PowerShell）

---

## 方法 C: ブラウザだけで公開する（インストールなし）

PC に **Git も GitHub Desktop も入れず**、GitHub のサイト上でファイルをアップロードする方法です。

### C-1. GitHub で新しいリポジトリを作る

1. ブラウザで **https://github.com** を開いてログイン
2. 右上 **「+」** → **「New repository」**
3. **Repository name** に `POWDER` など好きな名前を入力
4. **Public** を選択
5. **「Add a README file」はチェックしない**（あとでこちらのファイルを上げるため）
6. **「Create repository」** をクリック

### C-2. ファイルをアップロードする

1. 作成したリポジトリのページで、**「uploading an existing file」** のリンクを押す  
   または **「Add file」** → **「Upload files」** を選ぶ
2. 開いた画面に、**POWDER フォルダの中身**をドラッグ＆ドロップする  
   - `ski-powder-hunter.html`、`README.md`、`GITHUB_公開手順.md`、`api` フォルダなど、**フォルダごと**または**ファイルをまとめて**ドロップして OK
3. 下の **「Commit changes」** を押す

→ これで GitHub に公開された状態になります。

**注意**  
- あとで「中身を更新したい」ときは、また GitHub の同じページで **「Add file」** → **「Upload files」** から、更新したファイルを上げ直す必要があります。  
- インストールなしでできるかわりに、**更新は手動アップロード**になります。

### C-3. サイトをブラウザで見る（GitHub Pages）

**Settings** → **Pages** → Source で **Deploy from a branch**、Branch で **main** を選んで **Save** すると、  
`https://あなたのユーザー名.github.io/リポジトリ名/ski-powder-hunter.html` でサイトを開けます。

---

## 方法 A: GitHub Desktop で公開する（コマンド不要）

PowerShell を使わず、**GitHub Desktop** という無料ソフトだけで公開する手順です。

### A-1. GitHub Desktop を入れる

1. ブラウザで **https://desktop.github.com/** を開く
2. **「Download for Windows」** をクリックしてインストーラーをダウンロード
3. ダウンロードしたファイルを実行して、指示どおりインストール
4. 起動したら **GitHub アカウントでサインイン**（「Sign in to GitHub.com」でログイン）

### A-2. 「このフォルダ」を GitHub Desktop で開く

1. GitHub Desktop のメニューで **「File」** → **「Add local repository」**（ローカルリポジトリを追加）を選ぶ
2. **「Choose...」** を押して、**POWDER フォルダ**（`デスクトップ\CLOUDE\POWDER`）を選ぶ
3. 「This directory does not appear to be a Git repository」と出たら → **「create a repository」** のリンクを押す（このフォルダを Git の管理下にします、という意味）
4. 開いた画面で **「Create Repository」** を押す

→ POWDER フォルダが GitHub Desktop に表示されます。

### A-3. 最初の「コミット」をする

1. 左側に **変更されたファイルの一覧**（ski-powder-hunter.html や README.md など）が出ます
2. 左下の **「Summary」** に「初回」など好きなメッセージを入力
3. **「Commit to main」** という青いボタンを押す

→ 「送る準備」ができた状態になります。

### A-4. GitHub に送る（プッシュ）

1. 画面上部の **「Publish repository」** を押す  
   （すでに GitHub にリポジトリを作っている場合は **「Push origin」** と表示されます）
2. **Name** にリポジトリ名（例: `POWDER`）を入力
3. **Description** は空欄で OK
4. **「Keep this code private」** のチェックを **外す**（Public で公開する場合）
5. **「Publish Repository」** を押す

→ GitHub にアップロードされます。ブラウザで GitHub を開くと、ファイルが並んでいます。

**すでに GitHub でリポジトリを作っている場合**  
- **「Publish repository」** ではなく **「Push origin」** が出る場合は、それを押すだけです。  
- まだリポジトリを作っていない場合は、A-2 のあとに GitHub のブラウザで「New repository」でリポジトリを作り、GitHub Desktop で **「Publish repository」** を選べば、その名前で作成・アップロードされます。

### A-5. サイトをブラウザで見る（GitHub Pages）

手順は **ステップ 4** と同じです。GitHub のリポジトリページ → **Settings** → **Pages** → Source で **Deploy from a branch**、Branch で **main** を選んで **Save** すると、`https://あなたのユーザー名.github.io/リポジトリ名/ski-powder-hunter.html` でサイトを開けます。

---

## 方法 B: PowerShell（コマンド）で公開する

以下は、PowerShell でコマンドを打って公開する手順です。**方法 A を使う場合は、ここは読まなくて大丈夫です。**

---

## 手順の流れ（方法 B の場合）

1. **Git を用意する**（まだ入っていなければ）
2. **GitHub で「新しいリポジトリ」を作る**
3. **このフォルダから GitHub に送る（プッシュ）**

最後に **GitHub Pages** を有効にすると、サイトをブラウザで開ける URL がもらえます。

---

## ステップ 0: このフォルダを開いておく

エクスプローラーで次のフォルダを開いておいてください。

```
デスクトップ → CLOUDE → POWDER
```

この **POWDER** フォルダの中に、`ski-powder-hunter.html` や `README.md` などがある状態にします。

---

## ステップ 1: Git を用意する

### 1-1. すでに Git が入っているか確認する

1. **PowerShell** または **コマンドプロンプト** を開く  
   - スタートメニューで「PowerShell」や「cmd」と入力して起動
2. 次のコマンドを入力して Enter：

   ```
   git --version
   ```

3. `git version 2.xx.x` のように表示されれば **Git は入っています**。ステップ 2 へ。

### 1-2. 入っていない場合：Git をインストールする

1. ブラウザで **https://git-scm.com/download/win** を開く
2. 「Click here to download」などで **64-bit Git for Windows** をダウンロード
3. ダウンロードしたインストーラーを実行
4. 基本的には「Next」のまま進めて OK（そのままで大丈夫です）
5. インストールが終わったら、**PowerShell を一度閉じて、もう一度開き直す**
6. もう一度 `git --version` を実行して、バージョンが表示されれば OK

---

## ステップ 2: GitHub で「リポジトリ」を作る

**リポジトリ** = プロジェクトのコードを置いておく場所、と思って大丈夫です。

1. ブラウザで **https://github.com** を開く
2. ログインする（作ったアカウントで）
3. 画面右上の **「+」** をクリック → **「New repository」** を選ぶ
4. 次のように入力する：

   | 項目 | 入力例 | 説明 |
   |------|--------|------|
   | **Repository name** | `POWDER` または `ski-powder-hunter` | 好きな名前でOK（半角英数字とハイフン） |
   | **Description** | （任意）日本全国450スキー場のパウダー予報サイト | 空欄でもOK |
   | **Public** | 選択する | 誰でも見られるようにする |
   | **Add a README file** | **チェックしない** | こちらのフォルダにすでに README があるため |

5. **「Create repository」** をクリック

6. 次の画面で **「…or push an existing repository from the command line」** という枠が出ます。  
   ここに書いてある **3つのコマンド** は、次のステップで同じことを手順どおりやるので、いったんそのままにしておいて大丈夫です。

---

## 「このフォルダから GitHub に送る」って何をしているの？

やっていることは **2つだけ** です。

1. **あなたの PC の POWDER フォルダを「Git で管理する」**  
   → 「どのファイルを GitHub に送るか」を Git に教える
2. **その内容を GitHub のサーバーにアップロードする**  
   → 送り先は「あなたが GitHub で作ったリポジトリの URL」

そのために、下の **6つのコマンド** を **順番に 1つずつ** 打っていきます。  
「なぜこれで送れるのか」が気にならなければ、**番号のとおりに打つだけ**で大丈夫です。

| 番号 | 打つコマンド | やっていること（イメージ） |
|------|----------------|----------------------------|
| ① | `cd ...`（下の 3-1） | 「これからは POWDER フォルダで作業する」と指定する |
| ② | `git init` | このフォルダを「Git で管理するフォルダ」にする |
| ③ | `git add .` | フォルダの中のファイルを「送る候補」に入れる |
| ④ | `git commit -m "初回"` | 候補を「1つのまとまり（履歴）」として確定する |
| ⑤ | `git remote add origin あなたのURL` | 「送り先はこの GitHub の URL」と登録する |
| ⑥ | `git push -u origin main` | そのまとまりを、GitHub に実際に送る（アップロード） |

⑥ のときだけ、GitHub の **ユーザー名** と **パスワード（トークン）** を聞かれることがあります。  
そのときは、下の「パスワードを聞かれたら」のところを見てください。

**打つ順番だけチェックリスト（POWDER フォルダに移動したあと）**

- [ ] `git init`
- [ ] `git add .`
- [ ] `git commit -m "初回"`
- [ ] `git branch -M main`
- [ ] `git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git`  
  ※ **あなたのユーザー名** と **リポジトリ名** を、GitHub で作ったものに書き換える
- [ ] `git push -u origin main`  
  ※ ここでパスワードを聞かれたら「パスワードを聞かれたら」の説明どおりトークンを使う

---

## ステップ 3: このフォルダから GitHub に送る（プッシュ）

### 3-1. ターミナルで POWDER フォルダに移動する（＝①に当たる作業）

1. **PowerShell** または **コマンドプロンプト** を開く
2. 次のコマンドを **1行ずつ** 入力して Enter（`POWDER` の前は半角スペース1つ）：

   ```powershell
   cd OneDrive\デスクトップ\CLOUDE\POWDER
   ```

   ※ もし「デスクトップ」が別の場所にある場合は、エクスプローラーで POWDER フォルダを開き、アドレス欄に表示されているパスを確認して、それに合わせて `cd` の後を書き換えてください。

   **別の方法（確実）：**
   - エクスプローラーで **POWDER** フォルダを開く
   - アドレス欄をクリックしてパスを全選択（Ctrl+A）→ コピー（Ctrl+C）
   - PowerShell で `cd ` と入力したあと、**スペース1つ** 入れてから、貼り付け（Ctrl+V）
   - 例: `cd C:\Users\Takum\OneDrive\デスクトップ\CLOUDE\POWDER`
   - Enter

3. 今いる場所を確認するには：

   ```powershell
   dir
   ```

   `ski-powder-hunter.html` や `README.md` が出てくれば、正しいフォルダです。

### 3-2. Git の「初回設定」（初めて Git を使う場合だけ）

次の2つは、**Git を初めて使うときだけ** 実行します（メールと名前は GitHub に表示されます）。

```powershell
git config --global user.email "あなたのメール@例.com"
git config --global user.name "あなたのGitHubのユーザー名"
```

※ `" "` の中を、自分のメールと GitHub のユーザー名に書き換えてください。

---

### ②〜④：Git で「送る準備」をする

ここからは **1行ずつ** 打って、**毎回 Enter** を押します。

**② このフォルダを「Git 管理」にする**

```powershell
git init
```

→ 最後に `Initialized empty Git repository in ...` のような英文が出れば OK です。

**③ 中のファイルを「送る候補」に入れる**

```powershell
git add .
```

→ 何も出なくても大丈夫です。そのまま次へ。

**（確認）何が送られるか見る（やらなくてもよい）**

```powershell
git status
```

→ 緑色で `ski-powder-hunter.html` や `README.md` などが出ていれば OK です。

**④ 送る内容を「1つのまとまり」として確定する**

```powershell
git commit -m "初回"
```

※ `"初回"` の部分は「最初の投稿」のような意味で、好きな言葉に変えて大丈夫です。

→ `1 file changed` や `create mode ...` のような表示が出れば OK です。

**④のあと：ブランチ名を main にする（必須）**

```powershell
git branch -M main
```

→ 何も出なくても大丈夫です。

---

### ⑤：送り先（GitHub の URL）を登録する

1. **ブラウザ**で GitHub を開き、**あなたが作ったリポジトリのページ**を表示する
2. 緑色の **「Code」** ボタンを押す
3. **「HTTPS」** と書いてある下の **URL をコピー**する  
   例: `https://github.com/takum-skier/POWDER.git`
4. 次のコマンドの **`ここに貼り付け`** の部分を、コピーした URL に **置き換えて** 実行する

```powershell
git remote add origin ここに貼り付け
```

例（あなたの URL が `https://github.com/takum-skier/POWDER.git` なら）：

```powershell
git remote add origin https://github.com/takum-skier/POWDER.git
```

→ 何も出なければ成功です。

---

### ⑥：GitHub に実際に送る（プッシュ）

```powershell
git push -u origin main
```

ここで **ユーザー名とパスワードを聞かれた場合** は、下の **「パスワードを聞かれたら」** を見てください。

うまくいくと、最後に `Branch 'main' set up to track...` や `Writing objects: 100%` のような表示が出て、GitHub のリポジトリページを更新するとファイルが並んでいます。

---

### パスワードを聞かれたら（重要）

GitHub は **通常のログイン用パスワード** ではプッシュできません。  
代わりに **Personal Access Token（トークン）** という「専用のパスワード」を使います。

- **Username** を聞かれたら → **GitHub のユーザー名**（例: takum-skier）を入力
- **Password** を聞かれたら → **ログイン用パスワードではなく、下で作ったトークン** を貼り付ける

#### トークンをまだ持っていない場合

1. GitHub で **右上のアイコン** → **「Settings」**
2. 左の一番下 **「Developer settings」**
3. **「Personal access tokens」** → **「Tokens (classic)」**
4. **「Generate new token (classic)」**
5. **Note** に「POWDER用」など好きな名前
6. **Expiration** で有効期限（例: 90 days または No expiration）
7. **repo** にチェックを入れる
8. **「Generate token」** を押す
9. 表示された **トークン（ghp_ で始まる文字列）** をコピーし、**安全な場所に保存**
10. プッシュ時に「Password」を聞かれたら、この **トークン** を貼り付ける（パスワード欄に貼ってOK）

ここまで成功すると、GitHub のリポジトリページを更新すると、ファイル一覧が表示されます。

---

## ステップ 4: サイトをブラウザで見られるようにする（GitHub Pages）

HTML を **GitHub Pages** で公開すると、  
`https://あなたのユーザー名.github.io/リポジトリ名/` でサイトを開けます。

1. GitHub の **リポジトリのページ** を開く
2. 上のメニューで **「Settings」** をクリック
3. 左の一覧で **「Pages」** をクリック
4. **「Build and deployment」** の **Source** で：
   - **「Deploy from a branch」** を選ぶ
5. **Branch** で：
   - **main** を選ぶ
   - 右のフォルダは **「/ (root)」** のまま
6. **「Save」** を押す
7. 少し待つ（1〜2分）と、上部に  
   **Your site is live at `https://○○○.github.io/POWDER/`** のような表示が出ます

### サイトの開き方

- **トップページ（ランキング）**:  
  `https://あなたのユーザー名.github.io/POWDER/ski-powder-hunter.html`  
  または  
  `https://あなたのユーザー名.github.io/POWDER/ski-powder-hunter.html` を **index.html にリネームして** 置くと、  
  `https://あなたのユーザー名.github.io/POWDER/` だけで開けます（任意）。

※ 初回は反映に 1〜2 分かかることがあります。  
※ 気象データは **Open-Meteo** をブラウザから直接読むので、**このページを開いた人がアクセスした時点の最新** が表示されます。  
※ 下の「天気データを1時間ごとに自動更新」を有効にしている場合は、**1時間ごとに保存されたキャッシュ** を読み、その時点では API をほとんど叩きません。

---

## 天気データを1時間ごとに自動更新する（任意）

このリポジトリには **GitHub Actions** の設定（`.github/workflows/update-weather.yml`）が入っています。

- **何をするか**  
  毎時 0 分（UTC）に、全ゲレンデの天気を Open-Meteo から取得し、`data/weather.json` に保存してコミット・プッシュします。  
  サイトを開いた人は、まずこのファイルを読み、あればそれを使うので、**開いた瞬間にほぼ全件のデータが表示**されます。

- **有効になる条件**  
  リポジトリを **Git でクローンしてプッシュする方法（方法 A または B）** で公開している場合、このワークフローは **自動で有効** です。  
  **方法 C（ブラウザでアップロードのみ）** の場合は、`.github` フォルダごとアップロードすれば有効になります。

- **手動で1回だけ実行したい**  
  GitHub のリポジトリページ → **Actions** タブ → 左の **「Update weather cache」** を選ぶ → **「Run workflow」** を押す。

- **初回**  
  最初は `data/weather.json` がないので、1回目のワークフロー実行後にファイルが作られ、2回目以降の訪問からキャッシュが効きます。

---

## 収益化とSEOについて

### 付近の店・病院リンク（収益化）

地図でゲレンデを選ぶとポップアップ内に、**スキー・スノボ系**（最優先）と **病院・医院** の2ブロックが表示されます。

- **スキー・スノボ（機材・修理・紛失）** — 最優先で表示  
  デフォルト: スキーレンタル、スノボレンタル、スキー・スノボ 修理・紛失、宿泊の検索リンク（ゲレンデ名入り）。
- **病院・医院（外科・内科・総合病院）**  
  デフォルト: 外科、内科、総合病院の検索リンク（ゲレンデ名入り）。
- **収益化する場合**  
  特定の店・病院のURL（アフィリエート等）を出したいときは、HTML内で **`NEARBY_SHOPS_BY_RESORT[ゲレンデID]`** / **`NEARBY_SHOPS_BY_REGION["hokkaido"]`**（店用）、**`NEARBY_MEDICAL_BY_RESORT[ゲレンデID]`** / **`NEARBY_MEDICAL_BY_REGION["hokkaido"]`**（病院用）に、`{ name: "表示名", url: "https://...", sponsored: true }` の配列を入れてください。  
  有料リンクには `rel="nofollow sponsored"` が付きます。

### クリックでマップに飛ぶ構造のSEO

- **現状**  
  トップのカードや「マップで見る」をクリックすると、**同じ1ページ内で表示が切り替わるだけ**（別URLには飛ばない）です。  
  検索エンジンからは **「1つのURL・1つのコンテンツ」** として見えます。
- **SEO的にどう読まれるか**  
  - トップ → マップ、詳細 → マップ は **内部リンクではなく「画面上の切り替え」** なので、**別ページとしての評価（被リンク・インデックス）はありません**。  
  - アンカーテキスト（「マップで見る」「詳細確認」など）はHTMLに書かれているのでクローラーには読まれ、「何のための操作か」は伝わります。  
  - **問題になりにくい点**  
    メインの価値（ランキング・積雪・マップ）が1ページにまとまっているので、**「このURL = パウダー情報の入口」** として評価されやすく、ユーザーがトップからマップへ進む流れは**サイトの目的に沿った自然な導線**です。
- **さらにSEOを強くする場合**  
  - ゲレンデごとや「マップ」「トップ」を**別URL**にしたい場合は、`/#map` や `/#resort/123` のようにハッシュを使い、必要に応じて `history.pushState` でURLを書き換える実装にすると、**共有・ブックマークしやすく、クロール対象も増やせます**。  
  - その場合、「トップのカードをクリック → マップ画面（別URL）に飛ぶ」は **通常の内部リンク** として扱われ、SEO上も分かりやすい構造になります。

---

## まとめ

| やったこと | 結果 |
|------------|------|
| Git でフォルダをリポジトリ化 | このプロジェクトが Git 管理になった |
| GitHub にプッシュ | コードが GitHub 上に保存され、誰でも見られる（Public の場合） |
| GitHub Pages を有効化 | ブラウザでサイトを開ける URL がもらえた |

---

## よくあるつまずき

- **「git が認識されない」**  
  → Git を入れたあと、**PowerShell を閉じて開き直す**。パスが通っていない場合は、PC を再起動してみる。

- **「Permission denied」「403」**  
  → プッシュ時には **パスワードの代わりに Personal Access Token** を使う。

- **「branch 'main' not found」**  
  → `git branch -M main` を実行してから `git push -u origin main` をする。

- **GitHub Pages で 404**  
  → 数分待つ。URL は `https://ユーザー名.github.io/リポジトリ名/` で、**リポジトリ名** を忘れずに。

---

ここまでで「GitHub に公開する」と「ブラウザで見られるようにする」が一通りできます。  
次にコードを直したときは、同じフォルダで：

```powershell
git add .
git commit -m "〇〇を変更"
git push
```

とすると、変更が GitHub と GitHub Pages に反映されます。
