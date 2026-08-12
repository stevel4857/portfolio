import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const NIC_QUOTE =
  "Steve is one of the most inspired, innovative and forward thinking individuals I've ever had the pleasure of meeting or working with. Not only was Steve an innovator, but he was an excellent manager.";
const SUE_QUOTE =
  "Steve is a talented designer. He's smart, funny, inventive and basically a joy to have around. I have no reservations in recommending him to any potential employer.";
const NIC_EXCERPT =
  "One of the most inspired, innovative and forward thinking individuals I've ever had the pleasure of meeting or working with.";
const SUE_EXCERPT =
  "Steve is a talented designer. He's smart, funny, inventive and basically a joy to have around.";

test('testimonials.json exists and lists Jana, Nic, and Sue', () => {
  const data = JSON.parse(read('data/testimonials.json'));
  assert.equal(data.page.eyebrow, 'Testimonials');
  assert.equal(data.page.headline, 'People I’ve built with.');
  assert.match(data.page.intro, /Cable Center/);
  assert.deepEqual(
    data.people.map((p) => p.id),
    ['jana-henthorn', 'nic-van-dessel', 'susan-fey'],
  );
});

test('Jana is video-only with the Syndeo Vimeo id', () => {
  const jana = JSON.parse(read('data/testimonials.json')).people[0];
  assert.equal(jana.kind, 'video');
  assert.equal(jana.featured, true);
  assert.equal(jana.homepage, false);
  assert.equal(jana.quote, null);
  assert.equal(jana.video.provider, 'vimeo');
  assert.equal(jana.video.id, '1096427800');
  assert.equal(jana.video.hash, '05af90934b');
  assert.equal(jana.role, 'Former CEO, Syndeo Institute (The Cable Center)');
});

test('Nic and Sue quotes and homepage excerpts match the spec', () => {
  const people = JSON.parse(read('data/testimonials.json')).people;
  const nic = people.find((p) => p.id === 'nic-van-dessel');
  const sue = people.find((p) => p.id === 'susan-fey');
  assert.equal(nic.quote, NIC_QUOTE);
  assert.equal(nic.homepageExcerpt, NIC_EXCERPT);
  assert.equal(nic.homepage, true);
  assert.equal(nic.role, 'VR collaborator, The Cable Center');
  assert.equal(sue.quote, SUE_QUOTE);
  assert.equal(sue.homepageExcerpt, SUE_EXCERPT);
  assert.equal(sue.homepage, true);
  assert.equal(sue.role, 'Art Director, Wisconsin Public Television (retired)');
  assert.equal(sue.photo, '/assets/images/testimonials/sue-fey-circle.png');
});
