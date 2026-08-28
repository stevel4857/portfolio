import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');

function teaserBlock() {
  const start = html.indexOf('id="blog-teaser"');
  assert.ok(start > 0, 'homepage must include #blog-teaser');
  const slice = html.slice(start, start + 8000);
  return slice;
}

test('Latest from the workbench has three static post cards in the HTML', () => {
  const teaser = teaserBlock();
  assert.match(teaser, /A Birthday Card for Skoog/);
  assert.match(teaser, /A Matrix Birthday Card for Erin/);
  assert.match(teaser, /WordCut/);
  assert.match(teaser, /href="\/blog\/a-birthday-card-for-skoog"/);
  assert.match(teaser, /href="\/blog\/matrix-birthday-card-for-erin"/);
  assert.match(teaser, /href="\/blog\/wordcut-free-video-editor-for-windows"/);
  assert.match(teaser, /src="\/assets\/images\/skoog-birthday-card\/outside\.jpg"/);
  assert.match(teaser, /src="\/assets\/images\/matrix-birthday-erin\/folded\.jpg"/);
  assert.match(teaser, /src="\/assets\/images\/wordcut-blog-hero\.jpg"/);
});

test('homepage teaser is not rebuilt or erased by JS', () => {
  assert.doesNotMatch(html, /loadBlogTeaser/);
  assert.doesNotMatch(html, /Could not load latest posts/);
});
