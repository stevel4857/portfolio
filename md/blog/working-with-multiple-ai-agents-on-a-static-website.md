---
title: "Working with Multiple AI Agents on a Static Website"
description: "I'm experimenting with treating AI agents as ongoing collaborators on my website — not just one-off tools. Here's what that actually looks like right now."
canonical: "https://steveknowsweb.com/blog/working-with-multiple-ai-agents-on-a-static-website"
date: "2026-06-10"
author: "Steve Luiting"
category: "AI & Workflow"
tags: "AI, Workflow, Collaboration, Static Sites"
language: "en"
---
For the last couple of months I’ve been deliberately trying something new: treating AI agents as regular collaborators on my website instead of just one-off tools.

I’ve been working with Grok (and occasionally Claude) on steveknowsweb.com in a more structured way than before. Not just “write this section for me,” but actual ongoing work — refactoring parts of the site, improving the contact form, setting up better local development tooling, and building out documentation so that multiple agents (and eventually other humans) can work on the same codebase without everything turning into chaos.

### Why I’m doing this

I’ve spent most of my career being the only technical person on projects. That gave me a very strong sense of ownership, but it also meant I got very good at building things that were easy for *me* to maintain. Now I’m looking ahead and realizing that the way I’ll be working in the next few years will probably involve multiple AI agents + occasional human help.

If that’s the case, I need the site to be structured in a way that supports that reality instead of fighting it.

### Current approach

Right now the site is still a simple static site (plain HTML, Tailwind via CDN, and vanilla JavaScript). I’m deliberately not rushing into a framework like Astro or Eleventy yet. Instead I’m focusing on three things:

1.  **Clear rules for AI agents.** I created an `AGENTS.md` file that spells out how agents should work on the site — branching strategy, pull request expectations, what they’re allowed to change without asking, and what they should never touch. This has already made the process much cleaner.
2.  **Better structure for parallel work.** I’ve started pulling the site apart into components (starting with the navigation) and separating content into data files. The goal is to reduce the chance of two agents (or an agent and me) stepping on each other.
3.  **Proper collaboration tooling.** Even though I’m solo right now, I’m treating the project as if multiple people are working on it. GitHub for version control and reviews, Cloudflare Pages for automatic previews on every branch, and documented processes for how work should move from idea to production.

### What I’ve learned so far

AI agents are surprisingly good at certain kinds of work (refactoring, writing small utilities, improving documentation) but they still need strong guardrails. Without clear instructions, they’ll happily make large, risky changes or break consistency with the rest of the site.

I’ve also noticed that the more I document *how* I want the site to be worked on, the better the results I get — both from the AI and from my future self when I come back to something months later.

### Still keeping it simple

I’m not trying to turn this into a big complicated system. The site is still fully static and deployable with almost no tooling. I like that constraint. It forces me to think carefully about what actually needs to be modular versus what can stay simple.

At some point I’ll probably move to Astro or something similar, but only when the pain of the current setup becomes real. Right now the friction is still manageable, and I’m learning a lot by working within these limits.

### Why this matters to me

I’ve spent a lot of years rescuing old websites and digital archives. A big part of that work was dealing with the consequences of systems that were built without much thought for the next person who would have to touch them.

I don’t want my own site to become one of those projects. If I’m going to be working with AI agents (and eventually other people), I want the foundation to be solid enough that the work stays maintainable instead of slowly turning into technical debt.

So for now I’m treating this as an ongoing experiment: Can I build and maintain a real website in a way that works well for both humans and AI agents at the same time?

I’ll keep documenting what works and what doesn’t.
