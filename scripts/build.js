const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

console.log('--- Starting static portfolio build ---');

// Validate public directory exists
if (!fs.existsSync(publicDir)) {
  console.error('Error: public directory not found at', publicDir);
  process.exit(1);
}

// Essential files that must be present in public
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
    console.error(`Missing required asset: public/${relFile}`);
    hasErrors = true;
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log('✓ All essential static assets verified.');
console.log('✓ Static portfolio build successful and ready for Vercel deployment.');
