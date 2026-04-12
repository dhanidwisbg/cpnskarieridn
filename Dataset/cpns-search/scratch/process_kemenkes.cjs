const fs = require('fs');
const path = require('path');

// --- REUSE NORMALIZATION LOGIC FROM APP.JSX (Hand-copied & Optimized) ---

const INVALID_STARTS = [
  'NO JABATAN', 'YTH.', 'DI LINGKUNGAN', 'FORMASI TAHUN', 'PENGUMUMAN', 'LAMPIRAN', 'NOMOR', 'NO.', 'DIREKTUR', 'MENTERI', 'TOTAL SATUAN KERJA', 'ALOKASI KEBUTUHAN', 'BUTUH BANTUAN', 'KLIK DISINI'
];

const MAJOR_KEYWORDS = [
  'TEKNIK', 'ILMU', 'MANAJEMEN', 'PENDIDIKAN', 'EKONOMI', 'SOSIAL', 'HUKUM',
  'KESEHATAN', 'SENI', 'PERTANIAN', 'KOMPUTER', 'INFORMATIKA', 'SOSIOLOGI',
  'AKUNTANSI', 'PSIKOLOGI', 'FISIKA', 'KIMIA', 'BIOLOGI', 'MATEMATIKA',
  'AGRIBISNIS', 'KOMUNIKASI', 'KEHUTANAN', 'KEPERAWATAN', 'KEBIDANAN',
  'FARMASI', 'ADMINISTRASI', 'HUBUNGAN', 'LINGKUNGAN', 'PEMBANGUNAN',
  'SASTRA', 'GURU', 'DOSEN', 'DOKTER', 'ANALIS', 'PENGAWAS',
  'PENGELOLA', 'ARSIPARIS', 'STATISTIK', 'PANGAN', 'GIZI', 'TEKNOLOGI',
  'KEUANGAN', 'KEARSIPAN', 'TATA', 'USAHA', 'BAHASA', 'SYARIAH', 'KEDOKTERAN', 'RADIOLOGI', 'GIZI', 'BIDAN', 'FISIOTERAPI', 'SANITASI', 'EPIDEMIOLOGI', 'PSIKOLOG', 'APOTEKER', 'NERS'
];

const EDU_PREFIX_RE = /^(S[-–]?\s*[123]|D[-–]?\s*(?:IV|III|II|I)|PROFESI|NERS|APDTEKER|BIDAN|DOKTER)\s+/i;

const normalizeEdu = (s) => s.trim()
  .replace(/[S5$§]-?\s*1/i, 'S-1')
  .replace(/S-?\s*2/i, 'S-2')
  .replace(/S-?\s*3/i, 'S-3')
  .replace(/D-?\s*(IV|4)/i, 'D-IV')
  .replace(/D-?\s*(III|3)/i, 'D-III')
  .replace(/D-?\s*(II|2)/i, 'D-II')
  .replace(/D-?\s*(I|1)/i, 'D-I');

const toTitle = (str) => str.toLowerCase()
  .replace(/(?:^|\s)\S/g, c => c.toUpperCase())
  .replace(/\bD-Iv\b/g, 'D-IV').replace(/\bD-Iii\b/g, 'D-III')
  .replace(/\bD-Ii\b/g, 'D-II').replace(/\bD-I\b/g, 'D-I')
  .replace(/\bS-([123])\b/g, (_, n) => `S-${n}`);

function cleanLine(line) {
  let s = line.trim();
  // Kemenkes specific OCR fixes
  s = s.replace(/[5$§]-1/g, 'S-1');
  s = s.replace(/~~/g, '');
  s = s.replace(/§-1/g, 'S-1');
  s = s.replace(/[\(\)]/g, ' '); // Remove parens to split better
  return s;
}

function extractKemenkes() {
  const ocrPath = path.join(__dirname, 'kemenkes_ocr.txt');
  const content = fs.readFileSync(ocrPath, 'utf8');
  
  const rawSegments = content.split(/[\/\n\r]+/).map(cleanLine).filter(s => s.length > 4);
  const results = new Set();

  rawSegments.forEach(seg => {
    const upper = seg.toUpperCase();
    
    // Filter junk
    if (INVALID_STARTS.some(p => upper.startsWith(p))) return;
    if (!MAJOR_KEYWORDS.some(k => upper.includes(k))) return;
    
    // Check for degrees
    let normalized = null;
    if (EDU_PREFIX_RE.test(seg)) {
        const m = seg.match(EDU_PREFIX_RE);
        const edu = normalizeEdu(m[1]);
        const rest = seg.slice(m[0].length).trim();
        if (rest.length > 2) {
            normalized = `${edu} ${toTitle(rest)}`;
        }
    } else if (upper.includes('PROFESI')) {
        normalized = toTitle(seg);
    }
    
    if (normalized && normalized.length > 5 && normalized.length < 100) {
        results.add(normalized);
    }
  });

  const majors = Array.from(results).sort();
  console.log(`Extracted ${majors.length} unique majors for Kemenkes.`);
  return majors;
}

function integrate() {
  const majors = extractKemenkes();
  const dataPath = path.join(__dirname, '../src/data.json');
  const mappingPath = path.join(__dirname, '../src/drive_mapping.json');
  
  // 1. Update Mapping
  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  mapping['kemenkes.pdf'] = '1OZBh_8P3MBhlxqhWjU1ssm0AtMfDZkOZ';
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log('Updated drive_mapping.json');

  // 2. Update Data
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const maxId = Math.max(...data.map(d => parseInt(d.id.toString().split('_')[0]) || 0));
  
  const newEntries = majors.map((major, index) => ({
    id: maxId + 1 + index,
    instansi: 'Kementerian Kesehatan',
    jurusan: major,
    link_pdf: '/pdfs/pusat/kemenkes.pdf'
  }));

  // Remove old 'LIHAT DETAIL' entry for Kemenkes if exists
  const filteredData = data.filter(d => !(d.instansi === 'Kementerian Kesehatan' && d.jurusan === 'LIHAT DETAIL DI PDF'));
  
  const finalData = [...filteredData, ...newEntries];
  fs.writeFileSync(dataPath, JSON.stringify(finalData, null, 2));
  console.log(`Added ${newEntries.length} entries to data.json. Total entries: ${finalData.length}`);
}

integrate();
