# わかるらんど

[https://wakaruland.com](https://wakaruland.com)

[https://wakaruland.com/?masui,napo0703,dorayaki0,registakm](https://wakaruland.com/?masui,napo0703,dorayaki0,registakm)

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

browserifyでビルドする必要がある

    % npm run build