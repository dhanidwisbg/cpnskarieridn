const fs = require('fs');
const PDFParse = require('pdf-parse');

async function check() {
    const dataBuffer = fs.readFileSync('cpns.pdf');
    try {
        const data = await PDFParse(dataBuffer);
        console.log("Pages:", data.numpages);
        console.log("Text snippet (first 500 chars):");
        console.log(data.text.substring(0, 500));
        
        const urls = data.text.match(/https?:\/\/[^\s]+/gi);
        console.log("Found URLs count:", urls ? urls.length : 0);
        if (urls) {
            console.log("First 5 URLs:");
            console.log(urls.slice(0, 5));
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}

check();
