import fs from 'fs';
import path from 'path';

const root = process.cwd();

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, results);
    else if (entry.name.endsWith('.html')) results.push(full);
  }
  return results;
}

function normalize(p) {
  return p.split(path.sep).join('/');
}

function resolveRef(htmlFile, ref) {
  const clean = ref.split('?')[0].split('#')[0];
  if (!clean.endsWith('.mp4')) return null;
  if (/^https?:\/\//i.test(clean)) return null;
  return normalize(path.resolve(path.dirname(htmlFile), clean));
}

const htmlFiles = walk(root);
const linked = new Set();

for (const htmlFile of htmlFiles) {
  const content = fs.readFileSync(htmlFile, 'utf8');
  const refs = content.match(/["'`][^"'`]*\.mp4[^"'`]*["'`]/gi) ?? [];
  for (const raw of refs) {
    const ref = raw.slice(1, -1);
    const resolved = resolveRef(htmlFile, ref);
    if (resolved) linked.add(resolved);
  }
}

const allMp4 = [];
function walkMp4(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkMp4(full);
    else if (entry.name.endsWith('.mp4')) allMp4.push(normalize(full));
  }
}
walkMp4(root);

const linkedList = allMp4.filter((f) => linked.has(f)).sort();
const unlinkedList = allMp4.filter((f) => !linked.has(f)).sort();

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ linked: linkedList, unlinked: unlinkedList }, null, 2));
} else {
  console.log('Linked MP4 files:');
  for (const file of linkedList) console.log(`  ${path.relative(root, file)}`);
  console.log('\nUnlinked MP4 files:');
  for (const file of unlinkedList) console.log(`  ${path.relative(root, file)}`);
}