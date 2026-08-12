# Testimonials Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public `/testimonials` page (Jana Vimeo + Nic and Sue quotes) and a homepage strip above Investment.

**Architecture:** Hand-authored static HTML like `about.html` so the page works without JavaScript. `data/testimonials.json` is the agent-friendly source of truth; keep JSON, `testimonials.html`, and the homepage strip in sync. Nav comes from `components/nav.html`. Markdown twin, sitemap, and `llms.txt` come from `scripts/build-markdown.mjs`.

**Tech Stack:** Static HTML, committed Tailwind (`css/tailwind.css`), vanilla JS nav loader, Node `node:test` for contract tests, existing Vimeo embed, Pillow script for Sue’s headshot.

**Spec:** `docs/superpowers/specs/2026-08-12-testimonials-page-design.md`  
**Branch:** `feature/testimonials-page` (already exists; spec commit `157c5d0`). Do not commit unrelated dirty files (blog whitespace, `.wrangler/`, voice test scripts, `update-site.ps1`).

---

## File map

| File | Responsibility |
|------|----------------|
| `scripts/test-testimonials.mjs` | Contract tests: JSON shape, published copy, HTML surfaces, nav, redirect, sitemap wiring, Sue photo |
| `package.json` | `npm test` runs that file via `node --test` |
| `data/testimonials.json` | Names, roles, quotes, Vimeo id, photo paths, homepage flags |
| `testimonials.html` | Public page (real HTML in the file, no JSON fetch for body) |
| `components/nav.html` | Desktop + mobile Testimonials link after Work |
| `index.html` | Homepage strip immediately above `#pricing` |
| `_redirects` | `/testimonials.html` → `/testimonials` 301 |
| `scripts/build-markdown.mjs` | `CORE_PAGES` + sitemap `staticUrls` entry |
| `md/testimonials.md`, `sitemap.xml`, `llms.txt` | Generated; commit with the page |
| `scripts/make-testimonial-headshots.py` | Add Sue crop (source already a tight headshot) |
| `assets/images/testimonials/sue-fey-circle.png` | 512px circle PNG |
| `assets/images/testimonials/sue-fey-square.jpg` | 512px square JPG |
| `docs/BUSINESS.md` | Mark the public page as shipped |

Do not add: self-hosted MP4s, AI clips, Dave, YouTube Short `shDjxnm-E4w`, new colors/fonts, a testimonials carousel.

---

### Task 1: JSON contract tests and `data/testimonials.json`

**Files:**
- Create: `scripts/test-testimonials.mjs`
- Modify: `package.json` (the `scripts.test` value)
- Create: `data/testimonials.json`

- [ ] **Step 1: Point `npm test` at a Node test file and write the failing JSON tests**

In `package.json`, change only the `test` script:

```json
"test": "node --test scripts/test-testimonials.mjs"
```

Create `scripts/test-testimonials.mjs`:

```js
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
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npm test`

Expected: FAIL. Typical first error is `ENOENT` for `data/testimonials.json` (file not found).

- [ ] **Step 3: Add `data/testimonials.json`**

Create `data/testimonials.json` with this exact content:

```json
{
  "page": {
    "eyebrow": "Testimonials",
    "headline": "People I’ve built with.",
    "intro": "Colleagues from museums, public media, and the work at The Cable Center. A few words — and one conversation — about what it’s like to build together."
  },
  "people": [
    {
      "id": "jana-henthorn",
      "name": "Jana Henthorn",
      "role": "Former CEO, Syndeo Institute (The Cable Center)",
      "kind": "video",
      "featured": true,
      "homepage": false,
      "quote": null,
      "video": {
        "provider": "vimeo",
        "id": "1096427800",
        "hash": "05af90934b",
        "title": "Jana Henthorn on working with Steve Luiting"
      },
      "photo": null
    },
    {
      "id": "nic-van-dessel",
      "name": "Nic van Dessel",
      "role": "VR collaborator, The Cable Center",
      "kind": "quote",
      "featured": false,
      "homepage": true,
      "homepageExcerpt": "One of the most inspired, innovative and forward thinking individuals I've ever had the pleasure of meeting or working with.",
      "homepageCredit": "Nic van Dessel · The Cable Center",
      "quote": "Steve is one of the most inspired, innovative and forward thinking individuals I've ever had the pleasure of meeting or working with. Not only was Steve an innovator, but he was an excellent manager.",
      "photo": "/assets/images/testimonials/nic-van-dessel-circle.png"
    },
    {
      "id": "susan-fey",
      "name": "Susan Fey",
      "role": "Art Director, Wisconsin Public Television (retired)",
      "kind": "quote",
      "featured": false,
      "homepage": true,
      "homepageExcerpt": "Steve is a talented designer. He's smart, funny, inventive and basically a joy to have around.",
      "homepageCredit": "Susan Fey · Wisconsin Public Television",
      "quote": "Steve is a talented designer. He's smart, funny, inventive and basically a joy to have around. I have no reservations in recommending him to any potential employer.",
      "photo": "/assets/images/testimonials/sue-fey-circle.png"
    }
  ]
}
```

Use a typographic apostrophe in `People I’ve built with.` (U+2019), matching the spec. Do not convert it to ASCII `'`.

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npm test`

Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add package.json scripts/test-testimonials.mjs data/testimonials.json
git commit -m "Add testimonials JSON and contract tests."
```

---

### Task 2: Surface tests, then the public HTML

**Files:**
- Modify: `scripts/test-testimonials.mjs` (append HTML/nav/redirect tests)
- Modify: `components/nav.html` (desktop lines 11–15, mobile lines 49–53)
- Create: `testimonials.html`
- Modify: `index.html` (insert a section immediately before `<!-- Pricing / Investment -->` at line 417)
- Modify: `_redirects` (after the `/about.html` line)
- Modify: `scripts/build-markdown.mjs` (`CORE_PAGES` and `buildSitemap` `staticUrls`)

- [ ] **Step 1: Add failing tests for the public surfaces**

Replace `scripts/test-testimonials.mjs` with this complete file (keep the Task 1 tests; add the new ones at the bottom):

```js
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
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

test('testimonials.html is real HTML with Jana video and both quotes', () => {
  const html = read('testimonials.html');
  assert.match(html, /<main[^>]*data-motion-page/);
  assert.match(html, /People I’ve built with/);
  assert.match(html, /player\.vimeo\.com\/video\/1096427800\?h=05af90934b/);
  assert.match(html, /Jana Henthorn on working with Steve Luiting/);
  assert.ok(html.includes(NIC_QUOTE));
  assert.ok(html.includes(SUE_QUOTE));
  assert.match(html, /href="\/#contact"/);
  assert.match(html, /Let's talk/);
  assert.doesNotMatch(html, /testimonials\.json/);
  assert.doesNotMatch(html, /shDjxnm-E4w/);
  assert.doesNotMatch(html, /never too busy/);
  assert.doesNotMatch(html, /pulling The Cable Center/);
});

test('nav lists Testimonials after Work on desktop and mobile', () => {
  const nav = read('components/nav.html');
  const desktop = nav.match(/hidden md:flex[\s\S]*?#contact/);
  const mobile = nav.match(/id="mobile-menu"[\s\S]*?#contact/);
  assert.ok(desktop);
  assert.ok(mobile);
  assert.match(desktop[0], /\/#work[\s\S]*\/testimonials\.html[\s\S]*\/#pricing/);
  assert.match(mobile[0], /\/#work[\s\S]*\/testimonials\.html[\s\S]*\/#pricing/);
});

test('homepage strip sits above Investment and uses the excerpts', () => {
  const html = read('index.html');
  const idxStrip = html.indexOf('What colleagues say');
  const idxPricing = html.indexOf('id="pricing"');
  assert.ok(idxStrip > 0);
  assert.ok(idxPricing > idxStrip);
  assert.ok(html.includes(NIC_EXCERPT));
  assert.ok(html.includes(SUE_EXCERPT));
  assert.match(html, /See all testimonials/);
  assert.match(html, /href="\/testimonials\.html"/);
});

test('pretty URL redirect and markdown build include testimonials', () => {
  const redirects = read('_redirects');
  assert.match(redirects, /\/testimonials\.html\s+\/testimonials\s+301/);
  const builder = read('scripts/build-markdown.mjs');
  assert.match(builder, /html: 'testimonials\.html'/);
  assert.match(builder, /loc: '\/testimonials'/);
});
```

- [ ] **Step 2: Run tests and confirm the new ones fail**

Run: `npm test`

Expected: FAIL on `testimonials.html` (`ENOENT`) or the first missing assertion. The three JSON tests still pass.

- [ ] **Step 3: Add Testimonials to the nav**

In `components/nav.html`, desktop block, insert the Testimonials link **after** Work and **before** Investment:

```html
        <a href="/about.html" class="nav-link text-slate-600 hover:text-slate-900 transition">About</a>
        <a href="/#work" class="nav-link text-slate-600 hover:text-slate-900 transition">Work</a>
        <a href="/testimonials.html" class="nav-link text-slate-600 hover:text-slate-900 transition">Testimonials</a>
        <a href="/#pricing" class="nav-link text-slate-600 hover:text-slate-900 transition">Investment</a>
        <a href="/blog/" class="nav-link text-slate-600 hover:text-slate-900 transition">Insights</a>
        <a href="/#contact" class="nav-link text-slate-600 hover:text-slate-900 transition">Contact</a>
```

Mobile menu, same order:

```html
        <a href="/about.html" class="py-3 text-slate-700 hover:text-slate-900 transition border-b border-slate-200 last:border-0" role="menuitem">About</a>
        <a href="/#work" class="py-3 text-slate-700 hover:text-slate-900 transition border-b border-slate-200 last:border-0" role="menuitem">Work</a>
        <a href="/testimonials.html" class="py-3 text-slate-700 hover:text-slate-900 transition border-b border-slate-200 last:border-0" role="menuitem">Testimonials</a>
        <a href="/#pricing" class="py-3 text-slate-700 hover:text-slate-900 transition border-b border-slate-200 last:border-0" role="menuitem">Investment</a>
        <a href="/blog/" class="py-3 text-slate-700 hover:text-slate-900 transition border-b border-slate-200 last:border-0" role="menuitem">Insights</a>
        <a href="/#contact" class="py-3 text-slate-700 hover:text-slate-900 transition border-b border-slate-200 last:border-0" role="menuitem">Contact</a>
```

Do not restyle the nav. Do not add a current-page highlight.

- [ ] **Step 4: Create `testimonials.html`**

Create `testimonials.html` as a sibling of `about.html`. Use this complete file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="What colleagues say about working with Steve Luiting — museums, public media, and The Cable Center.">
  <title>Testimonials — Steve Luiting | Denver</title>
  <link rel="icon" type="image/png" sizes="32x32" href="assets/images/steveknowswebdesign-favicon.png">
  <link rel="canonical" href="https://steveknowsweb.com/testimonials">
  <link rel="alternate" type="text/markdown" href="/md/testimonials.md">

  <link rel="stylesheet" href="css/tailwind.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&amp;family=Playfair+Display:wght@700&amp;display=swap');

    body {
      font-family: "Inter", system_ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
  </style>
</head>
<body class="bg-white text-slate-900">

  <div data-component="nav"></div>

  <main data-motion-page>

  <header class="max-w-6xl mx-auto px-6 pt-16 pb-12">
    <div class="max-w-3xl">
      <div data-stagger-item class="uppercase tracking-[3px] text-xs font-semibold text-slate-500 mb-4">Testimonials</div>
      <h1 data-stagger-item class="heading-serif text-6xl md:text-7xl leading-none tracking-[-2.5px]">People I’ve built with.</h1>
      <p data-stagger-item class="mt-8 text-xl leading-relaxed text-slate-700">
        Colleagues from museums, public media, and the work at The Cable Center. A few words — and one conversation — about what it’s like to build together.
      </p>
    </div>
  </header>

  <section class="max-w-6xl mx-auto px-6 pb-16">
    <div data-stagger-item class="aspect-video bg-black rounded-2xl overflow-hidden">
      <iframe
        title="Jana Henthorn on working with Steve Luiting"
        src="https://player.vimeo.com/video/1096427800?h=05af90934b"
        width="100%"
        height="100%"
        frameborder="0"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
        allowfullscreen>
      </iframe>
    </div>
    <p data-stagger-item class="mt-4 text-sm text-slate-600">
      <span class="font-semibold text-slate-900">Jana Henthorn</span>
      <span class="text-slate-400"> · </span>
      Former CEO, Syndeo Institute (The Cable Center)
    </p>
  </section>

  <section class="bg-slate-50 py-16">
    <div class="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-6">
      <article data-stagger-item class="bg-white border border-slate-200 rounded-3xl p-8">
        <div class="flex items-center gap-x-4 mb-6">
          <img
            src="assets/images/testimonials/nic-van-dessel-circle.png"
            alt="Nic van Dessel"
            class="w-16 h-16 rounded-full object-cover ring-1 ring-slate-200">
          <div>
            <div class="font-semibold text-slate-900">Nic van Dessel</div>
            <div class="text-sm text-slate-500">VR collaborator, The Cable Center</div>
          </div>
        </div>
        <blockquote class="text-[15.2px] leading-relaxed text-slate-700">
          Steve is one of the most inspired, innovative and forward thinking individuals I've ever had the pleasure of meeting or working with. Not only was Steve an innovator, but he was an excellent manager.
        </blockquote>
      </article>

      <article data-stagger-item class="bg-white border border-slate-200 rounded-3xl p-8">
        <div class="flex items-center gap-x-4 mb-6">
          <img
            src="assets/images/testimonials/sue-fey-circle.png"
            alt="Susan Fey"
            class="w-16 h-16 rounded-full object-cover ring-1 ring-slate-200">
          <div>
            <div class="font-semibold text-slate-900">Susan Fey</div>
            <div class="text-sm text-slate-500">Art Director, Wisconsin Public Television (retired)</div>
          </div>
        </div>
        <blockquote class="text-[15.2px] leading-relaxed text-slate-700">
          Steve is a talented designer. He's smart, funny, inventive and basically a joy to have around. I have no reservations in recommending him to any potential employer.
        </blockquote>
      </article>
    </div>
  </section>

  <section class="bg-slate-950 text-white py-16">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h2 class="heading-serif text-4xl tracking-tight">If this way of working resonates with you, let's talk.</h2>
      <p class="mt-4 max-w-md mx-auto text-slate-300">I work best with museums, historical organizations, and purpose-driven groups who care about getting it right for the long haul.</p>
      <div class="mt-8">
        <a href="/#contact" class="inline-flex items-center justify-center px-8 h-12 rounded-2xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition">
          Let's talk
        </a>
      </div>
    </div>
  </section>

  </main>

  <footer class="border-t border-slate-100 py-8">
    <div class="max-w-6xl mx-auto px-6 text-sm text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-y-2">
      <div>© Steve Luiting. All rights reserved.</div>
      <div class="flex gap-x-5">
        <a href="/" class="hover:text-slate-700">Home</a>
        <a href="blog.html" class="hover:text-slate-700">Insights</a>
      </div>
    </div>
  </footer>

  <script src="scripts/components.js"></script>
  <script type="module" src="/js/motion-bundle.js"></script>
</body>
</html>
```

- [ ] **Step 5: Add the homepage strip above Investment**

In `index.html`, immediately **before** `<!-- Pricing / Investment -->`, insert:

```html
  <!-- Testimonials strip -->
  <section class="max-w-6xl mx-auto px-6 pb-16" aria-labelledby="home-testimonials-heading">
    <div class="rounded-3xl bg-slate-50 border border-slate-100 px-8 py-10 md:p-12">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-y-4 mb-8">
        <div>
          <div class="uppercase tracking-[3px] text-xs font-semibold text-slate-500">What colleagues say</div>
          <h2 id="home-testimonials-heading" class="heading-serif text-4xl tracking-tighter mt-2">People I’ve built with.</h2>
        </div>
        <a href="/testimonials.html"
           class="inline-flex items-center gap-x-2 font-semibold text-lg group">
          See all testimonials
          <span class="group-hover:translate-x-0.5 transition">→</span>
        </a>
      </div>
      <div class="grid md:grid-cols-2 gap-5">
        <blockquote class="bg-white border border-slate-200 rounded-2xl p-6">
          <p class="text-[15.2px] leading-relaxed text-slate-700">One of the most inspired, innovative and forward thinking individuals I've ever had the pleasure of meeting or working with.</p>
          <footer class="mt-4 text-sm text-slate-500"><span class="font-semibold text-slate-900">Nic van Dessel</span> · The Cable Center</footer>
        </blockquote>
        <blockquote class="bg-white border border-slate-200 rounded-2xl p-6">
          <p class="text-[15.2px] leading-relaxed text-slate-700">Steve is a talented designer. He's smart, funny, inventive and basically a joy to have around.</p>
          <footer class="mt-4 text-sm text-slate-500"><span class="font-semibold text-slate-900">Susan Fey</span> · Wisconsin Public Television</footer>
        </blockquote>
      </div>
    </div>
  </section>

```

Do not move `#pricing`. Do not put a video on the homepage.

- [ ] **Step 6: Wire pretty URL, markdown twin, and sitemap**

In `_redirects`, add this line immediately after `/about.html /about 301`:

```
/testimonials.html /testimonials 301
```

In `scripts/build-markdown.mjs`, add this object to `CORE_PAGES` after the About entry:

```js
  { html: 'testimonials.html', md: 'testimonials.md', canonical: '/testimonials', pageDir: '' },
```

In `buildSitemap`, add this object to `staticUrls` after the About entry:

```js
    { loc: '/testimonials', changefreq: 'monthly', priority: '0.8' },
```

- [ ] **Step 7: Run contract tests, then generate markdown**

Run: `npm test`

Expected: PASS, 6 tests.

Run: `npm run build:markdown`

Expected: log includes `md/testimonials.md` and `sitemap.xml`. Open `sitemap.xml` and confirm a `<loc>https://steveknowsweb.com/testimonials</loc>` row. Open `llms.txt` and confirm a Testimonials page link.

- [ ] **Step 8: Commit the page and generated twins**

```bash
git add scripts/test-testimonials.mjs components/nav.html testimonials.html index.html _redirects scripts/build-markdown.mjs md/testimonials.md md/index.md sitemap.xml llms.txt
git commit -m "Add testimonials page, homepage strip, and nav link."
```

If `build:markdown` also rewrote unrelated `md/blog/*` or `blog/*/index.html` with only whitespace, **do not** stage those. Stage only files this feature needs. `md/index.md` should be staged if the homepage strip appears in the generated twin.

---

### Task 3: Sue Fey headshot

**Files:**
- Modify: `scripts/test-testimonials.mjs`
- Modify: `scripts/make-testimonial-headshots.py`
- Create: `assets/images/testimonials/sue-fey-circle.png`
- Create: `assets/images/testimonials/sue-fey-square.jpg`

Source photo exists: `D:\!Video-Grok\testimonials\SueFey.jpg` (already a tight headshot). If that file is missing, **stop and ask** — do not ship a placeholder.

- [ ] **Step 1: Add a failing photo test**

Append this test to `scripts/test-testimonials.mjs`. `existsSync` is already imported from `node:fs` at the top of the file.

```js
test('Sue and Nic circle headshots are committed and small', () => {
  const nic = join(ROOT, 'assets/images/testimonials/nic-van-dessel-circle.png');
  const sue = join(ROOT, 'assets/images/testimonials/sue-fey-circle.png');
  assert.equal(existsSync(nic), true);
  assert.equal(existsSync(sue), true);
  assert.ok(readFileSync(sue).length > 1000);
  assert.ok(readFileSync(sue).length < 500_000);
});
```

- [ ] **Step 2: Run the photo test and confirm it fails**

Run: `npm test`

Expected: FAIL. `existsSync(sue)` is `false` (Sue files are not in the repo yet). Nic should already pass.

- [ ] **Step 3: Extend the headshot script and generate Sue’s files**

In `scripts/make-testimonial-headshots.py`, after the Jana box setup and before `jobs = [`, add:

```python
    # Sue — source is already a tight smiling headshot; use the full frame.
    sue = Image.open(SRC / "SueFey.jpg")
    sw, sh = sue.size
    print(f"sue: {sw}x{sh}")
    sue_box = clamp_box((0, 0, sw, sh), sw, sh)
    print(f"sue_box: {sue_box}")
```

Change `jobs` to:

```python
    jobs = [
        ("nic-van-dessel", nic, nic_box),
        ("jana-henthorn", jana, jana_box),
        ("sue-fey", sue, sue_box),
    ]
```

Run (from the repo root, Python with Pillow):

```bash
python scripts/make-testimonial-headshots.py
```

Expected: stdout includes `sue:` dimensions, `wrote ...\sue-fey-circle.png`, and `wrote ...\sue-fey-square.jpg`.

If the crop looks wrong (cut-off chin or too much Christmas tree), stop and tighten `sue_box` before committing. Do not commit `sue-fey-preview.png` unless you want a local preview; the spec only requires circle + square. Prefer **not** committing preview PNGs.

- [ ] **Step 4: Re-run tests**

Run: `npm test`

Expected: PASS, including the photo test.

- [ ] **Step 5: Commit**

```bash
git add scripts/test-testimonials.mjs scripts/make-testimonial-headshots.py assets/images/testimonials/sue-fey-circle.png assets/images/testimonials/sue-fey-square.jpg assets/images/testimonials/nic-van-dessel-circle.png assets/images/testimonials/nic-van-dessel-square.jpg assets/images/testimonials/jana-henthorn-circle.png assets/images/testimonials/jana-henthorn-square.jpg
git commit -m "Add testimonial headshots including Sue Fey."
```

Jana/Nic images are already on disk as untracked files. Include them in this commit so the page’s Nic photo is in git. Skip `*-preview.png` and any `.mp4`.

---

### Task 4: Mark the page shipped in `docs/BUSINESS.md`

**Files:**
- Modify: `docs/BUSINESS.md` (site/product notes + testimonials header)

- [ ] **Step 1: Update the business notes**

Replace this bullet:

```markdown
- Testimonials stronger on older domain — pull onto main site when improving conversion
```

with:

```markdown
- Testimonials page shipped (2026-08): `/testimonials` — Jana Vimeo + Nic/Sue quotes; homepage strip above `#pricing`
```

At the top of `## Testimonials recovered from old site (2026-07-26)`, add:

```markdown
**Public page:** Live copy is `data/testimonials.json` + `testimonials.html`. Jana is video-only. Nic and Sue quotes below were approved for publish (2026-08-12). Dave Cook still unpublished (no quote).
```

Leave the recovered-quote archive in the file. Do not delete Dave’s notes.

- [ ] **Step 2: Commit**

```bash
git add docs/BUSINESS.md
git commit -m "Note shipped testimonials page in business docs."
```

---

### Task 5: Manual verification (required before PR)

**Files:** none (preview only)

- [ ] **Step 1: Start the local HTTPS server**

From `D:\work\steveknowsweb`:

```bash
.\start-server.ps1
```

Expected: server on port 3000 (HTTPS). Open `https://localhost:3000/testimonials.html`.

- [ ] **Step 2: Walk the checklist**

1. Page loads with headline **People I’ve built with.**
2. Jana Vimeo plays.
3. Nic and Sue photos load; quotes match the spec (including Sue’s “potential employer” line).
4. **Let’s talk** goes to `/#contact`.
5. Desktop nav: Testimonials after Work. Mobile hamburger too.
6. Homepage: strip is **above** Investment; **See all testimonials →** opens the page.
7. `https://localhost:3000/about.html` still looks right (nav only change).
8. Syndeo (`work/syndeo.html`) still has Jana’s Vimeo.
9. No new colors, fonts, or MP4s in `git status`.

If Cloudflare Pages preview is available after push, also confirm `/testimonials` (no `.html`) redirects.

- [ ] **Step 3: Do not merge to `main` from this plan**

Open a PR from `feature/testimonials-page` when the checklist is green. Production deploys only from `main`.

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| Jana, Nic, Sue only; Dave out | Task 1 JSON + Task 2 HTML |
| Real Vimeo only; no AI / no MP4 | Task 2 tests forbid YouTube Short + JSON fetch; Task 3 no MP4 |
| Jana video-only; no invented quote | Task 2 `doesNotMatch` recovered fragment |
| Featured page + homepage strip | Task 2 |
| Nav after Work; links `/testimonials.html` | Task 2 |
| Pretty URL + sitemap + md twin | Task 2 `build-markdown` + `_redirects` |
| Sue headshot from local source | Task 3 |
| BUSINESS.md note | Task 4 |
| Manual HTTPS / nav / Syndeo check | Task 5 |
| Feature branch; no unrelated files | Header + every commit step |
