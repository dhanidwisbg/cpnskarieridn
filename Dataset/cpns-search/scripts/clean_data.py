import json
import os
import re

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, 'src', 'data.json')
BACKUP_FILE = os.path.join(BASE_DIR, 'src', 'data.json.bak4')

# Scorched Earth Junk Patterns
JUNK_PATTERNS = [
    # Table Headers & Column Names
    r"NO\.?\s*NAMA\s*JABATAN",
    r"JUMLAH\s*KEBUTUHAN",
    r"UNIT\s*PENEMPATAN",
    r"KUALIFIKASI\s*PENDIDIKAN",
    r"ALOKASI\s*FORMASI",
    r"RINCIAN\s*KEBUTUHAN",
    r"TENTANG\s*PENGADAAN",
    r"UNTUK\s*PENGADAAN",
    r"UNIT\s*KERJA",
    r"DI\s*LINGKUNGAN",
    r"PERSYARATAN\s*KUALIFIKASI",
    r"TAHUN\s*ANGGARAN",
    r"NO\.?\s*JABATAN",
    r"FORMASI\s*JABATAN\s*FUNGSIONAL",
    r"PENGADAAN\s*CALON\s*APARATUR",
    r"PENETAPAN\s*KEBUTUHAN",
    r"ALOKASI\s*CPNS",
    r"RINCIAN\s*PENETAPAN",
    r"LIHAT\s*DETAIL\s*DI\s*PDF",
    
    # New Screenshot Patterns
    r"JABATAN\s*YANG\s*DILAMAR",
    r"JABATAN\s*YANG\s*DI",
    r"RENTANG\s*PENGHASILAN",
    r"PENGHASILAN\s*MINIMAL",
    r"IJAZAH\s*PENDIDIKAN",
    r"SYARAT\s*PADA\s*JABATAN",
    r"JENIS\s*FORMASI",
    r"JENIS\s*KEBUTUHAN",
    r"KELULUSAN\s*SELEKSI",
    r"SELEKSI\s*ADMINISTRASI",
    r"JABATAN\s*STRUKTURAL",
    r"JABATAN\s*FUNGSIONAL",
    r"KAB\.\s*WATAMPONE", # Example of location header junk
    
    # Generic Index Markers at start
    r"^\s*(\d+|[A-Za-z]|li|Ii|Iv)\.\s+", # 1. , A. , li. , Ii.
    r"^\s*\(\s*\d+\s*\)\s+", # (1)
    
    # Junk mentions of "JABATAN" in major name
    r"\s+JABATAN\s*$", # Ends with 'Jabatan'
    r"^\s*JABATAN\s+", # Starts with 'Jabatan'
    
    # "Ma " junk (if followed by JABATAN or similar)
    r"^MA\s+.*JABATAN",
    r"^MA\s+.*FORMASI",
    r"^MA\s+.*KEBUTUHAN"
]

# Keywords that mark a string as almost certainly junk if found
BLACKOUT_KEYWORDS = [
    "PENGHASILAN MINIMAL",
    "TUGAS JABATAN",
    "SYARAT PENDAFTARAN",
    "DOKUMEN PERSYARATAN",
    "RINCIAN FORMASI"
]

def clean_data():
    print(f"Loading data from: {DATA_FILE}")
    if not os.path.exists(DATA_FILE):
        print("Data file not found!")
        return

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Backup
    with open(BACKUP_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Backup created: {BACKUP_FILE}")

    original_count = len(data)
    
    # Compile regexes
    regexes = [re.compile(p, re.IGNORECASE) for p in JUNK_PATTERNS]
    
    # Cleaning
    cleaned_data = []
    removed_count = 0
    removed_samples = []

    for entry in data:
        jurusan = entry.get('jurusan', '')
        
        is_junk = False
        
        # 1. Regex check
        for reg in regexes:
            if reg.search(jurusan):
                is_junk = True
                break
        
        # 2. Blackout keyword check
        if not is_junk:
            upper = jurusan.upper()
            for k in BLACKOUT_KEYWORDS:
                if k in upper:
                    is_junk = True
                    break
        
        # 3. String length filtering for fragments
        if not is_junk:
            if len(jurusan) > 150: # Very long fragments are usually headers
                 is_junk = True
            elif len(jurusan) < 4 and not re.match(r'^(MA|S\d|D\d)', jurusan, re.I):
                 is_junk = True

        if is_junk:
            removed_count += 1
            if len(removed_samples) < 15:
                removed_samples.append(jurusan)
        else:
            cleaned_data.append(entry)

    # Re-index
    for i, entry in enumerate(cleaned_data):
        entry['id'] = i + 1

    print(f"Original count: {original_count}")
    print(f"Removed count: {removed_count}")
    print(f"Final count: {len(cleaned_data)}")
    
    print("\nSamples of removed entries:")
    for s in removed_samples:
        print(f"- {s}")

    # Save
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nSaved cleaned data to: {DATA_FILE}")

if __name__ == "__main__":
    clean_data()
