# Web Crawler with Playwright

A web crawler using Playwright to scrape and save website content as Markdown files, with a user-friendly UI.

## Features

- User-friendly web interface with language support (Chinese/English)
- Set custom start URL, URL pattern, and output directory
- Real-time status updates
- View list of visited URLs
- Results saved as Markdown files

## Installation

1. Clone this repository
2. Install dependencies:
```
npm install
```

## Usage

1. Start the server:
```
npm run server
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Configure your crawling parameters:
   - Start URL: The URL where crawling will begin
   - Domain: Automatically detected from the start URL
   - URL Pattern: Optional regex pattern to filter URLs
   - Output Directory: Select where to save crawled content

4. Click "Start Crawling" to begin the process

## Implementation Details

- Front-end: 
  - HTML for structure
  - CSS for styling (in separate files)
  - JavaScript for functionality (modular organization)
- Back-end: Node.js, Express
- Web Crawling: Playwright
- Output: Markdown files and a list of all visited URLs

## License

MIT
