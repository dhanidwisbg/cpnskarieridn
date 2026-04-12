import json
import re
from pypdf import PdfReader

PDF_PATH = 'kemenkes.pdf'

def sample_pdf():
    reader = PdfReader(PDF_PATH)
    num_pages = len(reader.pages)
    print(f"Total Pages: {num_pages}")
    
    # Sample every 20 pages to get a feel for the structure
    for i in range(0, num_pages, 20):
        print(f"\n--- Page {i} ---")
        text = reader.pages[i].extract_text()
        print(text[:1000])

if __name__ == "__main__":
    sample_pdf()
