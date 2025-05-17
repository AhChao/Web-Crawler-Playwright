# Web 爬蟲與 Playwright

使用 Playwright 進行網頁爬取並將內容保存為 Markdown 文件的爬蟲工具，附帶用戶友好的操作界面。

## 功能特點

- 支持中英文切換的用戶友好界面
- 可設定自定義起始 URL、URL 匹配規則和輸出目錄
- 實時狀態更新
- 查看已爬取 URL 列表
- 結果保存為 Markdown 文件

## 安裝說明

1. 克隆本倉庫
2. 安裝依賴套件：
```
npm install
```

## 使用方法

1. 啟動服務器：
```
npm run server
```

2. 打開瀏覽器並訪問：
```
http://localhost:3000
```

3. 配置爬蟲參數：
   - 起始 URL：爬蟲將從此 URL 開始
   - 網域：自動從起始 URL 檢測
   - URL 匹配規則：可選的正則表達式，用於過濾 URL
   - 輸出目錄：選擇保存爬蟲內容的位置

4. 點擊「開始爬蟲」啟動流程

## 實現細節

- 前端：
  - HTML 結構
  - CSS 樣式（獨立文件）
  - JavaScript 功能（模組化組織）
- 後端：Node.js, Express
- 網頁爬蟲：Playwright
- 輸出：Markdown 文件和所有已訪問 URL 的列表

## 授權

MIT
