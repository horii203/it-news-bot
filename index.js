const Parser = require("rss-parser");

const parser = new Parser();

async function main() {
  const feed = await parser.parseURL("https://b.hatena.ne.jp/entrylist/it.rss");

  console.log(`取得した記事数: ${feed.items.length}`);

  feed.items.slice(0, 5).forEach((item, index) => {
    console.log(`${index + 1}. ${item.title}`);
    console.log(`   ${item.link}`);
    console.log("");
  });
}

main();
