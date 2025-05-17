const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { crawl } = require('./crawler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files from current directory

// API endpoint to start the crawling process
app.post('/api/start-crawl', async (req, res) => {
    try {
        const { startUrl, baseDomain, urlPattern, outputDir } = req.body;
        
        // Update config.js with the new settings
        const configContent = `module.exports = {
    startUrl: '${startUrl}',
    outputDir: '${path.join(__dirname, outputDir)}',
    urlPattern: new RegExp('${urlPattern}')
};
`;
        fs.writeFileSync(path.join(__dirname, 'config.js'), configContent);
        
        // Create visited URLs set for tracking
        const visitedUrls = new Set();
        
        // Start crawling
        await crawl(startUrl, baseDomain, visitedUrls);
        
        // Create directory if it doesn't exist
        const outputPath = path.join(__dirname, outputDir);
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }
        
        // Save visited links to file
        const visitedLinksPath = path.join(outputPath, 'visitedLinks');
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
