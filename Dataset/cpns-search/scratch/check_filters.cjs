const fs = require('fs');
const agencyData = JSON.parse(fs.readFileSync('src/data.json', 'utf8'));

// Mocking processJurusan (simplified)
const processJurusan = (raw) => {
    // Just a dummy to check if it returns something
    if (raw && raw.length > 5) return [raw];
    return [];
};

const cleanInstansi = (name) => name.trim();

let out = [];
agencyData.forEach(item => {
    const normalized = processJurusan(item.jurusan);
    const cleanedInstansi = cleanInstansi(item.instansi);
    if (normalized.length > 0) {
        out.push({ ...item, instansi: cleanedInstansi, jurusan: normalized[0] });
    }
});

const allUniqueInstansi = Array.from(new Set(out.map(d => d.instansi))).sort();
console.log('Total Agencies in Filter:', allUniqueInstansi.length);
console.log('Contains "Kementerian Pertanian"?:', allUniqueInstansi.includes('Kementerian Pertanian'));
console.log('Last 10:', allUniqueInstansi.slice(-10));
console.log('Search "Pertanian":', allUniqueInstansi.filter(a => a.includes('Pertanian')));
