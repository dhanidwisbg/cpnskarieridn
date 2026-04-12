const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data.json', 'utf8'));

const keywords = ['SMA', 'SMK', 'SLTA', 'SEDERAJAT', 'SMU', 'MAN '];
const exclude = ['S-1', 'D-III', 'D-IV', 'D-II', 'D-I', 'S-2', 'S-3', 'PUSKESMAS', 'JASMANI SD'];

const found = data.filter(d => {
    const j = d.jurusan.toUpperCase();
    const hasKeyword = keywords.some(k => j.includes(k));
    const hasExclude = exclude.some(e => j.includes(e));
    return hasKeyword && !hasExclude;
});

console.log('Found:', found.length);
console.log('Unique entries (first 20):');
const unique = [...new Set(found.map(d => d.jurusan))].slice(0, 20);
console.log(unique);

const byInstansi = {};
found.forEach(d => {
    if (!byInstansi[d.instansi]) byInstansi[d.instansi] = 0;
    byInstansi[d.instansi]++;
});
console.log('Agencies with these entries:', Object.keys(byInstansi).length);
console.log('Top 5 agencies:', Object.entries(byInstansi).sort((a,b) => b[1] - a[1]).slice(0, 5));
