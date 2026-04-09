const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data.json', 'utf8'));

// Mocking logic from updated App.jsx
const INVALID_STARTS = [
  'NO JABATAN', 'NO NAMA JABATAN', 'YTH.', 'YTH ', 'DI LINGKUNGAN', 'DI JAKARTA',
  'DI PROVINSI', 'DI PEMERINTAHAN', 'CPNS NO', 'TENTANG SELEKSI', 'TENTANG PENGADAAN',
  'LIHAT DETAIL', 'CALON PEGAWAI', 'PENGADAAN CPNS', 'SELEKSI PENGADAAN',
  'FORMASI TAHUN', 'KEPUTUSAN', 'PENGUMUMAN', 'LAMPIRAN', 'NOMOR', 'NO.',
  'PERATURAN', 'ALOKASI FORMASI', 'UNIT PENEMPATAN', 'KUALIFIKASI PENDIDIKAN',
  'BADAN KEPEGAWAIAN', 'BADAN KARANTINA', 'BADAN INFORMASI',
];

const cleanInstansi = (name) => {
  if (!name) return '';
  return name.trim()
    .replace(/\s+/g, ' ')
    .replace(/Kementrian/gi, 'Kementerian')
    .replace(/Sumatra/gi, 'Sumatera')
    .replace(/\(\d+\)$/, '')
    .trim();
};

const isRawValid = (raw) => {
  if (!raw || raw.trim().length < 4) return false;
  if (raw.trim().length > 200) return false;
  const upper = raw.trim().toUpperCase();
  return !INVALID_STARTS.some(p => upper.startsWith(p));
};

const processJurusan = (raw) => {
    if (!raw || !isRawValid(raw)) return [];
    // simplified for this check
    return [raw]; 
};

// Analysis
const expandedData = [];
data.forEach(item => {
    const cleaned = cleanInstansi(item.instansi);
    const normalized = processJurusan(item.jurusan || '');
    if (normalized.length > 0) {
        expandedData.push({ ...item, instansi: cleaned });
    }
});

const filterSet = new Set(expandedData.map(d => d.instansi));

console.log(`Total instansi in RAW data: ${new Set(data.map(d => d.instansi)).size}`);
console.log(`Total instansi in NEW filter: ${filterSet.size}`);

// Check for remaining duplicates
const lowerMap = new Map();
Array.from(filterSet).forEach(i => {
    const low = i.toLowerCase();
    if (!lowerMap.has(low)) lowerMap.set(low, []);
    lowerMap.get(low).push(i);
});

const duplicates = Array.from(lowerMap.entries()).filter(([low, list]) => list.length > 1);
if (duplicates.length > 0) {
    console.log("Remaining duplicates:");
    duplicates.forEach(([low, list]) => console.log(`- ${list.join(' vs ')}`));
} else {
    console.log("No more casing duplicates in filter!");
}
