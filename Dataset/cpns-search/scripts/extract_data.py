import os
import json
import re
from pypdf import PdfReader

# Paths to the datasets
# Paths to the datasets
# We will use the local public/pdfs folder as the source
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FOLDERS = [
    os.path.join(BASE_DIR, 'public', 'pdfs', 'pusat'),
    os.path.join(BASE_DIR, 'public', 'pdfs', 'daerah')
]

# Output file path
OUTPUT_FILE = os.path.join(BASE_DIR, 'src', 'data.json')

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
        # Added: SMA, SMK, SLTA, SLTP, SMU, MA, MAN, SMP
        degree_pattern = r'(?:S-?[123]|D-?[IVX]+|PROFESI|PENDIDIKAN PROFESI|DIPLOMA\s+[IVX]+|SMA|SMK|SLTA|SLTP|SMU|MA|MAN|SMP|SEDERAJAT)'
        
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
    
    # Load existing data to preserve special entries (like OCR'd Kemenkes/Kementan)
    existing_data = []
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
    
    # Track which agencies already have "real" data (not placeholders)
    # We use a set of instansi names
    agencies_with_real_data = set()
    for entry in existing_data:
        if entry.get('jurusan') != "LIHAT DETAIL DI PDF":
            agencies_with_real_data.add(entry.get('instansi'))

    print(f"Loaded {len(existing_data)} existing entries.")
    print(f"Found {len(agencies_with_real_data)} agencies with real data already.")

    processed_instansi = set()
    
    # We will prioritize new extraction but preserve existing real data
    new_extracted_data = []
    
    print("Starting improved extraction from PDFs...")
    
    for folder in FOLDERS:
        if not os.path.exists(folder):
            print(f"Warning: Folder not found: {folder}")
            continue
            
        files = [f for f in os.listdir(folder) if f.lower().endswith('.pdf')]
        print(f"Found {len(files)} files in {os.path.basename(folder)}")
        
        folder_slug = "pusat" if "pusat" in folder.lower() else "daerah"
        
        for filename in files:
            filepath = os.path.join(folder, filename)
            instansi = clean_instansi_name(filename)
            processed_instansi.add(instansi)
            
            link_path = f"/pdfs/{folder_slug}/{filename}"
            
            # If this agency ALREADY has real data (like Kemenkes/Kementan), we skip parsing it
            # unless we want to ADD SMA data to it. But for now, preservation is safer.
            if instansi in agencies_with_real_data:
                # Keep existing entries for this instansi
                instansi_entries = [e for e in existing_data if e.get('instansi') == instansi]
                new_extracted_data.extend(instansi_entries)
                continue

            majors = extract_majors_from_pdf(filepath)
            
            if not majors:
                new_extracted_data.append({
                    "id": 0, # Will re-index later
                    "instansi": instansi,
                    "jurusan": "LIHAT DETAIL DI PDF",
                    "link_pdf": link_path
                })
            else:
                for major in majors:
                    new_extracted_data.append({
                        "id": 0,
                        "instansi": instansi,
                        "jurusan": major,
                        "link_pdf": link_path
                    })
            
            if len(new_extracted_data) % 500 == 0:
                print(f"Cumulative entries: {len(new_extracted_data)}...")

    # Re-index all entries
    for i, entry in enumerate(new_extracted_data):
        entry['id'] = i + 1

    print(f"Extraction complete. Total entries: {len(new_extracted_data)}")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(new_extracted_data, f, indent=2, ensure_ascii=False)
    
    print(f"Saved merged data to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
