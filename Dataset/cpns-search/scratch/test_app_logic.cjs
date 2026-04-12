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
const EDU_ONLY_RE = /^(S[-–]?\s*[123]|D[-–]?\s*(?:IV|III|II)|D[-–]\s*I|D\s+I)\s*$/i;
const EDU_TRAIL_RE = /\s+(S[-–]?\s*[123]|D[-–]?\s*(?:IV|III|II)|D[-–]\s*I|D\s+I)\s*$/i;

const normalizeEdu = (s) => s.trim()
  .replace(/S[-–]?\s*1/i, 'S-1')
  .replace(/S[-–]?\s*2/i, 'S-2')
  .replace(/S[-–]?\s*3/i, 'S-3')
  .replace(/D[-–]?\s*(IV|4)/i, 'D-IV')
  .replace(/D[-–]?\s*(III|3)/i, 'D-III')
  .replace(/D[-–]?\s*(II|2)/i, 'D-II')
  .replace(/D[-–]?\s*(I|1)/i, 'D-I');

const toTitle = (str) => str.toLowerCase()
  .replace(/(?:^|\s)\S/g, c => c.toUpperCase())
  .replace(/\bD-Iv\b/g, 'D-IV').replace(/\bD-Iii\b/g, 'D-III')
  .replace(/\bD-Ii\b/g, 'D-II').replace(/\bD-I\b/g, 'D-I')
  .replace(/\bS-([123])\b/g, (_, n) => `S-${n}`);

const normOnePart = (part) => {
  let s = part.trim()
    .replace(/[\s,;\/]+$/, '').trim()
    .replace(/\)+$/, '').trim();
  if (!s || s.length < 3) return null;

  if (EDU_PREFIX_RE.test(s)) {
    const m = s.match(EDU_PREFIX_RE);
    const edu = normalizeEdu(m[1]);
    const name = s.slice(m[0].length).trim();
    if (!name || name.length < 2) return null;
    return `${edu} ${toTitle(name)}`;
  }
  const trail = s.match(EDU_TRAIL_RE);
  if (trail) {
    const edu = normalizeEdu(trail[1]);
    const name = s.slice(0, trail.index).trim();
    if (name.length >= 3) return `${edu} ${toTitle(name)}`;
  }
  return toTitle(s);
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

const processJurusan = (raw) => {
  if (!raw || !isRawValid(raw)) return [];
  const slashParts = raw.split(/\s*\/\s*/).map(p => p.trim()).filter(Boolean);
  const allParts = [];
  slashParts.forEach(p => {
    const sub = splitOnInternalDeg(p);
    allParts.push(...sub);
  });
  if (allParts.length === 0) return [];
  const standalone = [];
  const segments = [];
  allParts.forEach(p => {
    if (EDU_ONLY_RE.test(p)) standalone.push(normalizeEdu(p));
    else segments.push(p);
  });
  if (segments.length === 0) return [];
  const results = [];
  const finalResults = [];
  const usedDeg = new Set();
  segments.forEach(seg => {
    if (EDU_PREFIX_RE.test(seg)) {
      const n = normOnePart(seg);
      if (n && n.length >= 5) results.push(n);
    } else {
      const trail = seg.match(EDU_TRAIL_RE);
      if (trail) {
        const n = normOnePart(seg);
        if (n && n.length >= 5) results.push(n);
      } else {
        const avail = standalone.find(d => !usedDeg.has(d));
        if (avail) {
          usedDeg.add(avail);
          const n = normOnePart(`${avail} ${seg}`);
          if (n && n.length >= 5) results.push(n);
        } else {
          const n = normOnePart(seg);
          if (n && n.length >= 5) results.push(n);
        }
      }
    }
  });
  results.forEach(res => {
    if (isLikelyMajor(res)) finalResults.push(res);
  });
  return finalResults;
};

const testSamples = [
  'D-I Daya Kesehatan Peternakan',
  'D-I Kebijakan Publik',
  'D-I Kesehatan',
  'D-I Kesehatan,',
  'D-I Pembangunan'
];

testSamples.forEach(s => {
    console.log(`Input: "${s}" -> Output:`, processJurusan(s));
});
