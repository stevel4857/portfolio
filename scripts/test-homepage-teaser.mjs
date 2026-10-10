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
  assert.match(teaser, /The Making of Nomad Pet Dental/);
  assert.match(teaser, /I Was Asked to Fix Their Site/);
  assert.match(teaser, /A Birthday Card for Skoog/);
  assert.match(teaser, /href="\/blog\/the-making-of-nomad-pet-dental"/);
  assert.match(teaser, /href="\/blog\/wheelers-phcc-redesign-from-broken-wordpress"/);
  assert.match(teaser, /href="\/blog\/a-birthday-card-for-skoog"/);
  assert.match(teaser, /src="\/assets\/images\/nomad-pet-dental\/home-desktop\.jpg"/);
  assert.match(teaser, /src="\/assets\/images\/wheelers-phcc-redesign\/new-homepage\.png"/);
  assert.match(teaser, /src="\/assets\/images\/skoog-birthday-card\/outside\.jpg"/);
  assert.equal((teaser.match(/href="\/blog\//g) || []).length >= 3, true);
});

test('homepage teaser is not rebuilt or erased by JS', () => {
  assert.doesNotMatch(html, /loadBlogTeaser/);
  assert.doesNotMatch(html, /Could not load latest posts/);
});
