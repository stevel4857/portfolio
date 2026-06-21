import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const baseUrl = process.env.CABLE_CENTER_URL || 'http://localhost:3000/demos/cable-center-vr.html';
const url = baseUrl;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', (msg) => {
  const text = msg.text();
  if (text.includes('Cable Center') || text.includes('grounded') || text.includes('error') || text.includes('Error')) {
    console.log('PAGE:', text);
  }
});
page.on('pageerror', (err) => console.log('PAGEERROR:', err.message));

await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForFunction(() => {
  const model = document.querySelector('#model');
  return model?.getAttribute('position')?.y > 0;
}, { timeout: 120000 });

const state = await page.evaluate(() => {
  const model = document.querySelector('#model');
  const player = document.querySelector('#player');
  const scene = document.querySelector('a-scene');
  const box = new THREE.Box3().setFromObject(model.object3D);
  const p = player.object3D.position;
  return {
    player: { x: p.x, y: p.y, z: p.z },
    modelAttr: model.getAttribute('position'),
    modelScale: model.getAttribute('scale'),
    modelWorld: { min: { x: box.min.x, y: box.min.y, z: box.min.z }, max: { x: box.max.x, y: box.max.y, z: box.max.z } },
    sceneLoaded: scene.hasLoaded,
    status: document.getElementById('status')?.textContent
  };
});

console.log(JSON.stringify(state, null, 2));
await browser.close();