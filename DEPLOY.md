# Deployment Guide — Cloudflare Pages (Recommended)

This site is a pure static site. It deploys beautifully on Cloudflare Pages with zero configuration hassle and excellent free preview URLs for every branch/PR.

## Why Cloudflare Pages

- Automatic preview deployments for every pull request (perfect for client review)
- Custom domain support (including steveknowswebdesign.com or steveknowsweb.com)
- Extremely fast global CDN
- Free tier is very generous
- GitHub integration is excellent

## Step-by-Step Setup

### 1. Push the code to GitHub (if not already)

```powershell
cd "D:\work\my-portfolio"
git add .
git commit -m "Initial modern site build"
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

### 4. Formspree Contact Form (Important)

The contact form on the homepage uses Formspree.

**To activate it:**

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form
3. Copy the endpoint (looks like `https://formspree.io/f/abc123def`)
4. Open `index.html`
5. Find this line:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
6. Replace `YOUR_FORM_ID` with your real endpoint
7. Commit and push — the form will now work

## Useful Tips

- Every push to `main` triggers a production deployment
- Every pull request automatically gets its own preview URL (e.g. `feature-new-hero.stevel4857.pages.dev`)
- You can add a `wrangler.toml` later if you want more control, but it's not required

## Alternative Hosts (if you prefer)

- **Netlify** — Also excellent, similar preview experience
- **GitHub Pages** — Works fine but weaker preview URLs and slower deploys
- **Vercel** — Overkill for a pure static site

**Cloudflare Pages is the current recommendation** for this project (as discussed in the website workflow planning doc).

---

Need help with any of these steps? Just ask.