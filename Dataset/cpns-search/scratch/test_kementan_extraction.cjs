const fs = require('fs');
const path = require('path');

const ocrPath = path.join(__dirname, 'kementan_ocr.txt');
const text = fs.readFileSync(ocrPath, 'utf8')
    .replace(/\n|§/g, ' ')
    .replace(/ - /g, ' - ')
    .replace(/\s+/g, ' ');

// Look for degree patterns, separated by " - ", capturing the major names
// e.g. "S-1 ILMU HUKUM", "D-IV MANAJEMEN AGRIBISNIS"
const regex = /(S-?[123]|D-?(?:IV|III|II|I|1|2|3|4))\s+([A-Z\s]+?)(?=\s+-\s+(?:S-?[123]|D-?(?:IV|III|II|I|1|2|3|4))|BIRO|DIREKTORAT|PUSAT|BADAN|SEKRETARIAT|BALAI|DINAS|KEMENTERIAN|$)/gi;

const results = new Set();
let match;
while ((match = regex.exec(text)) !== null) {
    let degree = match[1].replace(/s-1/i, 'S-1')
        .replace(/d-iv/i, 'D-IV')
        .replace(/d-iii/i, 'D-III')
        .replace(/d-ii/i, 'D-II')
        .replace(/d-i/i, 'D-I');
        
    let major = match[2].trim();
    if (major.length > 5 && major.length < 100) {
        results.add(`${degree} ${major}`.toUpperCase());
    }
}

const arr = Array.from(results).sort();
console.log(`Found ${arr.length} unique majors for Kementan.`);
console.log(arr.slice(0, 30));
