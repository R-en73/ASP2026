# ASO 卒業進級制作展

## GitHub Pages で公開

`main` ブランチへ push すると、GitHub Actions が自動でビルドして GitHub Pages に公開します。

リポジトリの **Settings > Pages > Source** で **GitHub Actions** を選択してください。
公開 URL は次の形式です。

`https://R-en73.github.io/ASP2026/`

GitHub Pages は静的ホスティングのため、作品投稿に使う `/api/upload` と OGP 取得用の
`/api/ogp` は別途サーバーへ配置する必要があります。Firebase の認証を使う場合は、
公開 URL を Firebase Authentication の承認済みドメインにも追加してください。

## ローカルで実行

1. Node.js を用意します。
2. 依存関係をインストールします。
   `npm install`
3. アプリを起動します。
   `npm run dev`
