# 網頁爬蟲規格書

## 1. 專案目標
設計並實作一個網頁爬蟲，能夠從指定的入口網站開始，抓取該網站內部的所有連結及其內容，並將抓取的內容儲存為本地 Markdown 檔案，供未來作為輸入的參考資料。

---

## 2. 功能需求

### 2.1 入口網站設定
- 提供一個變數用於設定入口網站的 `domain` 和 `URL`。
- 爬蟲僅限於抓取該 `domain` 下的連結，不會存取其他 `domain` 的連結。

### 2.2 網頁內容抓取
- 從指定的入口網站開始，遞迴抓取該網站內部的所有連結。
- 每個連結的內容需被存取並儲存。

### 2.3 資料儲存
- 提供一個變數用於設定儲存檔案的路徑。
- 抓取的內容需儲存為本地 Markdown (`.md`) 檔案。
- 每個檔案需包含以下資訊：
    - 網頁標題
    - 網頁 URL
    - 抓取的時間戳
    - 網頁主要內容
- **新增需求**：對輸出的 Markdown 檔案進行格式校正，確保內容結構清晰，具備以下格式：
    - 標題使用 `#` 表示。
    - 網頁 URL 和時間戳以列表形式呈現。
    - 網頁主要內容需移除多餘的 HTML 標籤，僅保留純文字內容。

---

## 3. 非功能需求
- 爬蟲需具備高效能，避免對目標網站造成過多負載。
- 爬蟲需遵守網站的 `robots.txt` 規範。
- 儲存的 Markdown 檔案需具備良好的可讀性，方便後續使用。

---

## 4. 技術規範
- 使用 [Playwright](https://playwright.dev/) 作為爬蟲框架。
- 支援多層次的遞迴抓取，確保完整性。
- 提供錯誤處理機制，避免因網頁不可用或其他問題導致爬蟲中斷。

---

## 5. 執行流程
1. 設定入口網站的 `domain` 和 `URL`。
2. 設定儲存檔案的路徑。
3. 爬蟲開始抓取入口網站的內容。
4. 遞迴抓取該網站內部的所有連結。
5. 將抓取的內容儲存為 Markdown 檔案到本地，並進行格式校正。
6. 結束爬蟲執行，輸出執行報告。

---

## 6. 未來擴展
- 支援多入口網站的設定。
- 增加內容過濾功能，例如只抓取特定類型的頁面。
- 提供爬取進度的可視化界面。

---

## 7. 注意事項
- 確保遵守目標網站的使用條款及法律規範。
- 避免對目標網站造成過多的請求壓力。

## 8. 程式碼範例

以下是一個使用 JavaScript 和 Playwright 實現的簡單網頁爬蟲範例：

```javascript
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const domain = 'example.com'; // 設定入口網站的 domain
const startUrl = 'https://example.com'; // 設定入口網站的 URL
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
        const content = await page.content();
        const timestamp = new Date().toISOString();

        // 儲存為 Markdown 檔案
        const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
        const filePath = path.join(outputDir, fileName);
        const markdownContent = `# ${title}\n\n- URL: ${url}\n- Timestamp: ${timestamp}\n\n${content}`;
        fs.writeFileSync(filePath, markdownContent, 'utf8');

        // 抓取內部連結
        const links = await page.$$eval('a', anchors =>
            anchors.map(a => a.href).filter(href => href.startsWith('http'))
        );

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
```

### 注意事項
- 請確保已安裝 [Playwright](https://playwright.dev/) 並執行 `npm install playwright`。
- 請根據需求修改 `domain`、`startUrl` 和 `outputDir` 的值。
- 確保有權限存取並寫入 `output` 資料夾。
- 該範例僅供學習用途，請遵守目標網站的 `robots.txt` 和相關法律規範。

---

## 9. 環境設置與所需函式庫

### 9.1 環境設置
1. 確保已安裝 [Node.js](https://nodejs.org/)（建議使用 LTS 版本）。
2. 初始化專案：
    ```bash
    npm init -y
    ```
3. 安裝所需函式庫：
    ```bash
    npm install playwright
    ```

### 9.2 所需函式庫
- `playwright`: 用於瀏覽器自動化。
- `fs`（內建模組）: 用於檔案系統操作。
- `path`（內建模組）: 用於處理檔案路徑。