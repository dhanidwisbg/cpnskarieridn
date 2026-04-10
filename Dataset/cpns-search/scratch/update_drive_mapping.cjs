const fs = require('fs');

const spreadsheetPath = 'spreadsheet_data.json';
const mappingPath = 'src/drive_mapping.json';
const dataPath = 'src/data.json';

// Helper to extract Drive ID from URL
function extractId(url) {
    if (!url || !url.includes('drive.google.com')) return null;
    const match = url.match(/\/d\/([^\/]+)/);
    return match ? match[1] : null;
}

// Normalizer for fuzzy matching
function normalize(str) {
    return str.toLowerCase()
        .replace(/pemerintah kabupaten/g, 'kab')
        .replace(/pemerintah kota/g, 'kota')
        .replace(/pemerintah provinsi/g, 'prov')
        .replace(/kementerian/g, 'kemen')
        .replace(/kementrian/g, 'kemen')
        .replace(/sumatera/g, 'sumatra') // Standardize sumatra
        .replace(/kemendikbudristek/g, 'kemdikbudristek')
        .replace(/kepulauan/g, 'kep')
        .replace(/[^a-z0-9]/g, '');
}

const synonyms = {
    "kemdikbudristek": "kementrian pendidikan kebudayaan riset dan teknologi",
    "kemenkes": "kementrian kesehatan",
    "ncada": "ngada",
    "sindenreng": "sidrap", // Sidenreng Rappang is often Sidrap
};

async function run() {
    console.log("Loading data sources...");
    const spreadsheetContent = fs.readFileSync(spreadsheetPath, 'utf8');
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // 1. Parse Spreadsheet
    const lines = spreadsheetContent.split('\n').filter(l => l.trim());
    const spreadsheetMap = new Map(); // normalizedName -> driveId
    
    lines.slice(1).forEach(line => {
        // Handle CSV split correctly (split by comma, but respect quotes)
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (parts.length < 4) return;
        
        let name = parts[1].replace(/^"|"$/g, '').trim();
        let link = parts[parts.length - 1].trim();
        
        const driveId = extractId(link);
        if (driveId) {
            spreadsheetMap.set(normalize(name), driveId);
            // Also store short names if present in parentheses
            const shortMatch = name.match(/\(([^)]+)\)/);
            if (shortMatch) {
                spreadsheetMap.set(normalize(shortMatch[1]), driveId);
            }
        }
    });

    console.log(`Found ${spreadsheetMap.size} unique keys in spreadsheet map.`);

    // 2. Find Broken Agencies & Filenames
    const brokenFilenames = new Map(); // filename -> agencyName
    data.forEach(item => {
        if (item.link_pdf && (item.link_pdf.startsWith('/pdfs/') || item.instansi === "Kementerian Kesehatan")) {
            const filename = item.link_pdf.startsWith('/pdfs/') ? item.link_pdf.split('/').pop() : "KEMENTERIAN_KESEHATAN.pdf";
            if (!mapping[filename]) {
                brokenFilenames.set(filename, item.instansi);
            }
        }
    });

    console.log(`Identified ${brokenFilenames.size} unique broken items.`);

    // 3. Attempt Matching
    let updatedCount = 0;
    const newMapping = { ...mapping };

    for (const [filename, agencyName] of brokenFilenames.entries()) {
        const normAgency = normalize(agencyName);
        const normFilename = normalize(filename.replace(/\.pdf$/i, ''));
        
        let foundId = spreadsheetMap.get(normAgency) || spreadsheetMap.get(normFilename);

        // Try mapping synonyms
        if (!foundId) {
            for (const [k, v] of Object.entries(synonyms)) {
                if (normAgency.includes(k) || normFilename.includes(k)) {
                    foundId = spreadsheetMap.get(normalize(v));
                    if (foundId) break;
                }
            }
        }

        // Try partial match if direct match fails
        if (!foundId) {
            for (const [sName, sId] of spreadsheetMap.entries()) {
                if (normAgency.length > 3 && (normAgency.includes(sName) || sName.includes(normAgency))) {
                    foundId = sId;
                    break;
                }
                if (normFilename.length > 10 && (normFilename.includes(sName) || sName.includes(normFilename))) {
                    foundId = sId;
                    break;
                }
            }
        }

        if (foundId) {
            newMapping[filename] = foundId;
            updatedCount++;
            console.log(`✅ Matched: "${filename}" -> ${foundId} (${agencyName})`);
        } else {
            console.log(`❌ No match: "${filename}" (${agencyName})`);
        }
    }

    // Special case fix for Kemenkes (which had a text string instead of a path)
    if (newMapping["KEMENTERIAN_KESEHATAN.pdf"] || true) {
         const kemenkesId = spreadsheetMap.get(normalize("Kementerian Kesehatan"));
         if (kemenkesId) {
             newMapping["KEMENTERIAN_KESEHATAN.pdf"] = kemenkesId;
             // We also need to fix data.json for items that have the weird ".: Formasi CPNS | ..." string
             // but drive_mapping only cares about filenames. 
         }
    }

    // 4. Save
    fs.writeFileSync(mappingPath, JSON.stringify(newMapping, null, 2));
    console.log(`\nDONE! Updated ${updatedCount} links in ${mappingPath}`);
}

run();
