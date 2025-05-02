const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const domain = 'https://docs.oracle.com/e'; // 設定入口網站的 domain
const startUrl = 'https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4267255811.html'; // 設定入口網站的 URL
const outputDir = path.join(__dirname, 'output'); // 設定儲存檔案的路徑
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
        // const content = rawContent.replace(/<[^>]*>/g, '').trim(); // 移除 HTML 標籤，保留純文字
        const content = rawContent;
        const timestamp = new Date().toISOString();

        // 儲存為 Markdown 檔案
        const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
        const filePath = path.join(outputDir, fileName);
        const markdownContent = `# ${title}\n\n- URL: ${url}\n- Timestamp: ${timestamp}\n\n${content}`;
        fs.writeFileSync(filePath, markdownContent, 'utf8');

        // get all a dom element and recursive crawl
        const links = await page.$$eval('a', anchors => anchors.map(a => a.href));
        console.log(`Found ${links.length} links on ${url}`);
        console.log(links);
        // const links = await page.$$eval('a', (anchors, domain) =>
        //     anchors
        //         .map(a => a.href) // 提取 href
        //         .filter(href => {
        //             try {
        //                 const url = new URL(href); // 驗證並解析 URL
        //                 return url.origin.includes(domain); // 確保 URL 屬於相同 domain
        //             } catch {
        //                 return false; // 排除無效的 URL
        //             }
        //         })
        // , domain);

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
