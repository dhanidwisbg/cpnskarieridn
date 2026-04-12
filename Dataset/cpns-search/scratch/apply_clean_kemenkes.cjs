const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Filter Kemenkes entries
const kemenkes = data.filter(d => d.instansi === 'Kementerian Kesehatan');

function cleanKemenkesMajor(jurusan) {
    let clean = jurusan;
    
    // Remove numbers and everything after it
    const numberMatch = clean.match(/\s+\d+\s+\d+\s+\d+\s+\d+/);
    if (numberMatch) {
        clean = clean.substring(0, numberMatch.index);
    } else {
        const firstDigit = clean.match(/\s+\d+\b/);
        if (firstDigit) {
            clean = clean.substring(0, firstDigit.index);
        }
    }
    
    // Normalize degree titles before searching
    clean = clean.replace(/D-ill/i, 'D-III')
                 .replace(/D-ll/i, 'D-II')
                 .replace(/D-l\b/i, 'D-I');
                 
    clean = clean.replace(/\bDa Kebidanan\b/i, 'D-III Kebidanan'); // OCR error for D-III
    clean = clean.replace(/\bDi Kebidanan\b/i, 'D-III Kebidanan');

    // Remove job title prefix by finding the actual education degree starts
    // E.g. "Apoteker Ahli Profesi Apoteker" -> "Profesi Apoteker"
    // "Bidan Terampil D-III Kebidanan" -> "D-III Kebidanan"
    const EDU_PREFIX_RE = /(S[-–]?\s*[123]|D[-–]?\s*(?:IV|III|II|I)|PROFESI)\b/i;
    const eduMatch = clean.match(EDU_PREFIX_RE);
    if (eduMatch) {
       clean = clean.substring(eduMatch.index);
    }

    // Edge Cases fixes
    clean = clean.replace(/Ahi/g, ''); // lingering typos
    clean = clean.replace(/Butuh Bantuan\?.*$/i, '');
    clean = clean.replace(/Kesehatan Kesehatan/i, 'Kesehatan'); 

    // Final trim and Title Case
    clean = clean.trim();
    
    // Title Case (already done in App mostly, but let's make sure)
    const toTitle = (str) => str.toLowerCase().replace(/(?:^|\s)\S/g, c => c.toUpperCase())
        .replace(/\bD-Iv\b/g, 'D-IV').replace(/\bD-Iii\b/g, 'D-III')
        .replace(/\bD-Ii\b/g, 'D-II').replace(/\bD-I\b/g, 'D-I')
        .replace(/\bS-([123])\b/g, (_, n) => `S-${n}`);
        
    return toTitle(clean);
}

// Update the entire dataset
let changedCount = 0;
data.forEach(item => {
    if (item.instansi === 'Kementerian Kesehatan') {
        const cleaned = cleanKemenkesMajor(item.jurusan);
        if (cleaned !== item.jurusan) {
            item.jurusan = cleaned;
            changedCount++;
        }
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Updated ${changedCount} Kemenkes entries in data.json.`);
