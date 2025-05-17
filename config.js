const path = require('path');

module.exports = {
    domain: 'https://docs.oracle.com/', // 設定入口網站的 domain
    startUrl: 'https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4267255811.html', // 設定入口網站的 URL
    outputDir: path.join(__dirname, 'output'), // 設定儲存檔案的路徑
    urlPattern: /netsuite\/ns-online-help/ // 限定網址必須含有指定字串的正則表達式
};
