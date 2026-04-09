const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data.json', 'utf8'));

// Mocking some regex and logic from App.jsx to see what's skipped
const INVALID_STARTS = [
  'NO JABATAN', 'NO NAMA JABATAN', 'YTH.', 'YTH ', 'DI LINGKUNGAN', 'DI JAKARTA',
  'DI PROVINSI', 'DI PEMERINTAHAN', 'CPNS NO', 'TENTANG SELEKSI', 'TENTANG PENGADAAN',
  'LIHAT DETAIL', 'CALON PEGAWAI', 'PENGADAAN CPNS', 'SELEKSI PENGADAAN',
  'FORMASI TAHUN', 'KEPUTUSAN', 'PENGUMUMAN', 'LAMPIRAN', 'NOMOR', 'NO.',
  'PERATURAN', 'ALOKASI FORMASI', 'UNIT PENEMPATAN', 'KUALIFIKASI PENDIDIKAN',
  'BADAN KEPEGAWAIAN', 'BADAN KARANTINA', 'BADAN INFORMASI',
];

const isRawValid = (raw) => {
  if (!raw || raw.trim().length < 4) return false;
  if (raw.trim().length > 200) return false;
  const upper = raw.trim().toUpperCase();
  return !INVALID_STARTS.some(p => upper.startsWith(p));
};

const splitOnInternalDeg = (seg) => {
    const re = /(S[-–]?\s*[123]|D[-–]?\s*(?:IV|III|II|I|[1-4]))\s/gi;
    const splitPositions = [];
    let match;
    while ((match = re.exec(seg)) !== null) {
      if (match.index > 0 && seg[match.index - 1] === ' ') {
        splitPositions.push(match.index);
      }
    }
    if (splitPositions.length === 0) return [seg];
    const parts = [];
    let cursor = 0;
    for (const pos of splitPositions) {
      const chunk = seg.slice(cursor, pos).trim();
      if (chunk && chunk.length >= 3) parts.push(chunk);
      cursor = pos;
    }
    const last = seg.slice(cursor).trim();
    if (last && last.length >= 3) parts.push(last);
    return parts.length > 0 ? parts : [seg];
};

const EDU_ONLY_RE = /^(S[-–]?\s*[123]|D[-–]?\s*(IV|III|II|I|[1-4]))\s*$/i;

const processJurusan = (raw) => {
    if (!raw || !isRawValid(raw)) return [];
    const slashParts = raw.split(/\s*\/\s*/).map(p => p.trim()).filter(Boolean);
    const allParts = [];
    slashParts.forEach(p => {
      const sub = splitOnInternalDeg(p);
      allParts.push(...sub);
    });
    if (allParts.length === 0) return [];
    const segments = [];
    allParts.forEach(p => {
      if (!EDU_ONLY_RE.test(p)) segments.push(p);
    });
    return segments;
};

// Analysis
const instansiFilterSet = new Set(data.map(d => d.instansi));
const instansiWithValidDataSet = new Set();

data.forEach(item => {
    const res = processJurusan(item.jurusan || '');
    if (res.length > 0) {
        instansiWithValidDataSet.add(item.instansi);
    }
});

console.log(`Total instansi in RAW data: ${instansiFilterSet.size}`);
console.log(`Total instansi with VALID data (after normalization): ${instansiWithValidDataSet.size}`);

const missingAgencies = Array.from(instansiFilterSet).filter(i => !instansiWithValidDataSet.has(i));

if (missingAgencies.length > 0) {
    console.log("\nWARNING: These agencies are in the filter but have NO results after normalization:");
    missingAgencies.sort().forEach(i => {
        const samples = data.filter(d => d.instansi === i).map(d => d.jurusan).slice(0, 3);
        console.log(`- ${i} (Sample raw jurusan: ${JSON.stringify(samples)})`);
    });
} else {
    console.log("\nSuccess: All agencies in the filter have at least one valid result.");
}

// Check for case duplicates
const lowerSet = new Set(Array.from(instansiFilterSet).map(i => i.toLowerCase()));
if (lowerSet.size !== instansiFilterSet.size) {
    console.log("\nWARNING: Some agencies have duplicate names with different casing (e.g. 'Kemenkeu' vs 'KEMENKEU').");
}
