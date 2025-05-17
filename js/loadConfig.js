// Function to load configuration from server
async function loadConfiguration() {
    const statusElem = document.getElementById('statusText');
    const currentLang = document.documentElement.lang === 'zh-TW' ? 'zh' : 'en';
    const translations = {
        'zh': {
            'loadingConfig': '正在載入設定...',
            'configLoaded': '已從設定檔載入配置'
        },
        'en': {
            'loadingConfig': 'Loading configuration...',
            'configLoaded': 'Configuration loaded from settings file'
        }
    };

    // Update status
    statusElem.textContent = translations[currentLang]['loadingConfig'];
    
    try {
        const response = await fetch('/api/get-config');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const config = await response.json();
        
        // Set values in form
        document.getElementById('startUrl').value = config.startUrl || '';
        
        // Auto-detect domain from start URL
        try {
            const url = new URL(config.startUrl);
            document.getElementById('baseDomain').value = url.hostname;
        } catch (e) {
            document.getElementById('baseDomain').value = '';
        }
        
        // Set URL pattern without the RegExp wrapper
        let urlPatternStr = config.urlPattern || '.*';
        // Extract the pattern if it's in RegExp format like /pattern/
        if (typeof urlPatternStr === 'string' && urlPatternStr.startsWith('/') && urlPatternStr.lastIndexOf('/') > 0) {
            urlPatternStr = urlPatternStr.substring(1, urlPatternStr.lastIndexOf('/'));
        }
        document.getElementById('urlPattern').value = urlPatternStr;
        
        // Set output directory
        let outputDir = config.outputDir || '';
        // Clean up path for display
        if (outputDir.includes('/')) {
            outputDir = outputDir.split('/').pop();
        }
        document.getElementById('outputDir').value = outputDir;
        
        statusElem.textContent = translations[currentLang]['configLoaded'];
    } catch (error) {
        console.error('Error loading configuration:', error);
        // Don't update the status here, as it might be confusing for the user
    }
}

// Load configuration when page loads
window.addEventListener('load', loadConfiguration);
