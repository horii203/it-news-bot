# IT News Bot

Webエンジニア向けのITニュースを自動収集・選定し、Discordへ配信するBotです。

RSSから直近24時間のニュースを取得し、Gemini APIを使ってWebエンジニアにとって有益なニュースを3件選定します。選定したニュースはDiscord Webhookを使って自動投稿します。

## 概要

```text
RSS
 ↓
Node.js
 ↓
直近24時間の記事を抽出
 ↓
Gemini API
 ↓
Webエンジニア向けニュースを3件選定
 ↓
Discord Webhook
 ↓
Discordへ投稿
```

AWS LambdaとEventBridge Schedulerを利用することで、毎日決まった時間に自動実行できます。

## 主な機能

- Hatena Bookmark IT RSSからニュースを取得
- 直近24時間のニュースに絞り込み
- Gemini APIでニュースを選定
- Webエンジニア向けに3件をピックアップ
- 各ニュースの「ポイント」をAIが生成
- Discord Webhookで自動投稿
- AWS Lambdaによるサーバーレス実行
- EventBridge Schedulerによる定期実行

## 使用技術

- Node.js
- rss-parser
- Google Gemini API
- Discord Webhook
- AWS Lambda
- Amazon EventBridge Scheduler

## 必要な環境

- Node.js 20以上
- Gemini API Key
- Discord Webhook URL

## セットアップ

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd it-news-bot
```

### 2. パッケージをインストール

```bash
npm install
```

### 3. 環境変数を設定

ローカルで実行する場合は、以下の環境変数を設定します。

```text
GEMINI_API_KEY
DISCORD_WEBHOOK_URL
```

PowerShellの場合：

```powershell
$env:GEMINI_API_KEY="your-gemini-api-key"
$env:DISCORD_WEBHOOK_URL="your-discord-webhook-url"
```

APIキーやWebhook URLなどの秘密情報はGitHubへ公開しないでください。

## ローカル実行

```bash
node index.js
```

実行すると、

1. RSSからニュースを取得
2. 直近24時間の記事を抽出
3. Gemini APIへニュースを送信
4. 3件のニュースを選定
5. Discordへ投稿

という処理が実行されます。

## Discordへの投稿内容

Discordには以下のような形式で投稿されます。

```text
## 📰 今日のITニュース

Webエンジニア向けに、直近24時間のニュースから3件ピックアップしました。

### 1. ニュースタイトル

💡 この記事から知っておきたいポイント

🔗 https://example.com/

### 2. ニュースタイトル

💡 この記事から知っておきたいポイント

🔗 https://example.com/

### 3. ニュースタイトル

💡 この記事から知っておきたいポイント

🔗 https://example.com/

---
🤖 Geminiによる自動選定
```

## AWS Lambda

AWS LambdaではNode.jsランタイムを使用しています。

Lambdaの環境変数に以下を設定します。

```text
GEMINI_API_KEY
DISCORD_WEBHOOK_URL
```

Lambdaのハンドラーは以下です。

```text
index.handler
```

### Lambdaのタイムアウト

Gemini APIの処理に時間がかかる場合があるため、Lambdaのタイムアウトは3秒より長く設定します。

現在は1分に設定しています。

## 定期実行

Amazon EventBridge Schedulerを利用して、Lambdaを定期実行します。

```text
EventBridge Scheduler
        ↓
AWS Lambda
        ↓
ITニュース取得・AI選定
        ↓
Discord投稿
```

スケジュールは日本時間の毎日9:00を想定しています。

タイムゾーン：

```text
Asia/Tokyo
```

フレックスタイムウィンドウを設定する場合は、実行時間に多少の幅が生じます。

## セキュリティ

以下の情報はGitHubへコミットしないでください。

- Gemini API Key
- Discord Webhook URL
- AWSのアクセスキー
- その他の認証情報

ローカル環境では`.env`などを利用し、Git管理対象外にしてください。

`.gitignore`には以下を設定しています。

```text
node_modules/
.env
```

AWS Lambdaでは環境変数を利用して秘密情報を管理します。

## 今後の改善予定

- 複数のRSSフィードに対応
- AIによるニュースの重複除去
- AI・セキュリティ・クラウドなどカテゴリ別の配信
- Discordの複数チャンネルへの配信
- ニュースの取得元を一次情報中心にする
- エラー発生時の通知
- CloudWatchによる実行状況の監視
- ニュースの履歴管理

## License

個人学習・開発用プロジェクトです。
