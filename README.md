# Ploto LP

Ploto ランディングページ。日本語・英語・ドイツ語・フランス語・韓国語の5言語に対応し、各言語を**独立した静的URL**としてプリレンダリングして配信します。GitHub Pages（`hiroking-ocean.github.io/ploto_LP/`）から公開しています。

---

## ⚠️ いちばん大事なこと

**`index.html` や `en/` `de/` `fr/` `ko/` の中身を直接編集しないでください。**
これらは `npm run build` で自動生成される成果物です。次回ビルドで上書きされます。

編集してよいのは次の2系統だけです。

| 編集対象 | 役割 |
|----------|------|
| `template.html` | LPの構造・レイアウト（全言語共通の雛形） |
| `manual-template.html` | マニュアルの構造・レイアウト（全言語共通の雛形） |
| `styles.css` / `manual.css` | スタイルシート（全体 / マニュアル専用） |
| `app.js` / `manual.js` | フロントエンドロジック（LP / マニュアル専用） |
| `locales/*.js` | 各言語の翻訳テキスト・メタ情報（LPとマニュアル共通） |

---

## 更新の手順（最重要）

文言・デザイン・翻訳のどれを変えても、手順は同じ3ステップです。

```bash
# 1. template.html もしくは locales/*.js を編集する

# 2. ビルド（5言語ページ + sitemap.xml を一括生成）
npm run build

# 3. コミット & プッシュ（1回の push で全URLに反映される）
git add -A
git commit -m "update: 変更内容"
git push origin main
```

push 後、GitHub Pages が自動でデプロイし、以下の5URLすべてが同時に更新されます。

- `https://hiroking-ocean.github.io/ploto_LP/`      … 日本語（ルート）
- `https://hiroking-ocean.github.io/ploto_LP/en/`   … English
- `https://hiroking-ocean.github.io/ploto_LP/de/`   … Deutsch
- `https://hiroking-ocean.github.io/ploto_LP/fr/`   … Français
- `https://hiroking-ocean.github.io/ploto_LP/ko/`   … 한국어

> 初回のみ依存パッケージのインストールが必要です: `npm install`

---

## よくある作業别のやり方

### 文言（コピー）を変えたい
1. `locales/ja.js` の該当キーを編集（例: `hero_title`）。
2. 他言語でも同じ意味になるよう `locales/en.js` `de.js` `fr.js` `ko.js` の**同じキー**を編集。
3. `npm run build` → commit → push。

### セクションや要素を追加したい（新しい翻訳項目が増える場合）
1. `template.html` に要素を追加し、テキスト部分へ `data-i18n="新しいキー名"` を付与する。
   - 入力欄のプレースホルダなら `data-i18n-placeholder="..."`。
2. **全5言語**の `locales/*.js` の `i18n` ブロックに、その新しいキーと翻訳を追加する。
   - ⚠️ キーは必ず `i18n: { ... }` の**中**に書くこと（`gantt` など別オブジェクトに入れると表示されません）。
3. `npm run build` → commit → push。

> 翻訳キーの過不足はビルド時には警告されません。新キーを追加したら全言語に入れたか必ず確認してください（漏れた言語はその箇所だけ日本語のまま表示されます）。

### デザイン・レイアウトを変えたい
- 構造 → `template.html`
- スタイル → `styles.css`
- 動き（タブ・デモ・言語切替など）→ `app.js`
- 変更後は `npm run build`（template/翻訳を触っていなくても、成果物を最新にするため実行）→ commit → push。

### マニュアル（ヘルプ）を編集したい
- 構造 → `manual-template.html`
- マニュアル用スタイル → `manual.css`
- マニュアル用ロジック → `manual.js`
- 翻訳テキスト → `locales/*.js` の `manual_` から始まるキー
- 変更後は `npm run build` → commit → push。

---

## ファイル構成

```
ploto_LP/
├── template.html      ← 編集元（LPの雛形）
├── manual-template.html ← 編集元（マニュアルの雛形）
├── locales/
│   ├── ja.js / en.js / de.js / fr.js / ko.js   ← 編集元（翻訳）
│   └── index.js       ← 上記をまとめて読み込む（基本触らない）
├── build.js           ← ビルドスクリプト（基本触らない）
├── styles.css         ← LP用スタイル
├── manual.css         ← マニュアル用スタイル
├── app.js             ← LPフロントのロジック
├── manual.js          ← マニュアルフロントのロジック
├── assets/            ← ロゴ・スクリーンショット
│
├── index.html         ← 【生成物】日本語LPページ
├── manual/            ← 【生成物】日本語マニュアルページ（gantt.html 等）
├── en/ de/ fr/ ko/    ← 【生成物】各言語LPページ
│   └── manual/        ← 【生成物】各言語マニュアルページ（gantt.html 等）
├── sitemap.xml        ← 【生成物】サイトマップ
└── robots.txt         ← クローラ向け設定
```

---

## ビルドが内部でやっていること（参考）

`build.js` は `template.html` を雛形に、言語ごとに次を自動適用します。

- `data-i18n` / `data-i18n-placeholder` 箇所へ翻訳を流し込み
- `<html lang>`、`<title>`、`meta description` を各言語に設定
- `canonical` / `hreflang`（5言語 + x-default）/ OGP / Twitter Card / JSON-LD を各言語URL向けに生成
- アセットパスを `/ploto_LP/…` の絶対パスへ変換（サブディレクトリでの404防止）
- `sitemap.xml` を全URL分（hreflang 付き）生成

これにより各言語が検索エンジンに個別ページとして認識され、多言語SEOが機能します。

---

## デプロイ後のチェック（任意）

大きめの更新をしたときの確認項目:

1. 各言語URL（`/`, `/en/`, `/de/`, `/fr/`, `/ko/`）が表示され、文言が正しい言語になっているか
2. 言語スイッチャーで各URLへ遷移できるか
3. 翻訳キーを追加した場合、漏れた言語で日本語が残っていないか
4. `sitemap.xml` / `robots.txt` が公開されているか
5. （SEO）Google Search Console で `sitemap.xml` を再送信

---

## 開発メモ

- 言語の「正」はURL。各ページは自分の言語で静的に出力され、言語切替は該当URLへの遷移（`app.js` / `manual.js`）で行います。ブラウザ言語による自動リダイレクトはしません。
- 日本語はルート（`/`）および `/manual/` に配置。既存のリンク資産・canonical を維持するためです。
- ビルドには Node.js と `cheerio`（devDependency）を使用します。`node_modules/` と `.claude/` は Git 管理対象外です。

---

## ローカルでの動作確認方法

Ploto LPは、GitHub Pagesのサブディレクトリ `/ploto_LP/` を想定してアセットパスを絶対パス化（例: `/ploto_LP/styles.css`）しています。
そのため、ローカルでHTMLファイルをダブルクリックして直接ブラウザで開く（`file:///` 経由）と、パスが壊れてスタイルが適用されません。

ローカルで正しく動作確認するには、**親ディレクトリをルートとしたローカルサーバー**を立ち上げる必要があります。

**例: Node.js (http-server) を使用する場合**
1. リポジトリの親ディレクトリ（`ploto_LP` フォルダがある場所）に移動します。
2. 以下のコマンドでサーバーを起動します。
   ```bash
   npx http-server -p 8080
   ```
3. ブラウザで以下のURLにアクセスします。
   - LPトップ: `http://localhost:8080/ploto_LP/`
   - マニュアル: `http://localhost:8080/ploto_LP/manual/gantt.html`
