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

## Pushing to GitHub

The local folder is `steveknowsweb`, but the GitHub repo is **`stevel4857/portfolio`**. That repo is connected to Cloudflare Pages and deploys to **https://steveknowsweb.com**. There is no separate `steveknowsweb` repo on GitHub.

### Quick method (recommended)

Double-click `update-site.ps1` or run:

```powershell
cd "D:\work\steveknowsweb"
.\update-site.ps1
```

The script pulls latest `main`, builds Tailwind, commits, and pushes. Cloudflare Pages deploys automatically after a successful push.

### Manual push

```powershell
cd "D:\work\steveknowsweb"
git pull origin main
npm run build          # if you changed HTML/CSS classes
git add .
git commit -m "Describe your changes"
git push origin main
```

### Large files and Git LFS

Videos (`.mp4`) and 3D models (`.glb`) are tracked with **Git LFS** (see `.gitattributes`). On push you will see:

```
Uploading LFS objects: 100% (N/N), XXX MB
```

That is normal. LFS uploads the actual video/model files; git only stores small pointer files.

**Before adding new large files**, make sure Git LFS is installed:

```powershell
git lfs install
git lfs track "*.mp4"
git lfs track "*.glb"
```

Then add and commit `.gitattributes` along with the new files.

### If `git push` hangs or stalls

This happened in June 2026 when several commits added full-size MP4 blobs to git history *before* they were migrated to LFS. Git tried to upload ~1 GB of binary data and stalled around 80–90% of "Writing objects".

**Fix: squash unpushed commits so history only contains LFS pointers.**

Only do this for commits that have **not** been pushed yet:

```powershell
cd "D:\work\steveknowsweb"

# 1. Confirm you are ahead of origin (unpushed commits only)
git status -sb
# Should show: ## main...origin/main [ahead N]

# 2. Squash all unpushed work into the staging area
git reset --soft origin/main

# 3. Verify large files are LFS pointers (should print ~134 bytes, not hundreds of MB)
git cat-file -s :assets/LibraryShoot.mp4

# 4. Re-commit as one clean commit
git commit -m "Your combined commit message"

# 5. Push (should be fast — a few MB of git data + LFS upload)
git push origin main --progress
```

**Do not squash** commits that are already on GitHub unless you intend to rewrite shared history and coordinate a force-push.

### Verify the push worked

```powershell
git status -sb
# Should show: ## main...origin/main   (no "ahead" or "behind")

git log --oneline -3
```

Or check the latest commit on GitHub: https://github.com/stevel4857/portfolio/commits/main

## Step-by-Step Setup

### 1. Push the code to GitHub (if not already)

See **Pushing to GitHub** above.

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

## Cloudflare + Git LFS (important)

Videos and 3D models are stored with **Git LFS**. Cloudflare's direct GitHub integration **does not fetch LFS files** — builds fail instantly and production stays on the last successful deploy.

**Production deploys use GitHub Actions** (`.github/workflows/deploy-cloudflare.yml`), which checks out with LFS and uploads the full site to the Cloudflare Pages project `steveknows`.

### One-time setup

1. In Cloudflare: **My Profile → API Tokens → Create Token**
   - Use the **Edit Cloudflare Workers** template, or create a custom token with **Account → Cloudflare Pages → Edit**
2. In GitHub: **portfolio repo → Settings → Secrets and variables → Actions → New repository secret**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: the token from step 1
3. Push to `main` (or re-run the workflow from the Actions tab). When it succeeds, https://steveknowsweb.com updates.

### Manual deploy (emergency)

If Actions is not set up yet, deploy from your machine (you already have the real LFS files locally):

```powershell
cd "D:\work\steveknowsweb"
npx wrangler login
npx wrangler pages deploy . --project-name steveknows --branch main
```

### Optional: disable duplicate Cloudflare Git builds

The Cloudflare GitHub App may still show failed checks on each push (`Cloudflare Pages`, `Workers Builds: portfolio`, `Workers Builds: steveknowsweb`). Those are from the old direct-git hook. In Cloudflare → Pages → `steveknows` → Settings, you can disconnect Git integration once Actions deploys are working — Actions becomes the only deploy path.

## Useful Tips

- Every push to `main` triggers a production deployment (via GitHub Actions once `CLOUDFLARE_API_TOKEN` is set)
- Every pull request automatically gets its own preview URL (e.g. `feature-new-hero.stevel4857.pages.dev`)
- You can add a `wrangler.toml` later if you want more control, but it's not required

## Alternative Hosts (if you prefer)

- **Netlify** — Also excellent, similar preview experience
- **Vercel** — Overkill for a pure static site

**Note:** GitHub Pages is also enabled on this repo and deploys successfully, but **production** is https://steveknowsweb.com (Cloudflare Pages project `steveknows`). The GitHub Pages URL (`https://stevel4857.github.io/portfolio`) is a fallback only.

**Cloudflare Pages is the active deployment method** for this project. The live site is at https://steveknowsweb.com. An older version of the site remains at https://steveknowswebdesign.com but is no longer maintained.

---

Need help with any of these steps? Just ask.