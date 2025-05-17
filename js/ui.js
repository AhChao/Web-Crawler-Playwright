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
    document.getElementById('outputDirLabel').textContent = translations[currentLang]['outputDirLabel'];
    document.getElementById('chooseFolder').textContent = translations[currentLang]['chooseFolder'];
    document.getElementById('startCrawl').textContent = translations[currentLang]['startCrawl'];
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

    // Initialize the UI with the current language
    updateUIText();
}

// Export functions for use in other modules
window.updateUIText = updateUIText;
window.toggleLanguage = toggleLanguage;
window.updateStatus = updateStatus;
window.currentLang = currentLang;

// Initialize UI when the page loads
window.addEventListener('DOMContentLoaded', initializeEventListeners);
