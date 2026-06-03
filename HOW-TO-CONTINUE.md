# How to Continue Working on steveknowsweb

This is your new professional website (steveknowsweb).

## Quick Start

```powershell
cd "D:\work\steveknowsweb"
code .                    # Open in VS Code
```

## Easy Updating

Use the included update script (recommended):

```powershell
cd "D:\work\steveknowsweb"
.\update-site.ps1
```

Or double-click `Update Site.bat`

The script will show you exactly what changed and ask for confirmation before committing.

## Local Preview

```powershell
cd "D:\work\steveknowsweb"
python -m http.server 8000
# or
npx serve . -p 3000
```

Then visit:
- http://localhost:8000 → Homepage
- http://localhost:8000/about.html → About
- http://localhost:8000/blog.html → Blog (JSON powered)

## Key Files

- `index.html` – Main site
- `about.html` – Full story page
- `blog.html` – Blog listing + reader
- `data/blog-posts.json` – **Edit this to add new blog posts**
- `assets/` – Images and video
- `flash/` – Legacy demo assets (SWF for blog)
- `update-site.ps1` + `Update Site.bat` – Update helpers

## Adding New Blog Posts

1. Open `data/blog-posts.json`
2. Add a new object at the end (before the final `]`)
3. Use the same structure as existing posts
4. Save and refresh `blog.html`

Run `npm run build` (or `npm run dev`) to generate `css/tailwind.css` before previewing or committing (the CSS is committed; no CDN).

## Deployment

See `DEPLOY.md` for Cloudflare Pages instructions (recommended).

## Git Note

This folder can be its own Git repository, or you can manage it from the parent `D:\work` folder.

Your old `my-portfolio` update script will continue working independently for anything left in that folder.

---

Ready for production use. Clean separation from the older personal portfolio work.