const { chromium } = require('playwright');
const fs = require('fs');
const { domain, startUrl, outputDir } = require('./config'); // 引入設定檔
const visitedUrls = new Set(); // 已訪問的 URL 集合

async function crawl(url) {
    if (visitedUrls.has(url) || !url.includes(domain)) {
        return;
    }

    visitedUrls.add(url);
    console.log(`Crawling: ${url}`);

    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // 抓取網頁內容
        const title = await page.title();
        const rawContent = await page.content();
        const timestamp = new Date().toISOString();

        // 儲存為 Markdown 檔案
        const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
        const filePath = `${outputDir}/${fileName}`;
        const markdownContent = `# ${title}\n\n- URL: ${url}\n- Timestamp: ${timestamp}\n\n${rawContent}`;
        fs.writeFileSync(filePath, markdownContent, 'utf8');

        // 抓取內部連結
        const links = await page.$$eval('a', (anchors, domain) =>
            anchors
                .map(a => a.href)
                .filter(href => {
                    try {
                        const url = new URL(href);
                        return url.origin.includes(domain);
                    } catch {
                        return false;
                    }
                })
        , domain);

        for (const link of links) {
            await crawl(link);
        }
    } catch (error) {
        console.error(`Error crawling ${url}:`, error);
    } finally {
        await browser.close();
    }
}

// 建立輸出資料夾
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// 開始爬蟲
crawl(startUrl).then(() => {
    console.log('Crawling completed.');
});
