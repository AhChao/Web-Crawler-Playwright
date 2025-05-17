/**
 * Configuration-related functions for the web crawler interface
 */

/**
 * Load configuration from the server and populate form fields
 */
async function loadConfiguration() {
    updateStatus(translations[currentLang]['loadingConfig']);
    try {
        // Add cache-busting parameter to force a fresh request
        const response = await fetch('/api/get-config?t=' + new Date().getTime());
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
        
        // Detect pattern type (regex or contains)
        const isComplexPattern = 
            urlPatternStr !== '.*' && 
            (urlPatternStr.includes('^') || urlPatternStr.includes('$') || 
             urlPatternStr.includes('(') || urlPatternStr.includes('[') ||
             urlPatternStr.includes('\\'));
        
        // Set appropriate radio button
        document.querySelector(`input[name="patternType"][value="${isComplexPattern ? 'regex' : 'contains'}"]`).checked = true;
        
        // Set output directory
        let outputDir = config.outputDir || '';
        // Clean up path for display (show only the directory name, not the full path)
        // Handle both Windows and Unix-style paths
        const lastSegmentMatch = outputDir.match(/[\/\\]([^\/\\]+)$/);
        if (lastSegmentMatch) {
            outputDir = lastSegmentMatch[1];
        }
        document.getElementById('outputDir').value = outputDir;

        // Set file format
        const fileFormat = config.fileFormat || 'markdown';
        document.querySelector(`input[name="fileFormat"][value="${fileFormat}"]`).checked = true;
        
        // Show timestamp to verify refresh
        if (config.timestamp) {
            console.log('Configuration loaded with timestamp:', config.timestamp);
        }
        
        updateStatus(translations[currentLang]['configLoaded']);
    } catch (error) {
        console.error('Error loading configuration:', error);
        // Don't update the status here, as it might be confusing for the user
    }
}

/**
 * Refresh configuration from the server
 * This can be called to manually refresh the configuration
 */
async function refreshConfiguration() {
    updateStatus(translations[currentLang]['loadingConfig']);
    
    try {
        // Add cache-busting parameter to force a fresh request
        const response = await fetch('/api/get-config?t=' + new Date().getTime());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const config = await response.json();
        
        // Update all form elements with latest config
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
        
        // Detect pattern type (regex or contains)
        const isComplexPattern = 
            urlPatternStr !== '.*' && 
            (urlPatternStr.includes('^') || urlPatternStr.includes('$') || 
             urlPatternStr.includes('(') || urlPatternStr.includes('[') ||
             urlPatternStr.includes('\\'));
        
        // Set appropriate radio button
        document.querySelector(`input[name="patternType"][value="${isComplexPattern ? 'regex' : 'contains'}"]`).checked = true;
        
        // Set output directory
        let outputDir = config.outputDir || '';
        // Clean up path for display (show only the directory name, not the full path)
        // Handle both Windows and Unix-style paths
        const lastSegmentMatch = outputDir.match(/[\/\\]([^\/\\]+)$/);
        if (lastSegmentMatch) {
            outputDir = lastSegmentMatch[1];
        }
        document.getElementById('outputDir').value = outputDir;
        
        // Show timestamp to verify refresh
        if (config.timestamp) {
            console.log('Configuration refreshed with timestamp:', config.timestamp);
        }
        
        updateStatus(translations[currentLang]['configRefreshed']);
    } catch (error) {
        console.error('Error refreshing configuration:', error);
        updateStatus(translations[currentLang]['configRefreshError'] + ': ' + error.message);
    }
}

/**
 * Choose an output directory using the file system access API
 */
async function chooseOutputFolder() {
    try {
        const dirHandle = await window.showDirectoryPicker({
            title: translations[currentLang]['pickerTitle']
        });
        const outputDir = dirHandle.name;
        document.getElementById('outputDir').value = outputDir;
        updateStatus(translations[currentLang]['folderSelected'] + outputDir);
        
        // Store the directory handle for later use
        window.dirHandle = dirHandle;
    } catch (e) {
        console.error('Error selecting directory:', e);
    }
}

// Export functions for use in other modules
window.loadConfiguration = loadConfiguration;
window.refreshConfiguration = refreshConfiguration;
window.chooseOutputFolder = chooseOutputFolder;

// Load configuration when the page loads AND refreshes
window.addEventListener('load', loadConfiguration);
// Also trigger configuration load when the document is fully loaded
document.addEventListener('DOMContentLoaded', loadConfiguration);
// Add reload listener for when the page is refreshed
window.addEventListener('pageshow', function(event) {
    // pageshow event fires on both initial load and when navigating back to the page
    // If the page is loaded from cache (navigating back), event.persisted will be true
    if (event.persisted) {
        loadConfiguration();
    }
});
