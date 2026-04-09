const fs = require('fs');
// Mocking App.jsx module level variables
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
  if (upper.startsWith('DI ')) {
    const after = upper.slice(3).trim();
    if (!MAJOR_KEYWORDS.some(k => after.includes(k))) return false;
  }
  return true;
};

const EDU_PREFIX_RE = /^(S[-–]?\s*[123]|D[-–]?\s*(?:IV|III|II)|D[-–]\s*I|D\.\s*I|D\s+I)\s+/i;
const EDU_TRAIL_RE = /\s+(S[-–]?\s*[123]|D[-–]?\s*(?:IV|III|II)|D[-–]\s*I|D\s+I)\s*$/i;

// Sample verification
const rawData = [
    { "id": 2600, "jurusan": "DI SETYANINGSIH" },
    { "id": 2605, "jurusan": "S-1 PEMBANGUNAN SOSIAL DAN KESEJAHTERAAN" },
    { "id": 2609, "jurusan": "S-1 SOSIOLOGI" },
    { "id": 2614, "jurusan": "ANNISA RIZKY DI" },
    { "id": 2611, "jurusan": "S-1 EKONOMI PEMBANGUNAN" }
];

console.log("Verification results:");
rawData.forEach(item => {
    const valid = isRawValid(item.jurusan);
    if (!valid) {
        console.log(`ID ${item.id} [${item.jurusan}]: REJECTED by as invalid raw`);
        return;
    }
    // Simplified normalization for check
    const normalized = item.jurusan; // mock
    const likely = isLikelyMajor(normalized);
    if (!likely) {
        console.log(`ID ${item.id} [${item.jurusan}]: REJECTED as unlikely major`);
    } else {
        console.log(`ID ${item.id} [${item.jurusan}]: KEPT`);
    }
});
