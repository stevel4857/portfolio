# Testimonials page — design spec

Date: 2026-08-12  
Status: Approved in conversation; awaiting Steve’s review of this file  
Site: steveknowsweb.com (`D:\work\steveknowsweb`)

## Problem

The old testimonials lived on steveknowswebdesign.com, which is gone. The current site has no public testimonials surface except Jana Henthorn’s Vimeo on the Syndeo case study. For a 90-day push toward museum/nonprofit work, visitors need named social proof on the homepage and a dedicated page they can share.

## Goal

Ship a public testimonials page plus a thin homepage strip. Three people only: Jana (real Vimeo), Nic and Sue (photo + recovered quote). End the page at contact.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| People in v1 | Jana Henthorn, Nic van Dessel, Susan Fey |
| Dave Cook | Out until a quote exists |
| Video | Real video only. No AI talking-head clips. No self-hosted MP4s |
| Jana media | Existing Vimeo `1096427800` / hash `05af90934b` (same as `work/syndeo.html`) |
| Jana quote text | None — video only. Do not invent the missing opening sentence |
| Nic / Sue quotes | Recovered wording from the old site (see Copy) |
| Shape | Featured video page + homepage strip (not equal three-up, not homepage-first) |
| Homepage strip | Nic + Sue excerpts, above Investment (`#pricing`) |
| Nav | Add **Testimonials** after Work |
| Syndeo page | Keep Jana’s Vimeo there. Reuse the same embed; do not remove it |

## Information architecture

- New page: `testimonials.html`
- Pretty URL: `/testimonials` via `_redirects` (`/testimonials.html` → `/testimonials` 301), same pattern as About
- In-site links (nav, homepage “See all”, footer if added) use **`/testimonials.html`**, matching `/about.html`, so local file servers work without Cloudflare redirects
- Nav (desktop and mobile), after Work: About · Work · **Testimonials** · Investment · Insights · Contact
- Homepage band immediately **above** the Investment section
- Testimonials page CTA: “Let’s talk” → `/#contact`
- Footer on the new page matches About (Home + Insights)

## Copy (publish as written)

### Page header

- Eyebrow: `Testimonials`
- Headline: `People I’ve built with.`
- Intro: `Colleagues from museums, public media, and the work at The Cable Center. A few words — and one conversation — about what it’s like to build together.`

### Jana Henthorn (featured, video only)

- Embed: `https://player.vimeo.com/video/1096427800?h=05af90934b`
- Iframe title: `Jana Henthorn on working with Steve Luiting` (same as Syndeo)
- Name: `Jana Henthorn`
- Role: `Former CEO, Syndeo Institute (The Cable Center)`
- No blockquote

### Nic van Dessel (quote + photo)

> Steve is one of the most inspired, innovative and forward thinking individuals I've ever had the pleasure of meeting or working with. Not only was Steve an innovator, but he was an excellent manager.

- Role: `VR collaborator, The Cable Center`

### Susan Fey (quote + photo)

> Steve is a talented designer. He's smart, funny, inventive and basically a joy to have around. I have no reservations in recommending him to any potential employer.

- Role: `Art Director, Wisconsin Public Television (retired)`

### Homepage strip

- Eyebrow: `What colleagues say`
- Nic excerpt: `One of the most inspired, innovative and forward thinking individuals I've ever had the pleasure of meeting or working with.`
- Nic credit: `Nic van Dessel · The Cable Center`
- Sue excerpt: `Steve is a talented designer. He's smart, funny, inventive and basically a joy to have around.`
- Sue credit: `Susan Fey · Wisconsin Public Television`
- Link: `See all testimonials →` → `/testimonials.html`

Do not “improve” quote wording. Apostrophes in headlines may use a typographic apostrophe (`I’ve`) to match the rest of the site. Quotes stay as recovered (including `I've` / `He's`).

## Visual design

Follow About / homepage. No new colors, fonts, or animation presets.

- Chrome: `data-component="nav"`, `max-w-6xl`, Inter + Playfair (`heading-serif`), slate palette, `data-motion-page` + existing stagger/settle presets
- Featured block: landscape Vimeo in `aspect-video`, black background, `rounded-2xl`, same iframe allow/referrer attributes as Syndeo
- Nic and Sue: two cards under the video (stack on small screens). Circle headshot (`rounded-full`, ~64–80px), quote, name, role
- Homepage strip: two compact cards in a light band (`bg-slate-50` / border), then the “See all” link. No video on the homepage
- CTA: existing dark rounded button style (“Let’s talk”), not a new button language

Jana does not need a headshot on the page. Video + name + role is enough.

## Photos

Already in the repo:

- `assets/images/testimonials/nic-van-dessel-circle.png`
- `assets/images/testimonials/jana-henthorn-circle.png` (unused on v1 page; keep in repo)
- Matching square JPGs exist beside the circle PNGs

Missing for v1:

- Crop Sue’s still from `D:\!Video-Grok\testimonials\SueFey.jpg` with the existing `scripts/make-testimonial-headshots.py` (or the same process) into:
  - `assets/images/testimonials/sue-fey-circle.png`
  - `assets/images/testimonials/sue-fey-square.jpg`
- Commit only those small images. Do not commit source video clips.

If the Python script only handles Jana/Nic today, extend it or run the same crop once. Output size should match the existing 512px headshots.

## Architecture

Static HTML site. No new framework, no JS-rendered empty shell.

| File | Role |
|------|------|
| `data/testimonials.json` | Agent-friendly source of truth: people, quotes, roles, video id, photo paths, `homepage: true/false`, `featured: true/false` |
| `testimonials.html` | Hand-authored public page. Content is in the HTML so it works without JavaScript |
| `index.html` | Homepage strip, static HTML, immediately above `#pricing` |
| `components/nav.html` | Add Testimonials link (desktop + mobile) |
| `_redirects` | `/testimonials.html` → `/testimonials` 301 |
| `sitemap.xml` | Add `https://steveknowsweb.com/testimonials` |
| `scripts/build-markdown.mjs` | Add testimonials to `CORE_PAGES` |
| `md/testimonials.md` | Generated twin; commit with the page |
| `llms.txt` | Regenerated by the markdown build |
| `docs/BUSINESS.md` | Note that the public page shipped; do not treat recovered quotes as unpublished anymore |

`testimonials.html` is the public source for humans and crawlers. `data/testimonials.json` is the source for agents and future edits. When copy changes, update **JSON and both HTML surfaces** in the same change.

### JSON shape

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

## Error handling and constraints

- Page must render with JS disabled (nav fetch already fails closed on other pages; body content must not depend on fetch)
- Do not load Nic/Sue videos or any file from `D:\!Video-Grok\` on the public site
- Do not add a CMS, form, or “submit a testimonial”
- If Sue’s source photo is missing on this machine at implementation time, stop and ask — do not ship a card without a real photo
- Keep feature-branch workflow. Production only from `main`

## Verification (required before merge)

1. Local HTTPS preview (`start-server.ps1` / existing workflow)
2. Desktop and mobile: nav + hamburger include Testimonials; link works from Home, About, and the new page
3. `/testimonials.html` works locally; `/testimonials` pretty URL works on the Pages preview (redirect)
4. Jana Vimeo plays on Testimonials and still plays on Syndeo
5. Nic and Sue photos load; quotes match this spec exactly
6. Homepage strip sits above Investment; “See all” goes to `/testimonials.html`
7. `npm run build:markdown` updates `md/testimonials.md`, sitemap, `llms.txt`
8. No new `.mp4` / large binaries in the commit
9. No new colors, fonts, or animation libraries

## Out of scope

- Dave Cook
- YouTube Short `shDjxnm-E4w` on this page
- AI-animated clips and any authenticity disclaimer (not used)
- Deeper Investment walkthrough
- Testimonials on About
- Changing Syndeo copy or removing its Vimeo
- Carousel, slider, or third-party review widget

## Implementation notes for the plan

- Branch: `feature/testimonials-page` (do not commit this feature to `main` directly)
- Keep the PR focused: testimonials page, homepage strip, nav, data file, Sue headshot, redirects/sitemap/markdown
- Leave unrelated dirty files on `main` (blog whitespace, voice test scripts, `update-site.ps1`) out of this PR
