const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { crawl } = require('./crawler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..'))); // Serve static files from parent directory

// API endpoint to get the current configuration
app.get('/api/get-config', (req, res) => {
    try {
        // Clear the require cache to ensure we get the latest config
        delete require.cache[require.resolve('./config')];
        
        // Read current config.js file
        let config = require('./config');
        
        // Convert RegExp to string for proper JSON response
        if (config.urlPattern instanceof RegExp) {
            config = {
                ...config,
                urlPattern: config.urlPattern.toString()
            };
        }
        
        // Add a timestamp to verify freshness
        config.timestamp = new Date().toISOString();
        
        res.json(config);
    } catch (error) {
        console.error('Error reading configuration:', error);
        res.status(500).json({
            success: false,
            message: `Error reading configuration: ${error.message}`
        });
    }
});

// Add a route for choosing output directory
app.post('/api/select-dir', (req, res) => {
    try {
        const { dirName } = req.body;
        
        // Check if the dirName is an absolute path
        let outputPath;
        if (path.isAbsolute(dirName)) {
            // Use the absolute path directly
            outputPath = dirName;
        } else {
            // For simple directory names, create under the project root
            // (not inside 'output' subfolder)
            outputPath = path.join(path.dirname(__dirname), dirName);
        }
        
        // Create the directory if it doesn't exist
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }
        
        res.json({ 
            success: true,
            outputPath: outputPath,
            // Use the actual folder name without forcing an 'output' prefix
            relativePath: dirName
        });
    } catch (error) {
        console.error('Error creating directory:', error);
        res.status(500).json({
            success: false,
            message: `Error creating directory: ${error.message}`
        });
    }
});

// API endpoint to start the crawling process
app.post('/api/start-crawl', async (req, res) => {
    try {
        const { startUrl, baseDomain, urlPattern, patternType, outputDir, fileFormat } = req.body;
        
        // Convert the urlPattern string to the appropriate regex format
        let urlPatternForRegex = urlPattern;
        if (patternType === 'contains') {
            // If it's a "contains" pattern, escape any regex special characters
            urlPatternForRegex = urlPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex chars
        }
        
        // Determine the correct output directory path
        let fullOutputPath;
        if (path.isAbsolute(outputDir)) {
            // If an absolute path was provided, use it directly
            fullOutputPath = outputDir;
        } else {
            // Otherwise, make it relative to the project root instead of the server directory
            fullOutputPath = path.join(path.dirname(__dirname), outputDir);
        }
        
        // Update config.js with the new settings
        const configContent = `module.exports = {
    startUrl: '${startUrl}',
    outputDir: '${fullOutputPath}',
    urlPattern: new RegExp('${urlPatternForRegex}'),
    fileFormat: '${fileFormat || 'markdown'}'
};
`;
        fs.writeFileSync(path.join(__dirname, 'config.js'), configContent);
        
        // Create visited URLs set for tracking
        const visitedUrls = new Set();
        
        // Clear require.cache to ensure fresh config is loaded
        delete require.cache[require.resolve('./config')];
        
        // Start crawling
        await crawl(startUrl, baseDomain, visitedUrls);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(fullOutputPath)) {
            fs.mkdirSync(fullOutputPath, { recursive: true });
        }
        
        // Save visited links to file
        const visitedLinksPath = path.join(fullOutputPath, 'visitedLinks');
        const visitedLinksArray = Array.from(visitedUrls);
        fs.writeFileSync(visitedLinksPath, visitedLinksArray.join('\n'), 'utf8');
        
        res.json({
            success: true,
            message: 'Crawling completed successfully',
            visitedLinks: visitedLinksArray
        });
    } catch (error) {
        console.error('Error during crawling:', error);
        res.status(500).json({
            success: false,
            message: `Error during crawling: ${error.message}`
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
