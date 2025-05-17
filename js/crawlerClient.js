/**
 * Crawler-related functions for the web crawler interface
 */

/**
 * Start the crawling process
 */
async function startCrawling() {
    const startUrl = document.getElementById('startUrl').value;
    const baseDomain = document.getElementById('baseDomain').value;
    const urlPattern = document.getElementById('urlPattern').value;
    const patternType = document.querySelector('input[name="patternType"]:checked').value;
    const outputDir = document.getElementById('outputDir').value;
    const fileFormat = document.querySelector('input[name="fileFormat"]:checked').value;
    
    // Validate inputs
    if (!startUrl) {
        updateStatus(translations[currentLang]['emptyStartUrl']);
        return;
    }
    
    if (!outputDir) {
        updateStatus(translations[currentLang]['emptyOutputDir']);
        return;
    }
    
    // Prepare config data
    const configData = {
        startUrl,
        baseDomain,
        urlPattern,
        patternType,
        outputDir,
        fileFormat
    };
    
    updateStatus(translations[currentLang]['crawlingStarted']);
    
    try {
        // Send request to backend API
        const response = await fetch('/api/start-crawl', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(configData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        updateStatus(translations[currentLang]['crawlingCompleted']);
        
        // Update visited links display
        if (result.visitedLinks && Array.isArray(result.visitedLinks)) {
            const visitedLinksContainer = document.getElementById('visitedLinks');
            visitedLinksContainer.innerHTML = '';
            
            const countMsg = document.createElement('p');
            countMsg.textContent = translations[currentLang]['visitedCount'] + result.visitedLinks.length;
            visitedLinksContainer.appendChild(countMsg);
            
            result.visitedLinks.forEach(link => {
                const linkElem = document.createElement('div');
                linkElem.textContent = link;
                visitedLinksContainer.appendChild(linkElem);
            });
        }
        
    } catch (error) {
        updateStatus(translations[currentLang]['crawlingError'] + error.message);
        console.error('Error starting crawl:', error);
    }
}

// Export functions for use in other modules
window.startCrawling = startCrawling;
