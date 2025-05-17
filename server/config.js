const path = require('path');

module.exports = {
    startUrl: 'https://google.github.io/eng-practices/review/developer/small-cls.html',
    outputDir: path.join(__dirname, '..', 'output'),
    urlPattern: new RegExp('eng-practices\/review\/developer\/small-cls.html')
};
