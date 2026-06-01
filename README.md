# Steve Luiting — Strategic Web Design

Modern professional website for Steve Luiting, strategic web designer focused on museums, nonprofits, and purpose-driven organizations in Colorado.

**Built as a clean, static, maintainable site** following the Tier 1 multi-file approach (no database required).

## What's Here

- `index.html` — Main site (hero, story, What I Bring, featured work, insights teaser, working contact form)
- `about.html` — Full dedicated About page with deep personal story and career highlights
- `blog.html` — Fully functional blog powered by `data/blog-posts.json` (search + filters + modal reader)
- `data/blog-posts.json` — 10 posts. Source of truth for all articles (very easy to maintain)
- `assets/` — Your images + the adaptive waterskiing video
- `DEPLOY.md` — Step-by-step Cloudflare Pages deployment guide

## Key Features

- **Zero database** — Everything is static files + client-side JavaScript
- **JSON-driven blog** — Add new posts by editing only the JSON file. Full-text search + category filtering + beautiful in-page reader
- **Uses your real assets** — Adaptive waterskiing video + images + profile photo
- **Content from steveknowswebdesign.com** — Core positioning and the powerful Cable Center / VR archive story
- **Design direction** — Clean white/neutral editorial aesthetic inspired by modern personal sites (e.g. mohamedshehata.net style) but without the orange accent

## Local Development (Windows)

```powershell
cd "D:\work\steveknowsweb"

# Option 1 - Quick
python -m http.server 8000

# Option 2 - Nicer
npx serve . -p 3000
```

Then open:
- http://localhost:8000 → New homepage
- http://localhost:8000/blog.html → The JSON-powered blog
- http://localhost:8000/about.html → About page

## How to Add a New Blog Post (Zero Friction)

1. Open `data/blog-posts.json`
2. Add a new object to the array following the existing structure
3. Save
4. Refresh `blog.html` — done

The blog supports rich HTML content in the `content` field.

## Deployment

This site is ready for:
- Cloudflare Pages (recommended)
- GitHub Pages
- Netlify
- Any static host

Connect the repo and it just works. Every push to main can trigger a new production deploy.

## Next Steps / Ideas

- Add more blog posts (just edit the JSON)
- Create individual static post pages later if desired
- Extract Tailwind to a real CSS file when you want to remove the CDN dependency
- Further case study pages (e.g. deeper waterskiing or VR archive treatment)

---

This site was rebuilt in one focused session as a demonstration of fast, high-quality vibe coding with no backend or database. All functionality is client-side and version-controllable.

   **Using VS Code Live Server extension** is also excellent.

## ✏️ Customization Guide

Everything you need to edit lives in `index.html`. The most important sections:

### 1. Personal Info (very top of `<body>`)
- Name, title, tagline, and hero description are in the **Hero** header section.
- Update the `steveknowsweb@gmail.com` and LinkedIn link in multiple places (easy to find via search).

### 2. About Section
- Replace the paragraphs under `#about`.

### 3. Skills
- The four skill category blocks are hardcoded for quick visual editing.

### 4. Projects (`projects` array in the `<script>`)
This is the most powerful part. The JavaScript array `projects` at the bottom of the file contains all the data:

```js
const projects = [ ... ];
```

Each project object supports:
- `title`, `role`, `year`, `short`
- `challenge`, `approach`
- `outcomes` array (3 metrics shown in the modal)
- `tools` array
- `liveUrl` (used by the "View live project" button)
- `visualColor` (controls the beautiful gradient in cards & modals)

Add, remove, or edit projects here. The grid and modals are rendered automatically.

### 5. Experience & Testimonials
- Hardcoded in HTML for simplicity. Easy to edit directly.
- Testimonials also power the carousel.

### 6. Contact Form
- Currently shows a success message after "sending".
- The "Email instead" button opens the user's mail client with pre-filled subject/body.
- To make the form actually send emails, connect it to Formspree, Netlify Forms, or your own backend.

### 7. Resume
- Clicking "Resume" opens a clean printable resume in a new tab and triggers print dialog.
- Replace the content inside the `downloadResume()` function with your real experience.

## 🎨 Design System Notes

- Built with Tailwind via the official Play CDN (`https://cdn.tailwindcss.com`)
- Primary accent color: `indigo-600` / `#6366f1`
- Dark elegant theme (`zinc-950`)
- Uses Inter + Playfair Display (loaded via Google Fonts)

To switch to a light theme or different accent, you only need to change a few Tailwind classes and the small custom CSS at the top.

## 📁 File Structure

```
my-portfolio/
├── index.html     ← The entire website
└── README.md
```

## 📌 Recommended Next Steps

1. Replace all placeholder projects with your real work.
2. Add 1–2 real case study links (or host PDFs).
3. Add a real headshot photo (replace the current abstract visual in the hero).
4. Connect the contact form to a real service.
5. Deploy it (Netlify, Vercel, or GitHub Pages are all free and perfect for this).

## 🚀 Making Updates Easy

There's a simple script included to make future updates fast:

1. Make your changes to the files
2. Open PowerShell and run:
   ```powershell
   cd "D:\my-portfolio"
   .\update-portfolio.ps1
   ```
3. Enter a short commit message when prompted

The script will automatically commit and push your changes. Your live site will update within 1-2 minutes.

---

## 💾 Saving & Resuming Work (Git)

This project is now saved as a Git repository on the `main` branch.

### Connecting to Your GitHub (stevel4857)

1. Create a new repository on GitHub under https://github.com/stevel4857 (suggested name: `portfolio`)
2. Run these commands to link and push:

```powershell
cd "D:\my-portfolio"
git remote add origin https://github.com/stevel4857/YOUR-REPO-NAME.git
git push -u origin main
```

### How to resume working on this project later:

1. Open PowerShell or Terminal
2. Navigate to the folder:
   ```powershell
   cd "D:\my-portfolio"
   ```
3. Check the current status:
   ```powershell
   git status
   ```
4. Continue making changes to the files (especially `index.html` and `3d-website.html`).
5. When you're ready to save a new version:
   ```powershell
   git add .
   git commit -m "Your message describing what you changed"
   ```

### Useful Git commands for future sessions:
- `git log` — See all saved versions
- `git diff` — See what you've changed since the last save
- `git checkout .` — Discard changes (use with caution)

---

## Need help?

This was built for you as a starting point. Want me to:
- Add more real projects?
- Change the entire color scheme or go light mode?
- Add a blog section, gallery, or pricing?
- Make the form actually email you?
- Turn this into a multi-page site?

Just tell me what you'd like next.

---

Made with care. Open the file and enjoy. 🚀