---
title: "Vibe Coding This Site — and Adding Motion Without Losing the Plot"
description: "I watched a sharp video on vibe coding with Grok Build, then used the same workflow to add Lottie-style page animations to my static site — without migrating to React. Whisper, FFmpeg, and Pywebview are next on my radar."
canonical: "https://steveknowsweb.com/blog/vibe-coding-motion-and-the-tools-im-watching"
date: "2026-07-02"
author: "Steve Luiting"
category: "AI & Workflow"
tags: "Vibe Coding, AI, Motion, Workflow, Static Sites"
language: "en"
---
I ran across a video recently that put words to something I have been doing on this site for months without naming it properly: **vibe coding**.

The video compares Grok Build to Claude Code and OpenAI Codex — three different ways of telling an AI what you want and letting it do the implementation work. I do not think any one tool wins forever. But the *workflow* is real, and it is changing how solo builders like me ship.

Source video: [Grok Build vs Claude Code and ChatGPT Codex](https://www.youtube.com/watch?v=qbI40TfMgyM) — worth a watch if you are trying to pick a vibe-coding stack.

### What vibe coding actually means

Andrej Karpathy coined the term in early 2025. The short version: you describe the outcome you want — the *vibe* — and an AI agent writes most of the code. You steer, review, and correct. You do not necessarily read every line before you ship.

That sounds reckless until you have lived the other side of it. For years I was the only web person in the building. I already made big calls from partial information because there was no one else to ask. Vibe coding is not replacing judgment. It is compressing the gap between intention and implementation — if you keep guardrails.

On steveknowsweb.com, those guardrails are explicit: feature branches, small PRs, an `AGENTS.md` file, content in JSON instead of scattered HTML edits, and a static deploy path I trust (GitHub → Cloudflare Pages). I wrote about that collaboration model in [Working with Multiple AI Agents on a Static Website](https://steveknowsweb.com/blog/working-with-multiple-ai-agents-on-a-static-website). Vibe coding is the daily practice on top of that foundation.

### Vibe coding a static site (not a framework rewrite)

The tempting mistake is to let an agent talk you into a full migration every time you want something new. React! Next.js! Astro! Sometimes that is right. Often it is scope creep wearing a framework T-shirt.

This site is still **Tier 1 static**: multi-file HTML, Tailwind built with PostCSS, vanilla JavaScript, structured content in `data/`. That constraint is intentional. Museums and nonprofits I work with need sites that still make sense when the original team is gone. A vibe-coded rewrite into a SPA does not automatically serve that goal.

So when I wanted the site to feel more alive — page transitions, staggered hero entrances, portfolio cards that arrive with intention — I did not ask for a framework migration. I described the motion I wanted and let the agent add a **thin React + Motion layer** on top of the existing HTML, built with Vite, shipped as a single `js/motion-bundle.js` file.

That is vibe coding with adult supervision: name the feeling, accept a surgical dependency, keep the static site you already know how to maintain.

### What I added: Motion without Lottie files

I wanted animations that *felt* like Lottie — smooth enters, gentle loops, draw-on strokes — without importing heavyweight JSON animation files or rebuilding the site as a React app.

We used [Motion](https://motion.dev) (from motion.dev, formerly Framer Motion) plus a small set of named presets:

-   **Page transitions** — soft fade/slide between Home and About using `AnimatePresence`, with full page loads for complex pages like the blog (so existing JavaScript keeps working).
-   **Stagger reveals** — hero copy and portfolio cards on the homepage arrive in sequence instead of popping in all at once.
-   **Hash link fixes** — Work and Contact nav links had to keep scrolling to `#work` and `#contact` after Motion took over the page wrapper. Small detail. Easy to break. Worth getting right.
-   **Named presets** — `settle-up`, `float-gentle`, `pulse-ring`, `draw-line`, `shimmer`, `morph-blob`. Apply with `data-animate="preset-name"` on any element.
-   **Reduced motion** — every preset respects `prefers-reduced-motion`. Non-negotiable for public sites.

You can preview the whole catalog at [/demos/animations.html](https://steveknowsweb.com/demos/animations.html). Agents can read the machine-friendly list in `data/animation-presets.json`.

Requesting a new animation is now a sentence, not a sprint:

```
Animation request
- Target: hero eyebrow
- Trigger: on scroll into view
- Feel: Lottie-style soft float loop
- Reduced motion: disable loop
```

That is the payoff of vibe coding done well. The site keeps its static bones. The motion layer is documented, named, and repeatable.

### What I would tell another vibe coder

1.  **Describe outcomes, not stacks.** “Smooth page transitions and staggered hero” beats “install Motion” — the agent can choose the implementation if your constraints are clear.
2.  **Keep a human-readable rules file.** My `AGENTS.md` is the difference between a helpful collaborator and an enthusiastic demolition crew.
3.  **Commit built artifacts.** This project commits `css/tailwind.css` and `js/motion-bundle.js` so Cloudflare Pages does not need a fragile build step to match local preview.
4.  **Preview on HTTPS locally.** Motion and secure browser APIs pushed me to a local HTTPS dev server (mkcert). Boring infrastructure. Saves real debugging time.
5.  **Ship in slices.** Page transitions first. Hash links second. Preset gallery third. Vibe coding rewards small merges, same as human teamwork.

### The next tools on my bench: Whisper, FFmpeg, Pywebview

Animations were the front-of-house upgrade. The next vibe-coded experiments are back-of-house — and they connect to [Impact Studio](https://steveknowsweb.com/blog/impact-studio-a-builder-for-offline-work-and-real-publishing), the offline-first builder I am working on.

**Whisper** — OpenAI's speech-to-text model, runnable locally. I am looking at it for transcribing client interviews, oral-history clips, and rough voice notes into text I can edit, quote, and structure. For museum and archive work, that is not a gimmick. It is a practical path from audio to searchable content.

**FFmpeg** — the boring superpower. Trim, transcode, extract audio, generate poster frames, normalize formats before upload. Every video-heavy cultural site eventually needs a disciplined media pipeline. I would rather script FFmpeg once than click through five proprietary export dialogs.

**Pywebview** — a lightweight way to wrap a local web UI in a desktop shell using the system WebView. Tauri is still my likely home for Impact Studio, but Pywebview is attractive for smaller internal tools: a transcription bench that pairs Whisper + FFmpeg, or a local animation preview window that loads `demos/animations.html` without starting a full Electron stack.

None of that is live on steveknowsweb.com yet. But the pattern is the same as Motion: pick a real workflow pain, vibe-code a focused tool, document it, and keep the production site calm.

### Where I land on this

Vibe coding is not “AI writes your site while you nap.” It is closer to creative direction with a very fast junior team that never sleeps — and occasionally hallucinates a footer.

Used with constraints, it let me add polished motion to a static portfolio site in an afternoon-style sprint, without abandoning the architecture I chose for longevity. The site still deploys the way I trust. The new motion layer has names, docs, and a demo page. I can ask for the next preset in plain English.

If you are a solo designer, a small-shop developer, or the only web person at a mission-driven org, you do not need to pick Grok Build *or* Claude Code *or* Codex and treat it like a religion. You need a repo you control, rules agents can follow, and the willingness to say “keep it static” when the vibe is right but the framework rewrite is wrong.

I will keep documenting what ships — motion today, media tooling next.

*Related: [Working with Multiple AI Agents](https://steveknowsweb.com/blog/working-with-multiple-ai-agents-on-a-static-website), [Impact Studio](https://steveknowsweb.com/blog/impact-studio-a-builder-for-offline-work-and-real-publishing), [Animation preset gallery](https://steveknowsweb.com/demos/animations.html). Video: [YouTube — Grok Build vs Claude Code and Codex](https://www.youtube.com/watch?v=qbI40TfMgyM).*
