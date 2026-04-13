import json
import os

DATA_FILE = r'c:\Users\dhani\Documents\CPNS\Dataset\cpns-search\src\data.json'

def verify():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    perhubungan = [d for d in data if d['instansi'] == 'Kementerian Perhubungan']
    print(f"Total Perhubungan entries: {len(perhubungan)}")
    if perhubungan:
        print(f"Sample entry: {perhubungan[0]}")
    
    links = set(d['link_pdf'] for d in perhubungan)
    print(f"Unique links for Perhubungan: {links}")

if __name__ == "__main__":
    verify()
