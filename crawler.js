const { chromium } = require('playwright');
const fs = require('fs');
const { startUrl, outputDir } = require('./config'); // 移除 domain
const visitedUrls = new Set(); // 已訪問的 URL 集合

// 格式化日志输出
function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

async function crawl(url, baseDomain) {
    if (visitedUrls.has(url) || !url.includes(baseDomain)) {
        return;
    }

    visitedUrls.add(url);
    log(`Crawling: ${url}`);

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
        const links = await page.$$eval('a', (anchors, baseDomain) => {
            return anchors
                .map(a => a.href)
                .filter(href => {
                    try {
                        const url = new URL(href);
                        // Ensure the link's hostname matches the base domain
                        return url.hostname === baseDomain;
                    } catch {
                        // Ignore invalid URLs
                        return false;
                    }
                });
        }, baseDomain);
        log(`Found ${links.length} links on ${url}`);

        for (const link of links) {
            await crawl(link, baseDomain);
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error crawling ${url}:`, error);
    } finally {
        await browser.close();
    }
}

// 建立輸出資料夾
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// 從 startUrl 提取基礎域名
const baseDomain = new URL(startUrl).hostname;

// 開始爬蟲
crawl(startUrl, baseDomain).then(() => {
    console.log('Crawling completed.');
});
