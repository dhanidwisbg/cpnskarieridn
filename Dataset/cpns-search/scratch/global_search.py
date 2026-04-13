import os

KEYWORDS = ['USAHA NO NAMA', 'NO NAMA JABATAN', 'UNIT PENEMPATAN']

def search_files():
    for root, dirs, files in os.walk(r'c:\Users\dhani\Documents\CPNS\Dataset\cpns-search'):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
            
        for file in files:
            if file.endswith(('.json', '.js', '.jsx', '.html', '.cjs')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read().upper()
                        for k in KEYWORDS:
                            if k in content:
                                print(f"Found '{k}' in: {path}")
                                break
                except:
                    pass

if __name__ == "__main__":
    search_files()
