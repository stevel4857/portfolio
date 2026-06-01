# Steve Luiting — Strategic Web Design

Professional website for Steve Luiting, focused on museums, nonprofits, and purpose-driven organizations.

**Tech:** Static multi-file site (HTML + Tailwind CDN + vanilla JS)  
**Hosting:** Cloudflare Pages (connected to GitHub)  
**Collaboration:** Designed to support multiple humans + AI agents over time

## Current Structure

- `index.html` — Homepage
- `about.html` — About / Story
- `blog.html` — Blog (powered by JSON)
- `components/` — Reusable pieces (navigation, etc.)
- `scripts/` — Client-side JavaScript
- `data/` — Structured content (JSON)
- `assets/` — Images and video

We are gradually moving toward a more modular structure to support multiple humans and AI agents working in parallel.

## Key Patterns

- Blog content lives in `data/blog-posts.json` (preferred way to add/edit posts)
- Assets are in `assets/`
- Keep the clean, editorial, professional tone

## Local Development

```powershell
cd "D:\work\steveknowsweb"
python -m http.server 8000
# or
npx serve . -p 3000
```

## Collaboration Notes

See the following files for working with this site:

- `CONTRIBUTING.md` — Guidelines for humans
- `AGENTS.md` — Specific instructions for AI coding agents

These files exist because we expect multiple people (and AI agents) to work on the site in the future.

## Deployment

The site is deployed via Cloudflare Pages connected to the GitHub `portfolio` repository.

Every push to `main` triggers a production deployment.  
Every pull request gets an automatic preview URL from Cloudflare.

## Project Philosophy

This site follows a **Tier 1 Multi-file Static** approach (see original website workflow planning).

We keep things simple and maintainable while still allowing parallel work by humans and AI agents. We may evolve to a lightweight framework (likely Astro) later if the number of contributors or content velocity justifies it.

   **Using VS Code Live Server extension** is also excellent.

## Useful Files for Collaboration

- `CONTRIBUTING.md` — Guidelines for humans contributing
- `AGENTS.md` — Specific instructions for AI coding agents
- `DEPLOY.md` — Deployment information
- `update-site.ps1` + `Update Site.bat` — Helper scripts for committing changes

## Making Changes

1. Work on a feature branch.
2. Test locally.
3. Open a Pull Request (you'll get a Cloudflare preview URL automatically).
4. Merge to `main` once reviewed/approved.

See `CONTRIBUTING.md` and `AGENTS.md` for more detailed guidance.

---

This project is set up to support both human collaborators and AI agents working together over time.