import fs from 'fs';
import pdf from 'pdf-parse';

const BROKEN_AGENCIES = [
  "Kementerian Kesehatan", "Kementerian Perdagangan(1)", "Seleksi Penerimaan CPNS Kemdikbudristek TA 2024",
  "Pemprov Aceh TA 2024", "Prov. Aceh", "Prov. Bali", "Prov. DKI Jakarta(1)", "Prov. Maluku",
  "Prov. Sumatra Barat", "Siau Tagulandang Biaro", "Kab. Aceh", "Kab. Aceh Barat(1)",
  "Kab. Aceh Barat Daya", "Kab. Aceh Timur", "Kab. Anambas", "Kab. Banyuasin(1)",
  "Kab. Bolaang Mongondow", "Kab. Bontang", "Kab. Buru", "Kab. Cirebon(1)", "Kab. Flores",
  "Kab. Flores Timur(1)", "Kab. Halmahera Selatan Sekretariat Daerah", "Kab. Halmahera Tengah",
  "Kab. Halmahera Timur", "Kab. Halmahera Utara", "Kab. Hulu Sungai Selatan Panitia",
  "Kab. Kepulauan Aru", "Kab. Labuhan", "Kab. Labuhan Batu", "Kab. Lampung",
  "Kab. Lampung Selatan(1)", "Kab. Maluku", "Kab. Maluku Tengah(1)", "Kab. Ncada",
  "Kab. Ngada(1)", "Kab. Ogan Ilir Pengumuman", "Kab. Pekalongan", "Kab. Pesisir",
  "Kab. Polewali", "Kab. Rokan", "Kab. Rokan Hulu(1)", "Kab. Sidenreng Rappang(1)",
  "Kab. Simeulue(1)", "Kab. Sindenreng", "Kab. Sumba Tengah", "Kab. Tegal",
  "Kota Lhokseumawe(1)", "Kota Nusantara", "Kota Subulussalam(1)", "Kota Tidore"
];

async function extract() {
  const dataBuffer = fs.readFileSync('cpns.pdf');
  
  try {
    // If it's the standard pdf-parse, it exports a function as default
    const parser = typeof pdf === 'function' ? pdf : pdf.default;
    
    if (typeof parser !== 'function') {
        console.error("pdf-parse is not a function. Exported keys:", Object.keys(pdf));
        return;
    }

    const data = await parser(dataBuffer);
    const text = data.text;
    
    console.log("PDF Parsed successfully.");
    console.log(`Text length: ${text.length}`);
    
    const findings = [];
    const urlPattern = /https?:\/\/[^\s]+|drive\.google\.com\/[^\s]+/gi;
    
    BROKEN_AGENCIES.forEach(agency => {
      const normalizedAgency = agency.replace(/\(\d+\)$/, '').trim();
      const index = text.toUpperCase().indexOf(normalizedAgency.toUpperCase());
      
      if (index !== -1) {
        const context = text.slice(Math.max(0, index - 200), index + 1000);
        const matches = context.match(urlPattern);
        
        if (matches) {
          findings.push({
            agency: agency,
            matches: Array.from(new Set(matches))
          });
        } else {
          findings.push({
            agency: agency,
            matches: ["NOT FOUND (Text match, but no URL nearby)"]
          });
        }
      } else {
        const parts = normalizedAgency.split(' ').filter(p => p.length > 3);
        if (parts.length > 0) {
           const partIndex = text.toUpperCase().indexOf(parts[0].toUpperCase());
           if (partIndex !== -1) {
              const context = text.slice(Math.max(0, partIndex - 200), partIndex + 1000);
              const matches = context.match(urlPattern);
              if (matches) {
                 findings.push({
                    agency: agency,
                    matches: Array.from(new Set(matches)),
                    note: `Matched on partial name: ${parts[0]}`
                 });
              }
           }
        }
      }
    });
    
    console.log("\nFINDINGS:");
    findings.forEach(f => {
      console.log(`- ${f.agency}:`);
      f.matches.forEach(m => console.log(`  > ${m}`));
      if (f.note) console.log(`    (Note: ${f.note})`);
    });
    
  } catch (err) {
    console.error("Error parsing PDF:", err);
  }
}

extract();
