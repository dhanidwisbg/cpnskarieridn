import json
import os
import pandas as pd

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, 'src', 'data.json')
EXCEL_FILE = os.path.join(BASE_DIR, 'FORMASI CPNS 2024 - KEMENTERIAN PERHUBUNGAN.xlsx')
GOOGLE_SHEETS_URL = "https://docs.google.com/spreadsheets/d/19rUJjr57fq4zmCORYP-LrgnIlhnI7dgc-Yphvk7zNu4/edit?gid=0#gid=0"

def update_data():
    print(f"Reading Excel: {EXCEL_FILE}")
    df = pd.read_excel(EXCEL_FILE)
    
    # Extract unique majors from 'Kualifikasi Pendidikan'
    # We clean them slightly (strip whitespace)
    majors = df['Kualifikasi Pendidikan'].dropna().str.strip().unique().tolist()
    print(f"Found {len(majors)} unique majors.")

    print(f"Loading existing data mapping from: {DATA_FILE}")
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Filter out existing Perhubungan entries
    original_count = len(data)
    data = [d for d in data if 'Kementerian Perhubungan' not in d['instansi']]
    new_count_after_removal = len(data)
    print(f"Removed {original_count - new_count_after_removal} existing Perhubungan entries.")

    # Add new entries
    for major in majors:
        data.append({
            "id": 0, # Placeholder
            "instansi": "Kementerian Perhubungan",
            "jurusan": major,
            "link_pdf": GOOGLE_SHEETS_URL
        })
    
    # Re-index
    for i, entry in enumerate(data):
        entry['id'] = i + 1
    
    print(f"Total entries now: {len(data)}")

    # Save
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print("Success: data.json updated.")

if __name__ == "__main__":
    update_data()
