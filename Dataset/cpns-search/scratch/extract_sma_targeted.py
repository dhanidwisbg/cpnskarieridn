import os
import json
import re
from pypdf import PdfReader

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FOLDERS = [
    os.path.join(BASE_DIR, 'public', 'pdfs', 'pusat'),
    os.path.join(BASE_DIR, 'public', 'pdfs', 'daerah')
]
DATA_FILE = os.path.join(BASE_DIR, 'src', 'data.json')

# Keywords for high school
SMA_KEYWORDS = [r'SLTA', r'SMA', r'SMK', r'SLTP', r'SMU', r'MA', r'SEDERAJAT']
# False positives to ignore
IGNORE_KEYWORDS = [r'MANAJEMEN', r'MANAJERIAL', r'MANFAAT', r'MANUSIA', r'MANDIRI', r'MANDA']

def clean_instansi_name(filename):
    name = os.path.splitext(filename)[0]
    name = name.replace('_', ' ').replace('-', ' ')
    name = re.sub(r'PENETAPAN KEBUTUHAN CASN ', '', name, flags=re.IGNORECASE)
    name = re.sub(r'KABUPATEN ', 'Kab. ', name, flags=re.IGNORECASE)
    name = re.sub(r'KOTA ', 'Kota ', name, flags=re.IGNORECASE)
    name = re.sub(r'PROVINSI ', 'Prov. ', name, flags=re.IGNORECASE)
    return name.title()

def extract_sma_data(filepath):
    try:
        reader = PdfReader(filepath)
        results = set()
        
        # Scan up to 150 pages for large documents
        num_pages = min(len(reader.pages), 150)
        
        for i in range(num_pages):
            text = reader.pages[i].extract_text()
            if not text:
                continue
            
            lines = text.split('\n')
            for j, line in enumerate(lines):
                line_upper = line.upper()
                
                # Broad check for SMA keywords
                if any(kw in line_upper for kw in SMA_KEYWORDS):
                    # Strict check to avoid "MANAJEMEN"
                    # We look for standalone SLTA, SMA, SMK, etc.
                    found = False
                    # Pattern for standalone SMA/SMK/SLTA or combined with / or -
                    if re.search(r'\b(SLTA|SMA|SMK|SLTP|SMU|MA|MAN|SMP|SEDERAJAT)\b', line_upper):
                        # Filter out false positives
                        if not any(re.search(rf'\b{ig}\b', line_upper) for ig in IGNORE_KEYWORDS):
                            found = True
                    
                    if found:
                        # Try to clean the entry
                        # Often the line looks like: "24 PENJAGA TAHANAN - SLTA/SMA SEDERAJAT"
                        # Or just "SLTA/SMA SEDERAJAT"
                        
                        clean_line = line.strip()
                        # If the line is just the education level, try to prepend the previous line if it looks like a position
                        if len(clean_line) < 30 and j > 0:
                            prev_line = lines[j-1].strip()
                            if len(prev_line) > 5 and not any(kw in prev_line.upper() for kw in SMA_KEYWORDS):
                                clean_line = f"{prev_line} - {clean_line}"
                        
                        # Sanity clean: remove page numbers or leading numbers
                        clean_line = re.sub(r'^\d+\s+', '', clean_line)
                        clean_line = re.sub(r'\s+', ' ', clean_line).strip()
                        
                        if 8 < len(clean_line) < 150:
                            results.add(clean_line.upper())
                            
        return list(results)
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return []

def main():
    print("Starting targeted SMA/SMK extraction...")
    
    # Load existing data
    if not os.path.exists(DATA_FILE):
        print("Error: src/data.json not found.")
        return
        
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        all_data = json.load(f)
    
    # We will keep all existing data and just ADD new SMA entries
    # unless the agency only has "LIHAT DETAIL".
    
    new_entries_count = 0
    
    for folder in FOLDERS:
        files = [f for f in os.listdir(folder) if f.lower().endswith('.pdf')]
        folder_slug = "pusat" if "pusat" in folder.lower() else "daerah"
        
        print(f"Processing {len(files)} files in {folder_slug}...")
        
        for filename in files:
            filepath = os.path.join(folder, filename)
            instansi = clean_instansi_name(filename)
            sma_majors = extract_sma_data(filepath)
            
            if sma_majors:
                # 1. Remove "LIHAT DETAIL" placeholders for this instansi if we found real data
                all_data = [e for e in all_data if not (e['instansi'] == instansi and e['jurusan'] == "LIHAT DETAIL DI PDF")]
                
                # 2. Add new SMA entries (avoid duplicates)
                existing_majors = {e['jurusan'] for e in all_data if e['instansi'] == instansi}
                
                link_path = f"/pdfs/{folder_slug}/{filename}"
                
                for major in sma_majors:
                    if major not in existing_majors:
                        all_data.append({
                            "id": 0, # Will fix at end
                            "instansi": instansi,
                            "jurusan": major,
                            "link_pdf": link_path
                        })
                        new_entries_count += 1
                        existing_majors.add(major)
            
            if new_entries_count > 0 and new_entries_count % 100 == 0:
                print(f"Extracted {new_entries_count} new SMA entries so far...")

    # Re-index
    for i, entry in enumerate(all_data):
        entry['id'] = i + 1
        
    print(f"Finished. Added {new_entries_count} new SMA/SMK entries.")
    print(f"Total entries now: {len(all_data)}")
    
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
    
    print("Update complete.")

if __name__ == "__main__":
    main()
