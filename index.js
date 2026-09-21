const Parser = require("rss-parser");
const { GoogleGenAI } = require("@google/genai");

const parser = new Parser();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  // RSS取得
  const feed = await parser.parseURL("https://b.hatena.ne.jp/entrylist/it.rss");

  console.log(`取得した記事数: ${feed.items.length}`);

  // 直近24時間の記事
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentItems = feed.items.filter((item) => {
    const publishedDate = new Date(item.isoDate);
    return publishedDate >= oneDayAgo;
  });

  console.log(`直近24時間の記事数: ${recentItems.length}`);

  // AIに渡すJSON
  const newsItems = recentItems.map((item) => ({
    title: item.title,
    url: item.link,
    summary: item.contentSnippet || "",
    publishedAt: item.isoDate,
  }));

  console.log("AIにニュースを渡します");

  // Gemini
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: `
あなたはWebエンジニア向けのITニュース編集者です。

以下のニュース一覧から、Webエンジニアにとって特に有益だと思うニュースを3件選んでください。

選定基準：
- Web開発に関係する
- AI、セキュリティ、クラウドなど技術的に重要
- エンジニアが知っておく価値がある
- 単なる話題性だけではなく実用性も考慮する

各ニュースについて、
- タイトル
- URL
- 重要だと思う理由
を出してください。

ニュース一覧：
${JSON.stringify(newsItems, null, 2)}
`,
  });

  console.log("Geminiの回答:");
  console.log(response.text);
}

main().catch((error) => {
  console.error("エラー:", error);
});
