# わかるらんど

[https://wakaruland.com](https://wakaruland.com)

[https://wakaruland.com/?masui,napo0703,dorayaki0,registakm](https://wakaruland.com/?masui,napo0703,dorayaki0,registakm)

## 概要

学会での発表や授業など、多くの人に一方的に話をする際に聴衆の反応を共有するシステムです。


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