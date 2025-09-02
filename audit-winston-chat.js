const fs = require('fs');
const path = require('path');

const root = process.cwd();
const dirsToCheck = [
  'pages',
  'app/components',
  'components',
  'lib',
  'hooks',
];

const requiredFiles = [
  ['.env.local', '.env.example'],
  'tailwind.config.js',
  'pages/api/chat.ts',
  ['app/components/ChatBox.tsx', 'components/ChatBox.tsx'],
  ['app/components/FloatingButton.tsx', 'components/FloatingButton.tsx'],
  ['app/lib/useSpeechToText.ts', 'hooks/useSpeechToText.ts'],
];

const mascotPath = path.join(root, 'public', 'winston-mascot.png');
const globalsCssPath = path.join(root, 'app', 'globals.css');
const tailwindConfigPath = path.join(root, 'tailwind.config.js');

function findFilesRecursive(dir, exts = ['.tsx', '.ts', '.js']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(findFilesRecursive(full, exts));
    } else if (exts.includes(path.extname(full))) {
      results.push(full);
    }
  }
  return results;
}

function checkDuplicates(files) {
  const lowerMap = {};
  for (const file of files) {
    const base = path.basename(file).toLowerCase();
    if (!lowerMap[base]) lowerMap[base] = [];
    lowerMap[base].push(file);
  }
  return Object.entries(lowerMap).filter(([_, arr]) => arr.length > 1);
}

function checkRequiredFiles() {
  return requiredFiles.map((item) => {
    if (Array.isArray(item)) {
      const found = item.find((f) => fs.existsSync(path.join(root, f)));
      return { files: item, found };
    } else {
      return { files: [item], found: fs.existsSync(path.join(root, item)) ? item : null };
    }
  });
}

function checkMascot() {
  return fs.existsSync(mascotPath);
}

function checkUnusedComponents() {
  const compDirs = ['app/components', 'components'];
  let comps = [];
  for (const dir of compDirs) {
    if (fs.existsSync(dir)) {
      comps = comps.concat(findFilesRecursive(dir, ['.tsx', '.js']));
    }
  }
  // Only check .tsx/.js files
  const used = new Set();
  const allFiles = findFilesRecursive(root, ['.tsx', '.ts', '.js']);
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    for (const comp of comps) {
      const compName = path.basename(comp, path.extname(comp));
      const regex = new RegExp(`\b${compName}\b`, 'g');
      if (regex.test(content) && file !== comp) {
        used.add(comp);
      }
    }
  }
  return comps.filter((c) => !used.has(c));
}

function checkTailwindInGlobals() {
  if (!fs.existsSync(globalsCssPath)) return false;
  const content = fs.readFileSync(globalsCssPath, 'utf8');
  return /@tailwind\s+base;/.test(content) && /@tailwind\s+components;/.test(content) && /@tailwind\s+utilities;/.test(content);
}

function printResult(label, ok, suggestion = '') {
  console.log(`${ok ? '✅' : '❌'} ${label}`);
  if (!ok && suggestion) {
    console.log('   Suggestion:', suggestion);
  }
}

console.log('--- Winston Chat Project Audit ---');

// 1. Duplicate files
let allFiles = [];
for (const dir of ['pages', 'app/components', 'components', 'lib']) {
  if (fs.existsSync(dir)) {
    allFiles = allFiles.concat(findFilesRecursive(dir));
  }
}
const dups = checkDuplicates(allFiles);
printResult('No duplicate files in pages/, components/, or lib/', dups.length === 0, dups.map(([name, arr]) => `Duplicates for ${name}:\n${arr.join('\n')}`).join('\n'));

// 2. Required files
const reqs = checkRequiredFiles();
for (const req of reqs) {
  printResult(
    `Required file: ${req.files.join(' or ')}`,
    !!req.found,
    `Add one of: ${req.files.join(', ')}`
  );
}

// 3. Mascot image
printResult('Mascot image at public/winston-mascot.png', checkMascot(), 'Add your mascot image to public/winston-mascot.png');

// 4. Unused components
const unused = checkUnusedComponents();
printResult('No unused components in components/ or app/components/', unused.length === 0, unused.length ? `Unused: ${unused.join(', ')}` : '');

// 5. Tailwind in globals.css
printResult('Tailwind is configured in app/globals.css', checkTailwindInGlobals(), 'Add @tailwind base; @tailwind components; @tailwind utilities; to app/globals.css');

console.log('--- Audit Complete ---'); 