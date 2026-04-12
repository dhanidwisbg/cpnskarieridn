const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const kemenkes = data.filter(d => d.instansi === 'Kementerian Kesehatan');

function cleanKemenkesMajor(jurusan) {
    let clean = jurusan;
    
    // 1. Remove anything from the first sequence of numbers onwards.
    // e.g. " 1 0 0 1 ", " 13 2 0 15 "
    const numberMatch = clean.match(/\s+\d+\s+\d+\s+\d+\s+\d+/);
    if (numberMatch) {
        clean = clean.substring(0, numberMatch.index);
    } else {
        // sometimes the OCR missed spaces, or it's "11 2 0 13", wait II (eleven as Il)
        // Let's just find the first standalone digit that has a space before it
        const firstDigit = clean.match(/\s+\d+\b/);
        if (firstDigit) {
            clean = clean.substring(0, firstDigit.index);
        }
    }
    
    // 2. Remove known prefixes (Jabatan) like "Apoteker Ahi ", "Bidan ", "Administrator Kesehatan Ahli Pertama "
    // Actually, maybe we should just find the first Education Degree!
    const EDU_PREFIX_RE = /(S[-–]?\s*[123]|D[-–]?\s*(?:IV|III|II|I|Il|[1-4])|PROFESI|NERS|APOTEKER|BIDAN|DOKTER)\b/i;
    const eduMatch = clean.match(EDU_PREFIX_RE);
    if (eduMatch) {
       clean = clean.substring(eduMatch.index);
    }
    
    // 3. Remove Butuh Bantuan?
    clean = clean.replace(/Butuh Bantuan\?.*$/i, '');
    
    // 4. Normalize degree names (like "D-ill", "D-ll", "Da") -> D-III, D-II, D-I
    clean = clean.replace(/D-ill/i, 'D-III')
                 .replace(/D-ll/i, 'D-II')
                 .replace(/\bDa\b/i, 'D-I'); // sometimes 'D-I' OCRs as 'Da' if followed by something? Or maybe "Bidan Da" is OCR error for "Bidan Ahli"?
                 
    if (clean.startsWith('Da Kebidanan')) {
        clean = clean.replace('Da Kebidanan', 'D-III Kebidanan'); // just a guess, or D-IV
    }

    return clean.trim();
}

const samples = [
  'Apoteker Ahi Profesi Apoteker 1 0 0 1 Butuh Bantuan? 1',
  'Apoteker Ahi Profesi Apoteker 13 2 0 15 Rumah Sakit Jayapura',
  'Bidan D-ill Kebidanan 1 0 0 1 Butuh Bantuan? M Pusat',
  'Bidan D-ill Kebidanan 2 0 0 2 Rumah Sakit Makassar',
  'Bidan Da Kebidanan 1 0 0 1 Rumah Sakit Anak Dan Bunda',
  'D-II Akademik 1 0 0 1 Loka Laboratorium Kesehatan',
  'D-II Kimia'
];

console.log("--- SAMPLES ---");
for (const s of samples) {
    console.log(`Original: ${s}`);
    console.log(`Cleaned:  ${cleanKemenkesMajor(s)}\n`);
}

