import os
import json
import re
from pypdf import PdfReader

# Paths to the datasets
BASE_DIR = r'c:\Users\dhani\Documents\CPNS\Dataset'
# Note: We assume the user will copy these into public/pdfs/
FOLDERS = [
    os.path.join(BASE_DIR, '01. Instansi Pusat'),
    os.path.join(BASE_DIR, '02. Instansi Daerah')
]

# Output file path
OUTPUT_FILE = os.path.join(BASE_DIR, 'cpns-search', 'src', 'data.json')

def clean_instansi_name(filename):
    name = os.path.splitext(filename)[0]
    name = name.replace('_', ' ').replace('-', ' ')
    name = re.sub(r'PENETAPAN KEBUTUHAN CASN ', '', name, flags=re.IGNORECASE)
    name = re.sub(r'KABUPATEN ', 'Kab. ', name, flags=re.IGNORECASE)
    name = re.sub(r'KOTA ', 'Kota ', name, flags=re.IGNORECASE)
    name = re.sub(r'PROVINSI ', 'Prov. ', name, flags=re.IGNORECASE)
    return name.title()

def extract_majors_from_pdf(filepath):
    try:
        reader = PdfReader(filepath)
        text = ""
        # Search more pages for robustness
        for i in range(min(len(reader.pages), 40)):
            page_text = reader.pages[i].extract_text()
            if page_text:
                text += page_text + "\n"
        
        majors_found = set()
        
        # Improved regex to capture degrees like S-1, D-IV, D-III, etc.
        # This handles cases where degree is at start or end, and captures Roman numerals.
        # Pattern: (Degree) (Major Name) or (Major Name) (Degree)
        degree_pattern = r'(?:S-?[123]|D-?[IVX]+|PROFESI|PENDIDIKAN PROFESI|DIPLOMA\s+[IVX]+)'
        
        # Look for patterns like "S-1 TEKNOLOGI INFORMASI" or "TEKNOLOGI INFORMASI D-IV"
        # We also filter out common non-major strings
        patterns = [
            rf'({degree_pattern})\s+([A-Z\s\(\)/,.-]+)', # Degree + Major
            rf'([A-Z\s\(\)/,.-]+)\s+({degree_pattern})'  # Major + Degree
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                if pattern.startswith('('): # Degree first
                    deg, major = match.groups()
                else: # Major first
                    major, deg = match.groups()
                
                # Combined major string
                m = f"{deg} {major}".strip() if pattern.startswith('(') else f"{major} {deg}".strip()
                m = re.sub(r'\s+', ' ', m).strip()
                
                # Sanity filters
                if 10 < len(m) < 120 and not any(x in m.upper() for x in ['HALAMAN', 'TANGGAL', 'NOMOR', 'LAMPIRAN', 'KEPUTUSAN']):
                    # Clean trailing/leading non-alphanumeric junk
                    m = re.sub(r'^[^A-Z0-9]+|[^A-Z0-9\)]+$', '', m, flags=re.IGNORECASE)
                    if len(m) > 10:
                        majors_found.add(m.upper())
        
        return list(majors_found)
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return []

def main():
    all_data = []
    entry_id = 1
    
    print("Starting improved extraction from PDFs...")
    
    for folder in FOLDERS:
        if not os.path.exists(folder):
            print(f"Warning: Folder not found: {folder}")
            continue
            
        files = [f for f in os.listdir(folder) if f.lower().endswith('.pdf')]
        print(f"Found {len(files)} files in {os.path.basename(folder)}")
        
        folder_slug = "pusat" if "Pusat" in folder else "daerah"
        
        for filename in files:
            filepath = os.path.join(folder, filename)
            instansi = clean_instansi_name(filename)
            
            # Use the /pdfs/ path which will be served from public/pdfs/
            link_path = f"/pdfs/{folder_slug}/{filename}"
            
            majors = extract_majors_from_pdf(filepath)
            
            if not majors:
                all_data.append({
                    "id": entry_id,
                    "instansi": instansi,
                    "jurusan": "LIHAT DETAIL DI PDF",
                    "link_pdf": link_path
                })
                entry_id += 1
            else:
                for major in majors:
                    all_data.append({
                        "id": entry_id,
                        "instansi": instansi,
                        "jurusan": major,
                        "link_pdf": link_path
                    })
                    entry_id += 1
            
            if entry_id % 100 == 0:
                print(f"Processed {entry_id} entries...")

    print(f"Extraction complete. Total entries: {len(all_data)}")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
    
    print(f"Saved improved data to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
