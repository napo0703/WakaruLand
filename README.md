# わかるらんど

[https://wakaruland.com](https://wakaruland.com)

IoT時代の共有情報視覚化システム

## 使い方

- [https://wakaruland.com](https://wakaruland.com) にアクセス
- Twitterアカウント名を入れる
- スタンプをクリックする
  - 投稿時に自分のアイコンが右側に無かったら自動的に追加されます
  - 表示時間はデフォルトで20秒です
  - スタンプを長押しすると表示時間を変更することができます

### 動作環境
- Chrome、Firefox、Safariで動作を確認しています
- 上記以外のブラウザでは動かないかもしれません
- 上記のブラウザが使えない場合は[デスクトップアプリケーション](https://github.com/napo0703/wakaruland-desktop/releases/tag/v0.1.0)をご利用ください
  - 機能はブラウザ版と変わりません

### アカウント

- Twitterのアカウントを使用します
  - アイコンが右側のユーザ一覧の自分の領域の背景になります
  - 勝手にツイートすることはありません
  - Twitterのアカウントを持っていない方は新しく取得するか、[@napo0703](https://twitter.com/napo0703)までご連絡ください

### スタンプの作成

- 自分でスタンプを作ってリストに追加することができます
- テキストスタンプ
  - テキストボックスに文字列を入力してEnterキー押下で作成できます
  - 半角スペースは改行になります
- 画像スタンプ
  - Webにある画像をスタンプとして追加することができます
    - `http://www.wiss.org/images/wiss_logo.gif` などです
    - 画像を右クリックして「イメージのアドレスをコピー」すると楽です
  - 自分のPCにある画像を使いたい場合は[Gyazo](https://gyazo.com/)を使ってURLを得てください
    - Gyazoのアプリケーションアイコンに画像をドラッグ&ドロップするとアップロードできます
  - [いらすとや](http://www.irasutoya.com)や[LINEのスタンプショップ](https://store.line.me/stickershop/showcase/top/ja)などがおすすめです
- ユーザの一覧から他のユーザが表示しているスタンプを自分のところにコピーすることができます

### Wiki（Scrapbox）

詳しい使い方やよくある質問は[Wiki](https://scrapbox.io/wakaruland/)をご覧ください

## 開発

依存ライブラリのインストール

    % npm i


watchify

    % npm run watch


gulp browsersync

    % npm run gulp

### デプロイ

browserifyでビルドしてから現在のコミットを`gh-pages`ブランチとしてGitHub Pagesにpushする

    % npm run build
    % npm run push-gh-pages