# わかるらんど

[https://wakaruland.com](https://wakaruland.com)

[https://wakaruland.com/?@masui,@shokai,@napo0703,@registakm,@dorayaki0,@sasa_sfc,@hkrit0,@youngsnow_sfc,delta_door,delta_light,delta_temperature](https://wakaruland.com/?@masui,@shokai,@napo0703,@registakm,@dorayaki0,@sasa_sfc,@hkrit0,@youngsnow_sfc,delta_door,delta_light,delta_temperature)

## 概要

人や環境の状態がリアルタイムに**わかる**視覚化システムです

## 開発

依存ライブラリのインストール

    % npm i


watchify

    % npm run watch


gulp browsersync

    % npm run gulp

これだけで、自動的にローカルにサーバーが立ち上がる。

ローカルIPで立つので、同一ネットワーク内ならどの端末からでもみれる。

Liveloadを仕込んであるので、ファイル更新すると自動でブラウザもリロードされる。


## デプロイ

browserifyでビルドしてから現在のコミットを`gh-pages`ブランチとしてGitHub Pagesにpushする

    % npm run build
    % npm run push-gh-pages