# Steve Luiting — Portfolio

A beautiful, modern, single-file personal portfolio website built with Tailwind CSS (via CDN) and vanilla JavaScript.

## ✨ Features

- **Single-file experience** — Open `index.html` in any browser. No build step required.
- **Fully responsive** — Excellent experience on desktop, tablet, and mobile.
- **Smooth interactions**:
  - Sticky navigation with active section highlighting
  - Mobile hamburger menu
  - Project cards that open rich detail modals
  - Testimonial carousel (manual + auto-advancing)
  - Working contact form with success state
- **Professional design** — Elegant dark theme, refined typography, subtle micro-interactions.
- **Print-friendly resume** — The "Download Resume" button generates a clean, ready-to-print resume in a new tab.
- **Keyboard accessible** — ESC closes modals, smooth scrolling, etc.

## 🚀 Getting Started

1. Open the folder in your file explorer.
2. Double-click `index.html` (or right-click → Open With → your browser).
3. Or run a simple local server (recommended for best experience):

   **Using Python (built-in):**
   ```powershell
   cd "D:\my-portfolio"
   python -m http.server 8000
   ```
   Then visit http://localhost:8000

   **Using VS Code Live Server extension** is also excellent.

## ✏️ Customization Guide

Everything you need to edit lives in `index.html`. The most important sections:

### 1. Personal Info (very top of `<body>`)
- Name, title, tagline, and hero description are in the **Hero** header section.
- Update the `steveknowsweb@gmail.com` and LinkedIn link in multiple places (easy to find via search).

### 2. About Section
- Replace the paragraphs under `#about`.

### 3. Skills
- The four skill category blocks are hardcoded for quick visual editing.

### 4. Projects (`projects` array in the `<script>`)
This is the most powerful part. The JavaScript array `projects` at the bottom of the file contains all the data:

```js
const projects = [ ... ];
```

Each project object supports:
- `title`, `role`, `year`, `short`
- `challenge`, `approach`
- `outcomes` array (3 metrics shown in the modal)
- `tools` array
- `liveUrl` (used by the "View live project" button)
- `visualColor` (controls the beautiful gradient in cards & modals)

Add, remove, or edit projects here. The grid and modals are rendered automatically.

### 5. Experience & Testimonials
- Hardcoded in HTML for simplicity. Easy to edit directly.
- Testimonials also power the carousel.

### 6. Contact Form
- Currently shows a success message after "sending".
- The "Email instead" button opens the user's mail client with pre-filled subject/body.
- To make the form actually send emails, connect it to Formspree, Netlify Forms, or your own backend.

### 7. Resume
- Clicking "Resume" opens a clean printable resume in a new tab and triggers print dialog.
- Replace the content inside the `downloadResume()` function with your real experience.

## 🎨 Design System Notes

- Built with Tailwind via the official Play CDN (`https://cdn.tailwindcss.com`)
- Primary accent color: `indigo-600` / `#6366f1`
- Dark elegant theme (`zinc-950`)
- Uses Inter + Playfair Display (loaded via Google Fonts)

To switch to a light theme or different accent, you only need to change a few Tailwind classes and the small custom CSS at the top.

## 📁 File Structure

```
my-portfolio/
├── index.html     ← The entire website
└── README.md
```

## 📌 Recommended Next Steps

1. Replace all placeholder projects with your real work.
2. Add 1–2 real case study links (or host PDFs).
3. Add a real headshot photo (replace the current abstract visual in the hero).
4. Connect the contact form to a real service.
5. Deploy it (Netlify, Vercel, or GitHub Pages are all free and perfect for this).

## Need help?

This was built for you as a starting point. Want me to:
- Add more real projects?
- Change the entire color scheme or go light mode?
- Add a blog section, gallery, or pricing?
- Make the form actually email you?
- Turn this into a multi-page site?

Just tell me what you'd like next.

---

Made with care. Open the file and enjoy. 🚀