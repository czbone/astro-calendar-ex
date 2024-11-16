# Astroベースのイベントカレンダーシステム

Astroフレームワークベースのカレンダーシステムです。
ユーザログイン機能を持ち、カレンダーに表示するイベントを管理することができます。

主な仕様は以下です。

- AstroフレームワークベースのSSRシステム
- ユーザ情報、イベント情報をMariaDBで管理。DBはPrismaで接続。
- セッション情報をRedisで管理
- TypeScript言語
- バックエンドはNode.jsベース
- フロントエンドは、Tailwind, Flowbite, Reactコンポーネントで構成

![screencapture-localhost-3000-2024-08-16-11_55_49](https://github.com/user-attachments/assets/ad352e7d-3d34-4034-8a5f-21ca3eb21c8d)

## 環境

必要な環境は以下です。

- Node v20.0以上
- MariaDB v10.0以上
- Redis v7.0以上

## インストール

必要なモジュールをインストールします。**Prismaクライアント**をインストールします。

```
pnpm install
npx prisma generate
```

## 接続情報の設定

MariaDBのRedesの接続情報を設定します。
`.env`ファイルの`DATABASE_URL`と`SESSION_REDIS_URL`に接続可能な値を設定します。

```
DATABASE_URL=mysql://testuser:testuser@localhost:3306/calendar-db
SESSION_REDIS_URL=redis://localhost:6379/
```

## DB構築

Prismaの初期化とDBの作成を行います。

```
npx prisma migrate dev --name init
```

## 起動

デバッグ起動の方法です。
VSCodeの**実行とデバッグ**の機能で、**デバッグの開始**から**Development server**を起動します。
Webブラウザで以下のURLにアクセスします。

```
http://localhost:3000
```

ページ右上の**ユーザ**アイコンのリンクからログインを行います。
アカウント`admin@example.com`とパスワード`password`で管理者アカウントでログインできます。

## ビルドからの起動

ビルドモジュールを作成し、単体起動するには以下を行います。

```
pnpm build
pnpm start
```

## ライセンス

MITライセンスに準じます。

[MIT](./LICENSE)