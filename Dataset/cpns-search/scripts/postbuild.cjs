/**
 * postbuild.cjs
 * Setelah `vite build` selesai, script ini:
 * 1. Pindahkan semua file React app dari dist/ ke dist/app/
 * 2. Copy landing/index.html → dist/index.html (halaman root)
 * 3. Copy landing/logo.png → dist/logo.png
 */

const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', 'dist');
const APP_DIR = path.join(DIST, 'app');
const LANDING_DIR = path.resolve(__dirname, '..', 'landing');

// File/folder yang merupakan output Vite (React app)
const VITE_FILES = ['assets', 'pdfs', 'favicon-gen.html', 'favicon.svg', 'icons.svg', 'logo-web.png'];

// 1. Buat folder dist/app/
if (!fs.existsSync(APP_DIR)) fs.mkdirSync(APP_DIR, { recursive: true });

// 2. Pindahkan file Vite ke dist/app/
VITE_FILES.forEach(name => {
  const src = path.join(DIST, name);
  const dest = path.join(APP_DIR, name);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`  moved: dist/${name} → dist/app/${name}`);
  }
});

// 3. Pindahkan index.html Vite ke dist/app/index.html
const viteIndex = path.join(DIST, 'index.html');
const appIndex = path.join(APP_DIR, 'index.html');
if (fs.existsSync(viteIndex)) {
  // Baca index.html Vite dan fix path references dari /assets/ ke /app/assets/
  let content = fs.readFileSync(viteIndex, 'utf-8');
  // Path sudah mengandung /app/ prefix dari vite base config — tidak perlu ganti
  fs.renameSync(viteIndex, appIndex);
  console.log('  moved: dist/index.html → dist/app/index.html');
}

// 4. Copy landing page sebagai root index.html
fs.copyFileSync(path.join(LANDING_DIR, 'index.html'), path.join(DIST, 'index.html'));
fs.copyFileSync(path.join(LANDING_DIR, 'logo.png'), path.join(DIST, 'logo.png'));
console.log('  copied: landing/index.html → dist/index.html');
console.log('  copied: landing/logo.png → dist/logo.png');

console.log('\n✅ Post-build selesai!');
console.log('   / → dist/index.html (landing page)');
console.log('   /app → dist/app/index.html (React app)');
console.log('   /app/assets → dist/app/assets/');
