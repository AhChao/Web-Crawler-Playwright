const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const TurndownService = require('turndown');
// Import config file path but don't require it directly yet
const configPath = path.join(__dirname, 'config.js');
const visitedUrls = new Set(); 

// Function to get fresh config on each call
function getConfig() {
    // Clear require cache for config.js
    delete require.cache[require.resolve(configPath)];
    // Return fresh config
    return require(configPath);
}

function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

// Function to save all visited links to a file
function saveVisitedLinks(links) {
    const config = getConfig();
    const filePath = path.join(config.outputDir, 'visitedLinks');
    const content = Array.from(links).join('\n');
    fs.writeFileSync(filePath, content, 'utf8');
    log(`Saved ${links.size} visited links to ${filePath}`);
}

async function crawl(url, baseDomain, urlsSet = visitedUrls) {
    // Remove anchor part from URL for uniqueness check
    const urlWithoutAnchor = url.split('#')[0];
    
    if (urlsSet.has(urlWithoutAnchor)) {
        log(`Skipping: ${url} (already visited or not in domain)`);
        return;
    }

    urlsSet.add(urlWithoutAnchor);
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

        // Get fresh config
        const config = getConfig();

        // Determine file extension and content based on fileFormat
        const fileFormat = config.fileFormat || 'markdown'; // Default to markdown if not specified
        const isMarkdown = fileFormat === 'markdown';
        const fileExtension = isMarkdown ? '.md' : '.html';
        
        // Create file name based on title
        const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}${fileExtension}`;
        const filePath = path.join(config.outputDir, fileName);
        
        let contentToSave;
        if (isMarkdown) {
            // Convert HTML to Markdown using Turndown
            const turndownService = new TurndownService({
                headingStyle: 'atx',
                codeBlockStyle: 'fenced',
                emDelimiter: '*'
            });
            
            // Extract just the body content for better markdown conversion
            // Use page.$eval to extract only the relevant content instead of the full raw HTML
            const bodyContent = await page.$eval('body', body => body.innerHTML);
            
            // Convert the body content to Markdown
            const markdownBody = turndownService.turndown(bodyContent);
            
            // Add metadata at the top of the file
            contentToSave = `# ${title}\n\n- URL: ${url}\n- Timestamp: ${timestamp}\n\n${markdownBody}`;
        } else {
            // Save as HTML with some metadata
            contentToSave = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="crawler-url" content="${url}">
    <meta name="crawler-timestamp" content="${timestamp}">
    <title>${title}</title>
</head>
<body>
${rawContent}
</body>
</html>`;
        }
        
        fs.writeFileSync(filePath, contentToSave, 'utf8');
        log(`Saved ${fileFormat} file: ${filePath}`);

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

            if (!link.includes(baseDomain)){
                log(`Skipping link: ${link} (not in base domain)`);
                continue; // link not in base domain
            }
            
            // Get fresh config for each link check
            const config = getConfig();
            
            if (!config.urlPattern.test(link)){
                log(`Skipping link: ${link} (does not match urlPattern)`);
                continue; // link does not match urlPattern
            }
            await crawl(link, baseDomain, urlsSet);
        }
    }
}

// 建立輸出資料夾
const config = getConfig();
if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
}

// 從 startUrl 提取基礎域名
const baseDomain = new URL(config.startUrl).hostname;

// 開始爬蟲
if (require.main === module) {
    crawl(config.startUrl, baseDomain).then(() => {
        log('Crawling completed.');
        // Save all visited links to a file
        saveVisitedLinks(visitedUrls);
    });
}

// 將 crawl 函數導出
module.exports = { crawl };
