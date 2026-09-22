const Parser = require("rss-parser");
const { GoogleGenAI } = require("@google/genai");

const parser = new Parser();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  // =========================
  // 1. RSS取得
  // =========================

  const feed = await parser.parseURL("https://b.hatena.ne.jp/entrylist/it.rss");

  console.log(`取得した記事数: ${feed.items.length}`);

  // =========================
  // 2. 直近24時間の記事だけ取得
  // =========================

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentItems = feed.items.filter((item) => {
    const publishedDate = new Date(item.isoDate);
    return publishedDate >= oneDayAgo;
  });

  console.log(`直近24時間の記事数: ${recentItems.length}`);

  // =========================
  // 3. AIに渡すJSONを作成
  // =========================

  const newsItems = recentItems.map((item, index) => ({
    id: index + 1,
    title: item.title,
    summary: item.contentSnippet || "",
    url: item.link,
  }));

  console.log("AIにニュースを渡します");
  console.log("Gemini API呼び出し開始");

  // =========================
  // 4. Geminiでニュースを選ぶ
  // =========================

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: `
あなたはWebエンジニア向けのITニュース編集者です。

以下のニュース一覧から、Webエンジニアにとって特に有益なニュースを3件選んでください。

選定基準：
- Web開発に関係する
- AI、セキュリティ、クラウドなど技術的に重要
- エンジニアが知っておく価値がある
- 実務で参考になる
- 単なる話題性だけではなく、技術的な価値を重視する

各ニュースについて「point」を1〜2文で簡潔に説明してください。
「なぜ重要か」だけではなく、この記事から何を知っておくべきか、どんな点が参考になるかを具体的に書いてください。

必ずJSON形式だけで回答してください。
Markdownのコードブロックは使わないでください。
JSON以外の文章も出力しないでください。

JSONの形式：
[
  {
    "id": 1,
    "point": "この記事から知っておきたいポイント"
  },
  {
    "id": 5,
    "point": "この記事から知っておきたいポイント"
  },
  {
    "id": 8,
    "point": "この記事から知っておきたいポイント"
  }
]

titleとurlは、ニュース一覧にあるものをそのまま使用してください。
JSONには「title」「url」「point」以外の項目を追加しないでください。

ニュース一覧：
${JSON.stringify(newsItems, null, 2)}
`,
  });

  console.log("Gemini API呼び出し完了");
  console.log("Geminiの回答:");
  console.log(response.text);

  // =========================
  // 5. GeminiのJSONを解析
  // =========================

  const selectedNews = JSON.parse(response.text);

  console.log("選定されたニュース:");
  console.log(selectedNews);

  // =========================
  // 6. Discord用に整形
  // =========================

  let discordMessage = `## 📰 今日のITニュース

Webエンジニア向けに、直近24時間のニュースから3件ピックアップしました。

`;

  selectedNews.forEach((news, index) => {
    const originalNews = newsItems.find((item) => item.id === news.id);

    discordMessage += `### ${index + 1}. ${originalNews.title}

💡 ${news.point}

🔗 ${originalNews.url}

`;
  });

  discordMessage += `---
🤖 Geminiによる自動選定`;

  console.log("Discordに投稿する内容:");
  console.log(discordMessage);

  // =========================
  // 7. Discordに投稿
  // =========================

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  const discordResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: discordMessage,
    }),
  });

  if (!discordResponse.ok) {
    throw new Error(
      `Discordへの投稿に失敗しました: ${discordResponse.status} ${discordResponse.statusText}`,
    );
  }

  console.log(`Discord投稿結果: ${discordResponse.status}`);
}

exports.handler = async () => {
  try {
    await main();
  } catch (error) {
    console.error("エラー:", error);
    throw error;
  }
};

// ローカル実行
if (require.main === module) {
  main().catch((error) => {
    console.error("エラー:", error);
  });
}
