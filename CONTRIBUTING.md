# Contributing to steveknowsweb.com

This site is built as a clean, static, multi-file website. The goal is to keep it maintainable even when multiple humans and AI agents are working on it.

## Core Principles

- **GitHub is the source of truth.** All changes go through Git + Pull Requests.
- **Prefer small, focused changes.** Large refactors that touch many files at once are hard to review.
- **Content vs Code separation.** When possible, put content in `data/` (JSON) instead of hardcoding it in HTML.
- **Preview everything.** Every pull request gets a Cloudflare preview URL. Use it.

## How to Make Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-change-name
   ```

2. Make your changes.

3. If you edited any CSS or `src/input.css`, run the Tailwind build:
   ```powershell
   cd "D:\work\steveknowsweb"
   npm run build
   ```
   (The `start-server.ps1` / `Update Site.bat` scripts run this automatically when Node.js is available.)

   Then preview locally:
   ```powershell
   python -m http.server 8000
   # or
   npx serve . -p 3000
   ```

4. Open a Pull Request early (even as a draft). This gives you a preview URL automatically.

5. Request review (from a human or describe what you want an AI agent to check).

6. Merge to `main` only after the preview looks good.

## Folder Structure

```
steveknowsweb/
├── index.html          # Homepage
├── about.html          # About page
├── blog.html           # Blog listing + reader
├── data/               # Structured content (JSON)
│   └── blog-posts.json
├── assets/             # Images, videos, fonts
├── README.md
├── CONTRIBUTING.md
└── AGENTS.md           # Instructions for AI agents
```

## Working With the Blog

The blog is powered entirely by `data/blog-posts.json`.  
**Preferred way** to add or edit blog content is by editing this file.

Do **not** create new standalone `.html` files for individual blog posts unless we decide to move to a more advanced system later.

## Style & Quality Guidelines

- Keep the clean, editorial, professional tone.
- Use the existing Tailwind classes and design system.
- New components should be reasonably reusable.
- Prefer semantic HTML.

## AI Agent Guidelines

See `AGENTS.md` for specific instructions when working with AI coding agents.

## Questions?

Open an issue or discussion in the repo, or reach out directly.
