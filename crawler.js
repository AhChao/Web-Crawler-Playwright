const { chromium } = require('playwright');
const fs = require('fs');
const { startUrl, outputDir, urlPattern } = require('./config'); 
const visitedUrls = new Set(); 

function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

// Function to save all visited links to a file
function saveVisitedLinks(links) {
    const filePath = `${outputDir}/visitedLinks`;
    const content = Array.from(links).join('\n');
    fs.writeFileSync(filePath, content, 'utf8');
    log(`Saved ${links.size} visited links to ${filePath}`);
}

async function crawl(url, baseDomain, urlsSet = visitedUrls) {
    if (urlsSet.has(url)) {
        log(`Skipping: ${url} (already visited or not in domain)`);
        return;
    }

    urlsSet.add(url);
    log(`Crawling: ${url}`);

    let browser;
    let links = [];
    try {
        browser = await chromium.launch();
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // 抓取網頁內容 / fetch title and content
        const title = await page.title();
        const rawContent = await page.content();
        const timestamp = new Date().toISOString();

        // 儲存為 Markdown 檔案 / save as Markdown file
        const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
        const filePath = `${outputDir}/${fileName}`;
        const markdownContent = `# ${title}\n\n- URL: ${url}\n- Timestamp: ${timestamp}\n\n${rawContent}`;
        fs.writeFileSync(filePath, markdownContent, 'utf8');

        // 抓取內部連結 / fetch links on the page
        links = await page.$$eval('a', (anchors, baseDomain) => {
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
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error crawling ${url}:`, error);
    } finally {
        if (browser) {
            await browser.close(); // 確保瀏覽器及時關閉 / close playwright instace before a new crawl
        }

        // 遞回訪問內部連結
        for (const link of links) {
            if (!link.includes(baseDomain)) continue; // link not in base domain
            if (!urlPattern.test(link)) continue; // link does not match urlPattern
            await crawl(link, baseDomain, urlsSet);
        }
    }
}

// 建立輸出資料夾
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// 從 startUrl 提取基礎域名
const baseDomain = new URL(startUrl).hostname;

// 開始爬蟲
if (require.main === module) {
    crawl(startUrl, baseDomain).then(() => {
        log('Crawling completed.');
        // Save all visited links to a file
        saveVisitedLinks(visitedUrls);
    });
}

// 將 crawl 函數導出
module.exports = { crawl };
