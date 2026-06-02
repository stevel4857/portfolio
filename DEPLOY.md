# Deployment Guide — Cloudflare Pages (Recommended)

**Current Status (as of 2026):**  
The site is already deployed and live at **https://steveknowsweb.com** via Cloudflare Pages.  
An older version remains at https://steveknowswebdesign.com.

This site is a pure static site (Tailwind CSS is pre-built via `npm run build` and the output `css/tailwind.css` is committed). It deploys beautifully on Cloudflare Pages with zero configuration hassle and excellent free preview URLs for every branch/PR.

## Why Cloudflare Pages

- Automatic preview deployments for every pull request (perfect for client review)
- Custom domain support (steveknowsweb.com is the current live site)
- Extremely fast global CDN
- Free tier is very generous
- GitHub integration is excellent

## Step-by-Step Setup

### 1. Push the code to GitHub (if not already)

```powershell
cd "D:\work\steveknowsweb"
git add .
git commit -m "Update site"
git push
```

### 2. Create the Cloudflare Pages Project

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Pages
2. Click **"Create a project"** → **"Connect to Git"**
3. Select your GitHub account and the repository containing this folder
4. In the build settings:
   - **Framework preset**: None (or "Static site")
   - **Build command**: (leave empty)
   - **Build output directory**: `.`   (or `/` if you keep everything in root)
   - **Root directory**: Leave as `/` (or set to the subfolder if you ever move this site into one)

5. Click **Save and Deploy**

### 3. Connect Your Custom Domain (Optional but Recommended)

Once the site is live:

1. In your Pages project → **Custom domains**
2. Add your domain (e.g. `steveknowswebdesign.com`)
3. Follow Cloudflare’s DNS instructions (very simple since you already use Cloudflare Registrar)

### 4. Contact Form

The contact form on the homepage is powered by Formspree.

The endpoint is already configured and active in `index.html` (`https://formspree.io/f/xaqkggrv`).

If you need to update or change the Formspree integration in the future:

1. Log in to your Formspree account and manage the form.
2. Copy the new endpoint URL.
3. Update the `action` attribute on the `<form>` element in `index.html`.
4. Test submissions via a local preview and a Cloudflare Pages preview deployment before merging.

## Useful Tips

- Every push to `main` triggers a production deployment
- Every pull request automatically gets its own preview URL (e.g. `feature-new-hero.stevel4857.pages.dev`)
- You can add a `wrangler.toml` later if you want more control, but it's not required

## Alternative Hosts (if you prefer)

- **Netlify** — Also excellent, similar preview experience
- **Vercel** — Overkill for a pure static site

**Note:** GitHub Pages is currently **disabled** on the `portfolio` repository. The `https://stevel4857.github.io/portfolio` URL is not used and should be ignored.

**Cloudflare Pages is the active deployment method** for this project. The live site is at https://steveknowsweb.com. An older version of the site remains at https://steveknowswebdesign.com but is no longer maintained.

---

Need help with any of these steps? Just ask.