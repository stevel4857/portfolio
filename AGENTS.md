# AGENTS.md — Instructions for AI Coding Agents

This file contains rules and context for AI agents (Grok, Claude, Cursor, etc.) working on steveknowsweb.com.

## Project Overview

- Professional website for Steve Luiting (strategic web designer).
- Target audience: Museums, nonprofits, and purpose-driven organizations.
- Tone: Professional, thoughtful, slightly understated, high-craft.
- Tech: Static HTML + Tailwind (CDN) + vanilla JavaScript. No build step required.

## Core Rules for AI Agents

1. **Always work in feature branches.** Never commit directly to `main`.
2. **Keep Pull Requests small and focused.** Ideal PRs touch 1–3 files and solve one clear problem. Large refactors that touch many files are strongly discouraged.
3. **Prefer editing `data/` files** over hardcoding content in HTML whenever possible.
4. **Respect the existing design system.** Do not introduce new colors, fonts, spacing scales, or major visual changes without explicit human approval.
5. **Test locally before opening a PR.** Always describe how to preview the change.
6. **Be explicit about trade-offs.** If your change increases complexity, maintenance burden, or coupling, say so clearly in the PR description.
7. **Never assume you have the full picture.** When in doubt, ask before making structural or content changes.

## File Responsibilities

| File                  | Purpose                              | AI Agent Guidance |
|-----------------------|--------------------------------------|-------------------|
| `index.html`          | Homepage                             | Major structural changes need human approval |
| `about.html`          | About / Story page                   | Be careful with personal narrative tone |
| `blog.html`           | Blog listing + modal reader          | Prefer editing `data/blog-posts.json` |
| `data/blog-posts.json`| Blog content                         | Primary place for new blog posts |
| `assets/`             | Images and videos                    | Do not optimize or rename without discussion |
| `CONTRIBUTING.md`     | Human contribution guidelines        | Update when collaboration patterns change |

## Working With Content

- When adding or editing blog posts, **always edit `data/blog-posts.json`**.
- Keep the writing style consistent with existing posts (practical, slightly reflective, no hype).
- Use real dates and accurate categories.

## Styling Rules

- We use Tailwind via CDN (`https://cdn.tailwindcss.com`).
- Primary text color: `text-slate-900` / near black.
- Accent color: Slate / neutral with very subtle indigo when needed.
- Do **not** add new custom CSS classes unless absolutely necessary.
- Keep the clean, spacious, editorial aesthetic.

## Branching & Pull Request Process (Mandatory for AI Agents)

- Create a new branch for every meaningful piece of work:
  - Good: `feature/update-hero-copy`, `fix/blog-search-bug`, `content/add-new-case-study`
  - Bad: `updates`, `ai-changes`, `wip`

- Keep branches short-lived.

- Open a Pull Request **as soon as you start work** (even as a draft). This gives you a Cloudflare preview URL immediately.

- PR titles should be clear and descriptive (not "Update files").

- In the PR description, always include:
  - What you changed and why
  - How to preview it locally
  - Screenshots or links to the Cloudflare preview when relevant
  - Any risks or follow-up work needed

- Do **not** request human review on every tiny change. Use your judgment. Large or risky changes should request review.

## When to Ask a Human

Ask before doing any of the following:
- Major structural changes to the site
- Adding or removing pages
- Changing the overall visual direction or design system
- Large content rewrites (especially on the About page)
- Introducing new dependencies or tools
- Anything that affects the custom domain or deployment

## Things AI Agents Should NOT Do

- Rewrite large portions of the site without explicit permission.
- Change the overall visual direction or typography.
- Introduce new frameworks or build tools without discussion.
- Delete or rename files in `assets/` without approval.
- Assume the site will stay a simple static site forever — but don’t force a migration to Astro/Next.js/etc. without discussion.

## Future Direction

This site is currently built as a **Tier 1 Multi-file Static** site (see original planning document).

We may evolve toward a lightweight framework (likely Astro) when the number of contributors or content updates justifies it. Do not start that migration on your own.

## Contact

For questions that aren't covered here, open a discussion or ask Steve directly before making large changes.
