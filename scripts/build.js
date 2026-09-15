const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

console.log('--- Starting static portfolio build ---');

// 1. Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 2. Helper to sync directories
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'public', 'functions', 'database', 'uploads'].includes(entry.name)) {
        copyDirSync(srcPath, destPath);
      }
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 3. Sync top-level HTML, SVG, and ICO files to public if present in root
const rootFiles = ['index.html', 'admin.html', 'login.html', 'favicon.ico', 'favicon.svg'];
for (const file of rootFiles) {
  const src = path.join(rootDir, file);
  const dest = path.join(publicDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

// 4. Sync assets, css, js directories
const syncDirs = ['css', 'js', 'assets'];
for (const dir of syncDirs) {
  const srcDir = path.join(rootDir, dir);
  const destDir = path.join(publicDir, dir);
  if (fs.existsSync(srcDir)) {
    copyDirSync(srcDir, destDir);
  }
}

// 5. Verify essential files exist in public output directory
const requiredFiles = [
  'index.html',
  'admin.html',
  'login.html',
  'favicon.ico',
  'favicon.svg',
  'css/style.css',
  'css/admin.css',
  'js/app.js',
  'js/script.js',
  'js/admin.js'
];

let hasErrors = false;
for (const relFile of requiredFiles) {
  const fullPath = path.join(publicDir, relFile);
  if (!fs.existsSync(fullPath)) {
    console.error(`Error: Missing required asset: public/${relFile}`);
    hasErrors = true;
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log('✓ Verified: public/index.html and all required assets present.');
console.log('✓ Static portfolio build successful and ready for Vercel deployment.');
