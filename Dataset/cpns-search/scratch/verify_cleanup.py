import json
import os

DATA_FILE = r'c:\Users\dhani\Documents\CPNS\Dataset\cpns-search\src\data.json'

def verify():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    check_keywords = [
        'BSSN NO JABATAN', 
        'USAHA NO NAMA', 
        'UNTUK PENGADAAN CALON', 
        'NO NAMA JABATAN',
        'JUMLAH KEBUTUHAN'
    ]
    
    found = [d['jurusan'] for d in data if any(k in d['jurusan'].upper() for k in check_keywords)]
    
    print(f"Remaining junk entries: {len(found)}")
    if found:
        print("Samples of remaining junk:")
        for s in found[:5]:
            print(f"- {s}")
    else:
        print("All target junk patterns have been removed successfully.")

if __name__ == "__main__":
    verify()
