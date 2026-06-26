---
title: "Impact Studio: A Builder for Offline Work and Real Publishing"
description: "I am building Impact Studio — an offline-first visual builder with AI that works beside you in the editor and on a schedule. Same GitHub-to-Cloudflare publishing I already trust. Early code lives in a private GitHub repo."
canonical: "https://steveknowsweb.com/blog/impact-studio-a-builder-for-offline-work-and-real-publishing"
date: "2026-06-24"
author: "Steve Luiting"
category: "AI & Strategy"
tags: "AI, Strategy, Static Sites, Workflow, Product"
language: "en"
---
For years I have worked the way a lot of solo web people do: design in one place, export or hand-code in another, push to GitHub, and let Cloudflare Pages handle the live site. That loop works. I trust it.

![Flat illustrated graphic of a laptop with modular page blocks blooming into colorful shapes, a workspace file icon, and an arrow toward a cloud](https://steveknowsweb.com/assets/images/impact-studio-blog-hero.jpg)

*Impact Studio — build offline, publish when you are ready.*

What I have wanted for a long time is something that sits *inside* that loop instead of fighting it — a visual builder that respects offline work, keeps the site data in a file I actually own, syncs when I am online, and does not treat AI as a gimmick bolted onto the side.

I am calling the idea **Impact Studio**. It is still in the design phase. Nothing to download yet. But the thinking is far enough along that I wanted to write it down publicly — partly to clarify it for myself, and partly because I suspect other solo designers and small studios are circling the same problems.

### What it is (in plain language)

Impact Studio is meant to be a **desktop app** (Windows first, Mac later) plus a web companion. You download it, install it, and do your real work *inside* the application — not in a browser tab you might close by accident. You design and build pages in a drag-and-drop canvas inside the program — closer to DIVI or Webflow than to living in a code editor all day. You manage structured content (blog posts, products, team members), rich text, and a real media library from that same environment. Of course you can always go in and edit code when you need to, but you should not have to.

Behind the scenes, the app spins up a small server on your own machine so the preview is not a fake mock-up. Your work-in-progress site is essentially *hosted on your desktop* while you edit — real pages, real assets, served locally. What you see in the program is what you get when you publish. That is the kind of WYSIWYG I have always wanted and rarely gotten from browser-only builders.

Your live site does not change on every keystroke. It updates when **you** tell it to — hit Publish when you are ready — or when **your AI** tells it to, if you have set up a scheduled task and chosen to auto-apply or approve its suggestions first. That keeps the day-to-day editing calm while still letting automation handle the weekly SEO pass or blog draft when you want it.

Each site lives in a **workspace**: essentially a portable bundle with a SQLite database file, cached assets, and sync metadata. You can work offline on the train or at a museum with bad Wi‑Fi. When you reconnect, changes merge to the cloud so teammates see the same workspace.

That matters to me. I spent thirteen years as the only web person at a national institution. Offline-capable tools are not a nice-to-have when you are the entire department.

### Two kinds of AI — not one chat box

Most builder products are adding a single AI sidebar. I want two modes that share the same underlying rules:

1.  **Editor copilot** — you are in the canvas; the agent helps rewrite copy, adjust sections, or fill collection data. You preview changes before they apply. No silent edits to your layout.
2.  **Scheduled tasks** — the agent runs on a cron in the cloud. My first two templates are practical: a **weekly SEO pass** (meta titles, descriptions, thin content flags) and a **weekly blog draft** that lands in a review inbox Monday morning.

The agent never gets raw database access. It calls typed tools — the same operations the visual editor uses — so changes stay valid, undoable, and auditable. That is the difference between AI as a party trick and AI as something you can trust on a client site.

And you should not be locked into one vendor. If you already have a preferred AI — ChatGPT, Grok, Claude, or another you rely on — you can connect it and work with the assistant you already know. Prefer not to think about that? Use the built-in option powered by xAI and get started without extra setup.

### Publishing without losing the plot

Here is a distinction I care about a lot: the **product repository** and the **website repository** are not the same thing.

-   `impactstudio` (the app source) — where the software is built. Not deployed to Cloudflare as a public site.
-   Your site repo (e.g. a client or portfolio project) — static HTML, CSS, JS only. Cloudflare Pages watches *this* repo.

When you hit Publish, Impact Studio renders a static site and pushes to the connected GitHub repo — the same workflow I already use on steveknowsweb.com. Pre-built files, no build step on Cloudflare, push to `main`, live site updates. Preview branches for staging are on the roadmap.

I am deliberately not waiting for some future all-in-one hosting platform. GitHub plus Cloudflare is boring, portable, and mine.

### Who it is for

Solo creators who want a serious builder without enterprise pricing theater. Small studios (roughly one to ten people) who need shared workspaces, roles, and a review queue when the Monday SEO task suggests twelve meta description tweaks.

Museums and nonprofits are still my home turf. A tool that defaults to long-term ownership, clear exports, and calm publishing fits that world better than another rented platform.

### What is decided vs. what is not

**Decided:** Tauri for the desktop shell, React for the editor, SQLite locally, Postgres in the cloud, component-tree layouts (Puck-style JSON rather than messy HTML strings), free and paid tiers with scheduled AI on Pro.

**In progress:** the monorepo is on [GitHub](https://github.com/stevel4857/impactstudio) (private for now). Phase one — auth, workspaces, and a Tauri desktop shell with SQLite — is underway. Phase two has started with a WYSIWYG page builder, drag-and-drop, and inline text editing.

### Why I am sharing this now

I have been experimenting with AI agents as ongoing collaborators on this very site (see my earlier post on that workflow). Impact Studio is the logical next step: what if the *builder itself* were designed for offline work, human review, and the GitHub-to-Cloudflare path from day one?

I will post updates as the project moves from design to code. If you are a solo designer, a tiny studio, or a mission-driven org trying to escape zombie subscriptions and platform lock-in, I would genuinely like to hear what would make or break a tool like this for you.

For now it is an idea with a spec. But it is the most excited I have been about a personal product direction in a long time — because it combines everything I have learned about longevity, archives, AI guardrails, and static publishing into one coherent bet.

*Status: in development — June 2026. Source: [github.com/stevel4857/impactstudio](https://github.com/stevel4857/impactstudio)*
