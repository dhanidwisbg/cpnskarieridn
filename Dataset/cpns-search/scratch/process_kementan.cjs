const fs = require('fs');
const path = require('path');

const INVALID_START_WORDS = ['BIRO', 'DIREKTORAT', 'PUSAT', 'BADAN', 'SEKRETARIAT', 'BALAI', 'INSPEKTORAT', 'TERAMPIL', 'AHLI', 'UMUM', 'KEMENTERIAN', 'LOKA', 'GUDANG', 'KELOMPOK', 'SISTEM', 'APBN', 'PERBANKAN', 'JENDERAL', 'POLITEKNIK'];

const EDU_PREFIX_RE = /^(S[-–]?\s*[123]|D[-–]?\s*(?:IV|III|II|I|1|2|3|4)|PROFESI)\s+/i;

function normalizeEdu(s) {
    return s.trim().toUpperCase()
        .replace(/S-?\s*1/, 'S-1')
        .replace(/S-?\s*2/, 'S-2')
        .replace(/S-?\s*3/, 'S-3')
        .replace(/D-?\s*(IV|4)/, 'D-IV')
        .replace(/D-?\s*(III|3)/, 'D-III')
        .replace(/D-?\s*(II|2)/, 'D-II')
        .replace(/D-?\s*(I|1)/, 'D-I');
}

const toTitle = (str) => str.toLowerCase().replace(/(?:^|\s)\S/g, c => c.toUpperCase())
    .replace(/\bD-Iv\b/g, 'D-IV').replace(/\bD-Iii\b/g, 'D-III')
    .replace(/\bD-Ii\b/g, 'D-II').replace(/\bD-I\b/g, 'D-I')
    .replace(/\bS-([123])\b/g, (_, n) => `S-${n}`);

function extractKementan() {
    const ocrPath = path.join(__dirname, 'kementan_ocr.txt');
    let text = fs.readFileSync(ocrPath, 'utf8')
                 .replace(/§/g, 'S')
                 .replace(/\n|—|_/g, ' ')
                 .replace(/\s+/g, ' ');

    const results = new Set();
    const parts = text.split(/\s+-\s+/); // split by dashes which separate majors

    parts.forEach(part => {
        let p = part.trim();
        // find a degree within the part
        const match = p.match(/(S-?[123]|D-?(?:IV|III|II|I|1|2|3|4)|PROFESI)\b/i);
        if (match) {
            let degreeText = normalizeEdu(match[0]);
            let majorText = p.substring(match.index + match[0].length).trim();
            
            // Cut off at the first stop word (like BIRO, DIREKTORAT)
            for (let stop of INVALID_START_WORDS) {
                const stopIdx = majorText.toUpperCase().indexOf(stop);
                if (stopIdx !== -1) {
                    majorText = majorText.substring(0, stopIdx).trim();
                }
            }
            // Cut off numbers
            const numMatch = majorText.match(/\d{2,}/);
            if (numMatch) {
               majorText = majorText.substring(0, numMatch.index).trim();
            }

            if (majorText.length > 3) {
                results.add(`${degreeText} ${toTitle(majorText)}`);
            }
        }
    });

    const arr = Array.from(results).sort();
    return arr;
}

const majors = extractKementan();
console.log(`Found ${majors.length} unique majors for Kementan.`);
console.log(majors.slice(0, 30));

// Integrate
const dataPath = path.join(__dirname, '../src/data.json');
const mappingPath = path.join(__dirname, '../src/drive_mapping.json');

const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
mapping['Kementerian Pertanian Baru.pdf'] = '1dQwqO8DpB9Kmn5ptNoYb7OG3s76QOS-O';
fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
console.log('Updated drive_mapping.json');

let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const maxId = Math.max(...data.map(d => parseInt(d.id.toString().split('_')[0]) || 0));

const newEntries = majors.map((major, index) => ({
    id: maxId + 1 + index,
    instansi: 'Kementerian Pertanian',
    jurusan: major,
    link_pdf: '/pdfs/pusat/Kementerian Pertanian Baru.pdf'
}));

// Filter out old Kementan if it had an empty or placeholder entry
const filteredData = data.filter(d => !(d.instansi === 'Kementerian Pertanian' && d.jurusan === 'LIHAT DETAIL DI PDF'));
// Wait, Kementan might already have old entries. The user said "Kementerian Pertanian Baru.pdf file tambahan".
// It is an addition, so we just append. But let's remove any "LIHAT DETAIL DI PDF".

const finalData = [...filteredData, ...newEntries];
fs.writeFileSync(dataPath, JSON.stringify(finalData, null, 2));
console.log(`Added ${newEntries.length} entries to data.json. Total entries: ${finalData.length}`);
