/**
 * UI-related functions for the web crawler interface
 */

// Current language
let currentLang = 'zh';

/**
 * Updates all UI text elements based on the current language
 */
function updateUIText() {
    document.getElementById('title').textContent = translations[currentLang]['title'];
    document.getElementById('startUrlLabel').textContent = translations[currentLang]['startUrlLabel'];
    document.getElementById('baseDomainLabel').textContent = translations[currentLang]['baseDomainLabel'];
    document.getElementById('urlPatternLabel').textContent = translations[currentLang]['urlPatternLabel'];
    document.getElementById('containsLabel').textContent = translations[currentLang]['containsLabel'];
    document.getElementById('regexLabel').textContent = translations[currentLang]['regexLabel'];
    document.getElementById('testUrlLabel').textContent = translations[currentLang]['testUrlLabel'];
    document.getElementById('testUrlBtn').textContent = translations[currentLang]['testUrlBtn'];
    document.getElementById('outputDirLabel').textContent = translations[currentLang]['outputDirLabel'];
    document.getElementById('chooseFolder').textContent = translations[currentLang]['chooseFolder'];
    document.getElementById('startCrawl').textContent = translations[currentLang]['startCrawl'];
    document.getElementById('refreshConfig').textContent = translations[currentLang]['refreshConfig'];
    document.getElementById('statusText').textContent = translations[currentLang]['statusText'];
    document.getElementById('visitedLinksTitle').textContent = translations[currentLang]['visitedLinksTitle'];
    document.getElementById('langToggle').textContent = translations[currentLang]['langToggle'];
}

/**
 * Toggles between Chinese and English language
 */
function toggleLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    updateUIText();
}

/**
 * Updates the status display area with a message
 * @param {string} message - The message to display in the status area
 */
function updateStatus(message) {
    const statusElem = document.getElementById('statusText');
    statusElem.textContent = message;
    // Auto-scroll to the bottom
    const statusContainer = document.getElementById('status');
    statusContainer.scrollTop = statusContainer.scrollHeight;
}

/**
 * Tests if a URL matches the current pattern
 */
function testUrlPattern() {
    const testUrl = document.getElementById('testUrl').value;
    const pattern = document.getElementById('urlPattern').value;
    const patternType = document.querySelector('input[name="patternType"]:checked').value;
    const testResultElem = document.getElementById('testResult');
    
    if (!testUrl) {
        testResultElem.textContent = '';
        return;
    }
    
    let isMatch = false;
    try {
        if (patternType === 'contains') {
            // Simple string contains test
            isMatch = testUrl.includes(pattern);
        } else {
            // Regex pattern test
            const regex = new RegExp(pattern);
            isMatch = regex.test(testUrl);
        }
        
        testResultElem.textContent = isMatch 
            ? translations[currentLang]['testMatch'] 
            : translations[currentLang]['testNoMatch'];
        
        testResultElem.className = isMatch ? 'test-result test-success' : 'test-result test-fail';
    } catch (e) {
        testResultElem.textContent = `Error: ${e.message}`;
        testResultElem.className = 'test-result test-fail';
    }
}

/**
 * Initialize event listeners when the page loads
 */
function initializeEventListeners() {
    // Auto-detect domain from start URL
    document.getElementById('startUrl').addEventListener('input', function() {
        try {
            const url = new URL(this.value);
            document.getElementById('baseDomain').value = url.hostname;
            updateStatus(translations[currentLang]['autoDetectedDomain'] + url.hostname);
        } catch (e) {
            // Invalid URL, clear domain
            document.getElementById('baseDomain').value = '';
        }
    });

    // Auto-test when pattern changes or test URL changes
    document.getElementById('urlPattern').addEventListener('input', function() {
        if (document.getElementById('testUrl').value) {
            testUrlPattern();
        }
    });
    
    document.getElementById('testUrl').addEventListener('input', function() {
        testUrlPattern();
    });
    
    document.querySelectorAll('input[name="patternType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (document.getElementById('testUrl').value) {
                testUrlPattern();
            }
        });
    });

    // Initialize the UI with the current language
    updateUIText();
}

// Export functions for use in other modules
window.updateUIText = updateUIText;
window.toggleLanguage = toggleLanguage;
window.updateStatus = updateStatus;
window.testUrlPattern = testUrlPattern;
window.currentLang = currentLang;

// Initialize UI when the page loads
window.addEventListener('DOMContentLoaded', initializeEventListeners);
