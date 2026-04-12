const fs = require('fs');
const agencyData = JSON.parse(fs.readFileSync('src/data.json', 'utf8'));

const INVALID_STARTS = [
  'NO JABATAN', 'NO NAMA JABATAN', 'YTH.', 'YTH ', 'DI LINGKUNGAN', 'DI JAKARTA',
  'DI PROVINSI', 'DI PEMERINTAHAN', 'CPNS NO', 'TENTANG SELEKSI', 'TENTANG PENGADAAN',
  'LIHAT DETAIL', 'CALON PEGAWAI', 'PENGADAAN CPNS', 'SELEKSI PENGADAAN',
  'FORMASI TAHUN', 'KEPUTUSAN', 'PENGUMUMAN', 'LAMPIRAN', 'NOMOR', 'NO.',
  'PERATURAN', 'ALOKASI FORMASI', 'UNIT PENEMPATAN', 'KUALIFIKASI PENDIDIKAN',
  'BADAN KEPEGAWAIAN', 'BADAN KARANTINA', 'BADAN INFORMASI', 'DITETAPKAN DI',
  'KEPADA YTH', 'DI TEMPAT', 'A.N.', 'PLT.', 'PLH.', 'KEMENTERIAN DESA',
  'KEPALA BADAN', 'PEJABAT', 'DIREKTUR', 'SALINAN', 'MENTERI', 'PEMBINA',
  'DI KABUPATEN', 'DI KOTA', 'DI KECAMATAN',
];

const MAJOR_KEYWORDS = [
  'TEKNIK', 'ILMU', 'MANAJEMEN', 'PENDIDIKAN', 'EKONOMI', 'SOSIAL', 'HUKUM',
  'KESEHATAN', 'SENI', 'PERTANIAN', 'KOMPUTER', 'INFORMATIKA', 'SOSIOLOGI',
  'AKUNTANSI', 'PSIKOLOGI', 'FISIKA', 'KIMIA', 'BIOLOGI', 'MATEMATIKA',
  'AGRIBISNIS', 'KOMUNIKASI', 'KEHUTANAN', 'KEPERAWATAN', 'KEBIDANAN',
  'FARMASI', 'ADMINISTRASI', 'HUBUNGAN', 'LINGKUNGAN', 'PEMBANGUNAN',
  'SASTRA', 'EKSTRAKURIKULER', 'GURU', 'DOSEN', 'DOKTER', 'ANALIS', 'PENGAWAS',
  'PENGELOLA', 'ARSIPARIS', 'STATISTIK', 'PANGAN', 'GIZI', 'TEKNOLOGI',
  'KEUANGAN', 'KEARSIPAN', 'TATA', 'USAHA', 'AGRO', 'HIDRO', 'GEO', 'BIO',
  'FISIKA', 'KIMIA', 'BAHASA', 'LOKAL', 'KEAGAMAAN', 'SPIRITUAL', 'SYARIAH'
];

const isLikelyMajor = (normalized) => {
  const upper = normalized.toUpperCase();
  if (MAJOR_KEYWORDS.some(k => upper.includes(k))) return true;
  const withoutEdu = normalized.replace(/^(S[-–]?[123]|D[-–]?(?:IV|III|II|I))\s*/i, '').trim();
  if (withoutEdu.length < 5) return false;
  return false;
};

const isRawValid = (raw) => {
  if (!raw || raw.trim().length < 4) return false;
  if (raw.trim().length > 200) return false;
  const upper = raw.trim().toUpperCase();
  if (INVALID_STARTS.some(p => upper.startsWith(p))) return false;
  return true;
};

const EDU_PREFIX_RE = /^(S[-–]?\s*[123]|D[-–]?\s*(?:IV|III|II)|D[-–]\s*I|D\.\s*I|D\s+I)\s+/i;
const normalizeEdu = (s) => s.trim().replace(/D[-–]?\s*(I|1)/i, 'D-I'); // simplified for D-I check

const processJurusan = (raw) => {
  if (!raw || !isRawValid(raw)) return [];
  // Simplified for this check
  if (isLikelyMajor(raw)) return [raw];
  return [];
};

const kementan = agencyData.filter(d => d.instansi.toLowerCase().includes('pertanian'));
console.log('Total Kementan entries in data.json:', kementan.length);

let validCount = 0;
kementan.forEach(item => {
    const res = processJurusan(item.jurusan);
    if (res.length > 0) validCount++;
});

console.log('Valid Kementan entries (passed processJurusan):', validCount);
if (validCount > 0) {
    console.log('Sample valid:', kementan.filter(d => processJurusan(d.jurusan).length > 0).slice(0, 3).map(d => d.jurusan));
}
