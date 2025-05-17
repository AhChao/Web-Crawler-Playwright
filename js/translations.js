/**
 * Translation resources for the web crawler interface
 */
const translations = {
    'zh': {
        'title': 'Web 爬蟲控制面板',
        'startUrlLabel': '起始網址：',
        'baseDomainLabel': '網域：',
        'urlPatternLabel': '限定規則 (正則表達式)：',
        'outputDirLabel': '輸出資料夾：',
        'chooseFolder': '選擇資料夾',
        'startCrawl': '開始爬蟲',
        'statusText': '準備就緒，請設定參數並開始爬蟲。',
        'visitedLinksTitle': '已爬取網址列表',
        'langToggle': 'English',
        'pickerTitle': '選擇輸出資料夾',
        'folderSelected': '已選擇資料夾: ',
        'autoDetectedDomain': '自動檢測到域名: ',
        'emptyStartUrl': '請輸入起始網址',
        'emptyOutputDir': '請選擇輸出資料夾',
        'crawlingStarted': '開始爬蟲... 請等待完成',
        'crawlingCompleted': '爬蟲完成！',
        'crawlingError': '爬蟲過程中發生錯誤：',
        'visitedCount': '已爬取連結數量：',
        'loadingConfig': '正在載入設定...',
        'configLoaded': '已從設定檔載入配置'
    },
    'en': {
        'title': 'Web Crawler Control Panel',
        'startUrlLabel': 'Start URL:',
        'baseDomainLabel': 'Domain:',
        'urlPatternLabel': 'URL Pattern (RegEx):',
        'outputDirLabel': 'Output Directory:',
        'chooseFolder': 'Choose Folder',
        'startCrawl': 'Start Crawling',
        'statusText': 'Ready. Please set parameters and start crawling.',
        'visitedLinksTitle': 'Visited Links',
        'langToggle': '中文',
        'pickerTitle': 'Choose Output Directory',
        'folderSelected': 'Folder selected: ',
        'autoDetectedDomain': 'Auto-detected domain: ',
        'emptyStartUrl': 'Please enter a start URL',
        'emptyOutputDir': 'Please select an output directory',
        'crawlingStarted': 'Crawling started... Please wait for completion',
        'crawlingCompleted': 'Crawling completed!',
        'crawlingError': 'Error during crawling: ',
        'visitedCount': 'Number of visited links: ',
        'loadingConfig': 'Loading configuration...',
        'configLoaded': 'Configuration loaded from settings file'
    }
};

// Export translations for use in other modules
window.translations = translations;
