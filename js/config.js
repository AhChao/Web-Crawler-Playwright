/**
 * Configuration-related functions for the web crawler interface
 */

/**
 * Load configuration from the server and populate form fields
 */
async function loadConfiguration() {
    updateStatus(translations[currentLang]['loadingConfig']);
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
        // Clean up path for display (show only the directory name, not the full path)
        if (outputDir.includes('/')) {
            outputDir = outputDir.split('/').pop();
        }
        document.getElementById('outputDir').value = outputDir;
        
        updateStatus(translations[currentLang]['configLoaded']);
    } catch (error) {
        console.error('Error loading configuration:', error);
        // Don't update the status here, as it might be confusing for the user
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
window.chooseOutputFolder = chooseOutputFolder;

// Load configuration when the page loads
window.addEventListener('load', loadConfiguration);
