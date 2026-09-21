const Parser = require("rss-parser");

const parser = new Parser();

async function main() {
  const feed = await parser.parseURL("https://b.hatena.ne.jp/entrylist/it.rss");

  console.log(`取得した記事数: ${feed.items.length}`);

  // 現在時刻から24時間前
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentItems = feed.items.filter((item) => {
    const publishedDate = new Date(item.isoDate);
    return publishedDate >= oneDayAgo;
  });

  console.log(`直近24時間の記事数: ${recentItems.length}`);

  // AIに渡すデータを作成
  const newsItems = recentItems.map((item) => ({
    title: item.title,
    url: item.link,
    summary: item.contentSnippet || "",
    publishedAt: item.isoDate,
  }));

  console.log("\nAIに渡すニュースデータ:");
  console.log(JSON.stringify(newsItems, null, 2));
}

main();
