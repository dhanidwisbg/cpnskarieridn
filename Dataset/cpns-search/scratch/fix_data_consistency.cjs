const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('Original entries:', data.length);

// 1. Standardize all names
const standardizedData = data.map(d => ({
    ...d,
    instansi: d.instansi.trim()
        .replace(/Kementrian/gi, 'Kementerian')
        .replace(/Sumatra/gi, 'Sumatera')
        .replace(/Kemenkes/gi, 'Kementerian Kesehatan')
        .replace(/Kemendes/gi, 'Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi')
}));

// 2. Identify agencies that have REAL data
const agenciesWithRealData = new Set();
standardizedData.forEach(d => {
    if (d.jurusan !== 'LIHAT DETAIL DI PDF') {
        agenciesWithRealData.add(d.instansi);
    }
});

console.log('Agencies with real data:', agenciesWithRealData.size);

// 3. Remove placeholders for agencies that have real data
const finalData = standardizedData.filter(d => {
    if (d.jurusan === 'LIHAT DETAIL DI PDF' && agenciesWithRealData.has(d.instansi)) {
        return false;
    }
    return true;
});

console.log('Final entries:', finalData.length);
console.log('Removed', standardizedData.length - finalData.length, 'placeholders.');

fs.writeFileSync(dataPath, JSON.stringify(finalData, null, 2));
console.log('Saved to src/data.json');
