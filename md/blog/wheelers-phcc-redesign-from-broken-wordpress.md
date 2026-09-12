---
title: "I Was Asked to Fix Their Site. A Year Later, I Built Them a New One in Half an Hour."
description: "A year after a broken WordPress rescue stalled, I rebuilt Wheeler’s PHCC as a static site—Formspree, GitHub, and free Cloudflare hosting—in about half an hour for the first solid pass."
canonical: "https://steveknowsweb.com/blog/wheelers-phcc-redesign-from-broken-wordpress"
date: "2026-09-12"
author: "Steve Luiting"
category: "Design"
tags: "Web Design, Static Sites, WordPress, Cloudflare, Formspree, Case Study"
language: "en"
---
About a year ago, I was asked to redesign the website for **Wheeler’s Plumbing, Heating & Cooling**—a family HVAC company in the Brighton / Denver metro area.

When I opened the site, it wasn’t just “dated.” It was fragile: an old **WordPress** install, old plugins, and a host I didn’t control. As I updated plugins to stabilize things, the site broke. I figured out how to fix it—but I didn’t have backend access. Another company owned the hosting relationship.

I wrote a clear email explaining the fix and gave it to the client’s rep to pass along. The hosting company wouldn’t talk to me because I wasn’t the account owner. Fair from their side; frustrating from mine.

The site did come back up with the partial repairs I’d managed before it went down. Then I heard they didn’t feel comfortable continuing to work with me. That stung, but I respected it and left the live domain alone.

A year later I checked again. Same site. Broken forms. Code showing where graphics should be. Logo issues. Still waiting on a stack that needs constant babysitting.

So out of that frustration—and because the business still deserves a site that matches how they work—I rebuilt it. With AI-assisted design help, the first solid redesign came together in roughly **30 minutes** of focused work (then we polished type, photography, products, logos, Formspree, and hosting over the next sessions).

This post is the honest version of that story, plus what’s under the hood.

### Before and after

**Before:** [wheelersphcc.com](https://www.wheelersphcc.com/) — WordPress on a third-party host, DNS at GoDaddy. Real history and trust signals, trapped in a brittle CMS.

**After (preview):** [wheelers-redesign.steveknowsweb.workers.dev](https://wheelers-redesign.steveknowsweb.workers.dev/) — plain HTML, CSS, and a little JavaScript. No WordPress. No plugin roulette. Versioned on GitHub. Easy to host and improve—and the hosting is on **Cloudflare’s free tier**.

![Archived old Wheeler's homepage showing dated WordPress layout and raw widgetkit shortcode](https://steveknowsweb.com/assets/images/wheelers-phcc-redesign/old-homepage.png)

*Before (Wayback, Apr 2024): dated WordPress layout—and raw shortcode like [widgetkit id="2"] sitting on the page where a widget should render.*

![Archived old Wheeler's About page](https://steveknowsweb.com/assets/images/wheelers-phcc-redesign/old-about.png)

*Old About page from the same archive—sparse, aging theme, partner logos in a simple banner.*

![New Wheeler's redesign homepage with navy teal copper editorial design](https://steveknowsweb.com/assets/images/wheelers-phcc-redesign/new-homepage.png)

*After: editorial layout, clear calls to action, modern type and color—still the same family business story.*

![New Wheeler's redesign services section](https://steveknowsweb.com/assets/images/wheelers-phcc-redesign/new-services.png)

*Below the fold: services and trust signals without the clutter.*

Important: the **live domain is untouched**. DNS still points at the old host until everyone is ready for a careful cutover. The redesign is a preview you can share, not a surprise takeover.

### What the redesign includes

A **static multi-page site**—a folder of pages, not a CMS.

-   **Home** — hero, trust strip, services, family story, service area, call-to-action
-   **Services** — maintenance, repair, install
-   **Products** — equipment hub plus air conditioners, furnaces, heat pumps, water heaters
-   **About** — family history and credentials
-   **Contact** — phone, hours, address, and a working inquiry form

**Design system:** Fraunces (headlines) + Plus Jakarta Sans (body/UI); deep navy, teal, and copper on warm sand; custom square mark + “Wheeler’s” wordmark with *Plumbing · Heating · Cooling*; sticky header with phone; strong “call an owner” messaging.

Copy and product facts were pulled from the existing site (tightened, not invented)—so it stays honest to the business.

### Under the hood

**1\. Static front end** — No React build. No database. Browsers load HTML/CSS/JS and images. That means fast loads, cheap hosting, and far fewer ways for a plugin update to take the whole business offline.

**2\. Formspree (contact form)** — The old site’s forms were part of the pain. The redesign doesn’t need WordPress mail or a server mailbox on the host.

1.  Visitor fills out name, phone, email, message
2.  JavaScript sends the data to **Formspree**
3.  Formspree emails the notification to the inbox you configure

**Why Formspree?** Browsers can’t safely send email alone. Formspree is the middleman.

**Lessons from wiring it:**

-   A honeypot field meant to stop bots can get auto-filled by browsers—and land in Formspree’s Spam tab. We removed it.
-   Free-plan **Formshield** can be aggressive; turning it off helped real tests arrive.
-   Captcha can stay off for a low-volume local form until bots show up.
-   Domain verification works for domains you control (like steveknowsweb.com). A `*.workers.dev` preview usually can’t be verified the same way—and that’s fine for a preview.

**3\. GitHub (source of truth)** — Private repo for the redesign. Every meaningful change can be committed and pushed so the work doesn’t live only on one laptop.

**4\. Cloudflare Workers (preview) — free hosting** — Live preview at [wheelers-redesign.steveknowsweb.workers.dev](https://wheelers-redesign.steveknowsweb.workers.dev/). Hosting sits on **Cloudflare’s free tier**. No monthly WordPress host bill. For a local service site this size, free is usually enough: global CDN, HTTPS, and room to grow before you’d ever need a paid plan.

**5\. What we deliberately didn’t touch** — Live `wheelersphcc.com` still points (via GoDaddy) at the old company’s servers. No DNS cutover yet. When the time is right: attach the domain with Cloudflare’s custom domain / CNAME flow—not by guessing an IP.

### Folder → GitHub → Cloudflare (short version)

1.  **Build locally**
2.  **Commit & push** to the private GitHub repo
3.  **Deploy** the Worker on the free plan and open the `*.workers.dev` URL
4.  **Wire Formspree** on the contact page; tune spam settings so real messages aren’t buried
5.  **Optional later:** point www only after stakeholder sign-off

### Why this stack fits (especially after WordPress pain)

-   A family “owners on the tools” brand needs a site that’s clear and call-first—not a fragile CMS.
-   **Static + Formspree** avoids the plugin trap that broke things last time.
-   **GitHub + Cloudflare (free hosting)** means the preview is under control and cheap to run, while the client’s live domain waits until trust and timing are right.
-   And yes: a solid first pass in about **half an hour** is possible when you’re not fighting plugins—you’re just designing and shipping pages.

### What’s next

-   Share the preview for feedback
-   Swap stock photography for real job / family photos when available
-   Careful DNS cutover only when everyone’s ready
-   Optional later: a simple admin/CMS path—without going back to brittle plugins

*Built with respect for Wheeler’s Plumbing, Heating & Cooling—family-owned since 1995.  
Preview: [wheelers-redesign.steveknowsweb.workers.dev](https://wheelers-redesign.steveknowsweb.workers.dev/) · Stack: HTML/CSS/JS · Formspree · GitHub · Cloudflare (free hosting)*
