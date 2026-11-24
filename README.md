# ASO 卒業進級制作展

## GitHub Pages で公開

`main` ブランチへ push すると、GitHub Actions が自動でビルドして GitHub Pages に公開します。

リポジトリの **Settings > Pages > Source** で **GitHub Actions** を選択してください。
公開 URL は次の形式です。

`https://R-en73.github.io/ASP2026/`

作品・PDF のアップロードはサーバーを介さず Firebase に直接保存します（PDF は Firebase Storage 優先、
Storage 未設定時は Firestore へ分割保存）。OGP 取得用の `/api/ogp` のみサーバーが必要なため、
必要に応じて別途サーバーへ配置してください。Firebase の認証を使う場合は、
公開 URL を Firebase Authentication の承認済みドメインにも追加してください。

## ローカルで実行

1. Node.js を用意します。
2. 依存関係をインストールします。
   `npm install`
3. アプリを起動します。
   `npm run dev`

## 技術スタック

### 現在の構成

- React 18 / TypeScript
- Vite
- Tailwind CSS
- React Router
- Firebase：Firestore、Authentication、Storage
- GitHub Pages
- GitHub Actions
- Express + Vite（ローカル開発サーバー）

### 導入候補

| デザインの方向性 | 推奨技術・ライブラリ | 特徴・得意な表現 |
| --- | --- | --- |
| モーション表現 | Motion（旧Framer Motion） / GSAP | React向けの宣言的アニメーション、スクロール連動、高度なタイムライン表現 |
| 3D・空間表現・没入感 | Three.js / React Three Fiber（R3F） / Spline | ブラウザ上での3Dモデル操作、GLSLシェーダー、ノーコード寄りの3D組み込み |
| 滑らかなスクロール体験 | Lenis | 慣性スクロールを実装し、GSAPと組み合わせてサイト全体の質感を向上 |
| シームレスな画面遷移 | Barba.js / View Transitions API | リロードを感じさせない連続的な画面遷移 |
| 洗練されたUIコンポーネント | Radix UI / shadcn/ui | アクセシビリティを保ちつつ自由度の高いヘッドレスUI |
| コンテンツ重視の静的サイト | Astro | コンテンツページの軽量化に優れるが、既存React SPAとの全面置換が必要 |
