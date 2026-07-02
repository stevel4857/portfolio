import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const watch = process.argv.includes('--watch');
const tailwindBin = path.join(
  root,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'tailwindcss.cmd' : 'tailwindcss'
);

const args = ['-i', './src/input.css', '-o', './css/tailwind.css'];
if (watch) {
  args.push('--watch');
} else {
  args.push('--minify');
}

process.env.BROWSERSLIST_IGNORE_OLD_DATA = '1';

const result = spawnSync(tailwindBin, args, {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);