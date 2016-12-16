# わかるらんど

[https://wakaruland.com](https://wakaruland.com)

IoT時代の共有情報視覚化システム

## 使い方

- Chrome、Firefox、Safariで動作を確認しています
- 動かない場合は[デスクトップアプリケーション](https://github.com/napo0703/wakaruland-desktop)をご利用ください
  - 機能はブラウザ版と変わりません

### ユーザの一覧の作成

- 一覧に表示したいユーザのTwitterアカウントを集めてカンマ区切り`,`でURL末尾に記述します
  - 例えば [@napo0703](https://twitter.com/napo0703)、[@masui](https://twitter.com/masui)、[@dorayaki0](https://twitter.com/dorayaki0)、[@registakm](https://twitter.com/registakm) の4人を表示したければ、`https://wakaruland.com/?@napo0703,@masui,@dorayaki0,@registakm` というURLになります
- 作ったURLを使うユーザで共有します
- <img src="https://i.gyazo.com/9514344998b10fe480c7f9ff2443afbd.png" width="400px">

### スタンプの投稿
- 左上のメニューから投稿画面を表示します
- 一番上のテキストボックスに自分のTwitterアカウントを入力します
  - この例では `@napo0703` としています
  - 勝手にツイートすることはありません
- スタンプをクリックすると右側のユーザ一覧の自分の領域にスタンプがオーバーレイ表示されます
- スタンプの表示時間はデフォルトで20秒間に設定されており、投稿から20秒経つと自動的に取り下げられます
- 投稿時にスタンプを長押しすることで表示時間を設定することができます
- <img src="https://i.gyazo.com/d498734fef1099272a74346f6b535afd.gif" width="400px">

### スタンプの追加

- 自分でスタンプを作ってリストに追加することができます
- テキストスタンプ
  - テキストボックスに文字列を入力して追加ボタンまたはEnterキー押下で作成できます
  - 半角スペースは改行になります
- 画像スタンプ
  - Webにある画像をスタンプとして追加することができます
    - `http://www.wiss.org/images/wiss_logo.gif` などです
    - 画像を右クリックして「イメージのアドレスをコピー」すると楽です
  - 自分のPCにある画像を使いたい場合は[Gyazo](https://gyazo.com/)を使ってURLを得てください
    - Gyazoのアプリケーションアイコンに画像をドラッグ&ドロップするとアップロードできます
- ユーザの一覧から他のユーザが表示しているスタンプを自分のところにコピーすることができます


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
