---
title: "impactstudios.app Is Live — A Coming Soon Page on the Path I Already Trust"
description: "The Impact Studio product is still in development, but the brand now has a home at impactstudios.app — a coming soon page deployed through the same GitHub-to-Cloudflare workflow I have been writing about. Set up June 26, 2026."
canonical: "https://steveknowsweb.com/blog/impactstudios-app-is-live"
date: "2026-06-26"
author: "Steve Luiting"
category: "AI & Strategy"
tags: "Product, Static Sites, Workflow, Impact Studio"
language: "en"
---
A few days ago I wrote about [Impact Studio](https://steveknowsweb.com/blog/impact-studio-a-builder-for-offline-work-and-real-publishing) — the offline-first visual builder I am building for solo creators and small studios. The product itself is still in development. But the brand needed a real address on the web.

On **June 26, 2026**, I set up [impactstudios.app](https://impactstudios.app) with a simple coming soon page. Nothing fancy. Just a clear placeholder while the builder matures.

![Screenshot of the impactstudios.app coming soon page with a dark gradient background, Impact Studios heading, and a coming soon badge](https://steveknowsweb.com/assets/images/impactstudios-app-coming-soon.jpg)

*impactstudios.app — live coming soon page, set up June 26, 2026.*

### Same workflow, separate repos

This follows the publishing model I have been describing for Impact Studio itself: the **product repository** (`impactstudio`) is not what goes to Cloudflare. The **site repository** (`impactstudios-site`) holds static HTML only. Push to GitHub, Cloudflare Pages deploys, custom domain attached, DNS handled automatically.

That separation matters. The app source stays private and messy in the ways real software is messy. The public site stays small, portable, and easy to replace when Impact Studio can publish marketing pages on its own.

### What is next

For now it is a holding page. When the builder can export and publish real sites, this repo will be the first candidate for a proper marketing site — designed in Impact Studio, rendered to static files, pushed to GitHub, live on Cloudflare.

Until then, [impactstudios.app](https://impactstudios.app) is proof that the boring path works: own the domain, own the repo, own the deploy.

*Status: coming soon page live — June 26, 2026. Site repo: [github.com/stevel4857/impactstudios-site](https://github.com/stevel4857/impactstudios-site)*
