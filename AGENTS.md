# AGENTS.md — Instructions for AI Coding Agents

This file contains rules and context for AI agents (Grok, Claude, Cursor, etc.) working on steveknowsweb.com.

## Project Overview

- Professional website for Steve Luiting (strategic web designer).
- Target audience: Museums, nonprofits, and purpose-driven organizations.
- Tone: Professional, thoughtful, slightly understated, high-craft.
- Tech: Static multi-file HTML + Tailwind CSS (built via PostCSS from `src/input.css` into committed `css/tailwind.css`) + vanilla JavaScript.

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
| `blog.html`           | Blog listing + modal reader          | Prefer editing `data/blog-posts.json`. Small `<head>` scripts or conditional JS for live demos in posts (e.g. Ruffle for Flash) are acceptable when needed to support content. |
| `data/blog-posts.json`| Blog content                         | Primary place for new blog posts |
| `assets/`             | Images and videos                    | Do not optimize or rename without discussion |
| `flash/`              | Legacy demo assets (e.g. SWF for blog) | Use relative paths like `flash/techlogo.swf` for demos. Commit demo files here when adding live examples. |
| `CONTRIBUTING.md`     | Human contribution guidelines        | Update when collaboration patterns change |

## Working With Content

- When adding or editing blog posts, **always edit `data/blog-posts.json`**.
- **Careful with JSON escaping**: Post content is a single large string. Any `"` inside the HTML must be escaped as `\"` (and `\` as `\\`). This is a common source of "Failed to load blog posts: SyntaxError: Expected ',' or '}' after property value in JSON" errors. After edits, validate the JSON (e.g. `node -e "JSON.parse(require('fs').readFileSync('data/blog-posts.json','utf8'))"`) or use a JSON linter before committing.
- After adding or editing posts, run `npm run build:markdown` (or `npm run build`) to regenerate `md/` twins, `blog/{slug}/` permalink pages, `llms.txt`, and `sitemap.xml`.
- For posts with live/interactive demos (e.g. the Flash resurrection post), include the demo markup in the JSON content and add any required script (e.g. Ruffle CDN) to `blog.html` `<head>` + init logic in the modal JS. The demo should be self-contained in the post.
- Keep the writing style consistent with existing posts (practical, slightly reflective, no hype).
- Use real dates and accurate categories.

## Styling Rules

- Tailwind is built via PostCSS (see `package.json`, `src/input.css`, `tailwind.config.js`, `postcss.config.js`).
- Run `npm run build` (or `npm run dev` for watch) to generate `css/tailwind.css`.
- The built CSS is committed and linked from the HTML files (no more CDN in production).
- Primary text color: `text-slate-900` / near black.
- Accent color: Slate / neutral with very subtle indigo when needed.
- Do **not** add new custom CSS classes unless absolutely necessary (add to `src/input.css` if needed).
- Keep the clean, spacious, editorial aesthetic.
- Update `start-server.ps1` / `update-site.ps1` and docs if build process changes.

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
- Introducing new dependencies or tools (small CDN scripts for live blog post demos are an exception when they directly support post content, e.g. Ruffle)
- Anything that affects the custom domain or deployment

## Things AI Agents Should NOT Do

- Rewrite large portions of the site without explicit permission.
- Change the overall visual direction or typography.
- Introduce new frameworks or build tools without discussion.
- Delete or rename files in `assets/` without approval.
- Assume the site will stay a simple static site forever — but don’t force a migration to Astro/Next.js/etc. without discussion.

## Cable Center VR Demo (`demos/cable-center-vr.html`)

A-Frame walkthrough of The Old Syndeo Institute/Cable Center with clickable 360° video spheres. Last fixed and pushed **2026-06-21** (`c604d96` on `stevel4857/portfolio`).

### Model loading (critical)

- **Use `scene.gltf`, not `scene.glb`.** GLB export failed to load reliably in the browser; glTF works with `a-asset-item` + `gltf-model`.
- Model path: `../assets/models/scene/scene.gltf` (also set in `BUILDING_MODEL` constant).
- Load via `<a-asset-item id="building" src="...">` and `<a-gltf-model src="#building">` — do **not** use `src:` directly on the entity.

### Colliders & grounding

- Collider meshes are named `COLLIDER_*` in the glTF (e.g. `COLLIDER_Floor`). `colliderSystem.refreshFromModel()` reads them at runtime.
- **No perimeter wall colliders** — they blocked the main entrance. Floor collider only; add interior `COLLIDER_Wall_*` meshes in Blender if needed.
- Blender pipeline scripts live in `scripts/` (e.g. `blender-add-colliders.py`, `blender-mesh-ground-levels.py`).
- `centerAndGroundModel()` centers the building and grounds it to the lowest thin landscape slab (`findLandscapeGroundY`), not sub-grade props.

### Locomotion & rendering gotchas

- Keyboard WASD uses `horizontalOnly: true` so camera pitch does not drift movement upward (`forward.y = 0`).
- **No `a-sky` in walkthrough mode** — it fights with `a-videosphere` (both inner-facing spheres). Use `background="color: #87CEEB"` on `<a-scene>` instead.
- During 360° video playback: hide walkthrough content, disable scene fog, set videosphere `renderOrder = 1`, use flat/back-side material.

### Local preview

```bash
cd steveknowsweb && python -m http.server 8765
# http://localhost:8765/demos/cable-center-vr.html
# Append ?debugColliders to visualize COLLIDER_* meshes
```

## Future Direction

This site is currently built as a **Tier 1 Multi-file Static** site (see the master planning document at `../docs/website-workflow-planning.md` when working in the combined workspace, or the original planning document).

We may evolve toward a lightweight framework (likely Astro) when the number of contributors or content updates justifies it. Do not start that migration on your own.

## Contact

For questions that aren't covered here, open a discussion or ask Steve directly before making large changes.
