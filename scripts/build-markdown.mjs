/**
 * Build Markdown twins and blog permalinks for AI agents.
 * Run: npm run build:markdown
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import TurndownService from 'turndown';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://steveknowsweb.com';

const CORE_PAGES = [
  { html: 'index.html', md: 'index.md', canonical: '/', pageDir: '' },
  { html: 'about.html', md: 'about.md', canonical: '/about', pageDir: '' },
  { html: 'work/syndeo.html', md: 'work/syndeo.md', canonical: '/work/syndeo', pageDir: 'work' },
  { html: 'work/wordcut.html', md: 'work/wordcut.md', canonical: '/work/wordcut', pageDir: 'work' },
];

function read(filePath) {
  return fs.readFileSync(path.join(ROOT, filePath), 'utf8');
}

function write(filePath, content) {
  const full = path.join(ROOT, filePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

function extractMeta(html, attr) {
  const re = new RegExp(`<meta[^>]+name=["']${attr}["'][^>]+content=["']([^"']*)["']`, 'i');
  const alt = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${attr}["']`, 'i');
  const match = html.match(re) || html.match(alt);
  return match ? match[1].replace(/&amp;/g, '&') : '';
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1].replace(/&amp;/g, '&').trim() : '';
}

function extractMain(html) {
  const match = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  return match ? match[1].trim() : '';
}

function resolveUrl(href, pageDir) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return href;
  }
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
    return href;
  }
  if (href.startsWith('/')) {
    return `${SITE}${href}`;
  }
  const joined = pageDir ? `${pageDir}/${href}` : href;
  return `${SITE}/${joined.replace(/^\//, '')}`;
}

function createTurndown(pageDir) {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    bulletListMarker: '-',
  });

  turndown.addRule('figures', {
    filter: 'figure',
    replacement(_content, node) {
      const img = node.querySelector('img');
      if (!img) return '\n\n';
      const alt = img.getAttribute('alt') || '';
      const src = resolveUrl(img.getAttribute('src') || '', pageDir);
      const cap = node.querySelector('figcaption');
      const caption = cap ? cap.textContent.trim() : '';
      let out = `\n\n![${alt}](${src})`;
      if (caption) out += `\n\n*${caption}*`;
      return `${out}\n\n`;
    },
  });

  turndown.addRule('absoluteLinks', {
    filter(node) {
      return node.nodeName === 'A' && node.getAttribute('href');
    },
    replacement(content, node) {
      const href = resolveUrl(node.getAttribute('href'), pageDir);
      return `[${content}](${href})`;
    },
  });

  turndown.addRule('absoluteImages', {
    filter: 'img',
    replacement(_content, node) {
      const alt = node.getAttribute('alt') || '';
      const src = resolveUrl(node.getAttribute('src') || '', pageDir);
      return `![${alt}](${src})`;
    },
  });

  return turndown;
}

function yamlEscape(value) {
  if (!value) return '""';
  if (/[:#\n"'&]/.test(value)) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return `"${value}"`;
}

function frontmatter(fields) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null && value !== '') {
      lines.push(`${key}: ${yamlEscape(String(value))}`);
    }
  }
  lines.push('---', '');
  return lines.join('\n');
}

function htmlToMarkdown(html, pageDir) {
  const turndown = createTurndown(pageDir);
  return turndown.turndown(html).replace(/\n{3,}/g, '\n\n').trim();
}

function cleanGenerated() {
  const mdDir = path.join(ROOT, 'md');
  if (fs.existsSync(mdDir)) {
    fs.rmSync(mdDir, { recursive: true });
  }

  const blogDir = path.join(ROOT, 'blog');
  if (fs.existsSync(blogDir)) {
    for (const entry of fs.readdirSync(blogDir)) {
      const full = path.join(blogDir, entry);
      if (fs.statSync(full).isDirectory()) {
        fs.rmSync(full, { recursive: true });
      }
    }
  }
}

function buildCoreMarkdown() {
  const pages = [];

  for (const page of CORE_PAGES) {
    const html = read(page.html);
    const title = extractTitle(html);
    const description = extractMeta(html, 'description');
    const mainHtml = extractMain(html);
    const body = htmlToMarkdown(mainHtml, page.pageDir);
    const canonical = `${SITE}${page.canonical}`;

    const md = `${frontmatter({
      title,
      description,
      canonical,
      language: 'en',
    })}${body}\n`;

    write(`md/${page.md}`, md);
    pages.push({ title, canonical, mdPath: `/md/${page.md}` });
    console.log(`  md/${page.md}`);
  }

  return pages;
}

function buildBlogMarkdown(posts) {
  const indexLines = [
    frontmatter({
      title: 'Insights & Experiments — Steve Luiting',
      description:
        'Articles on strategic web design, AI-accelerated workflows, legacy web preservation, and building websites that last.',
      canonical: `${SITE}/blog`,
      language: 'en',
    }).trim(),
    '',
    '# Insights & Experiments',
    '',
    'Articles by Steve Luiting on strategic web design, digital preservation, and AI-accelerated workflows.',
    '',
  ];

  for (const post of posts) {
    const canonical = `${SITE}/blog/${post.slug}`;
    const body = htmlToMarkdown(post.content, '');
    const tags = post.tags?.length ? post.tags.join(', ') : undefined;

    const md = `${frontmatter({
      title: post.title,
      description: post.excerpt,
      canonical,
      date: post.date,
      author: post.author,
      category: post.category,
      tags,
      language: 'en',
    })}${body}\n`;

    write(`md/blog/${post.slug}.md`, md);
    console.log(`  md/blog/${post.slug}.md`);

    indexLines.push(
      `## [${post.title}](${canonical})`,
      '',
      `*${post.date} · ${post.category} · ${post.readTime}*`,
      '',
      post.excerpt,
      '',
      `Markdown: [${post.slug}.md](/md/blog/${post.slug}.md)`,
      '',
    );
  }

  write('md/blog.md', `${indexLines.join('\n')}\n`);
  console.log('  md/blog.md');

  return posts.map((post) => ({
    title: post.title,
    canonical: `${SITE}/blog/${post.slug}`,
    mdPath: `/md/blog/${post.slug}.md`,
    slug: post.slug,
  }));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function postNeedsRuffle(post) {
  return typeof post.content === 'string' && /id=["']ruffle-demo["']/.test(post.content);
}

function buildBlogPermalinks(posts) {
  for (const post of posts) {
    const canonical = `${SITE}/blog/${post.slug}`;
    const tagsHtml = post.tags
      ? `<div class="mt-10 pt-6 border-t border-slate-100 flex flex-wrap gap-2">${post.tags
          .map(
            (tag) =>
              `<span class="text-xs px-3 py-1 bg-slate-100 rounded-full text-slate-600">${escapeHtml(tag)}</span>`,
          )
          .join('')}</div>`
      : '';

    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Posts with a live Flash demo need Ruffle + shared init (auto-runs for #ruffle-demo).
    const ruffleHead = postNeedsRuffle(post)
      ? `
  <!-- Ruffle for live SWF demo in this post (js/ruffle-demo.js falls back to jsDelivr if unpkg is blocked) -->
  <script src="https://unpkg.com/@ruffle-rs/ruffle"></script>
  <script src="/js/ruffle-demo.js" defer></script>`
      : '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(post.excerpt)}">
  <title>${escapeHtml(post.title)} — Steve Luiting</title>
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" type="text/markdown" href="/md/blog/${post.slug}.md">
  ${post.image ? `<meta property="og:image" content="${SITE}${post.image}">` : ''}
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/steveknowswebdesign-favicon.png">
  <link rel="stylesheet" href="/css/tailwind.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">${ruffleHead}
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&amp;family=Playfair+Display:wght@700&amp;display=swap');
    body { font-family: "Inter", system_ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body class="bg-white text-slate-900">
  <div data-component="nav"></div>

  <main class="max-w-3xl mx-auto px-6 py-12 md:py-16">
    <a href="/blog/" class="inline-flex items-center gap-x-1.5 text-sm text-slate-500 hover:text-slate-900 transition mb-8">
      <i class="fa-solid fa-arrow-left text-xs"></i> All articles
    </a>

    <div class="flex items-center gap-x-3 mb-6">
      <span class="category-pill">${escapeHtml(post.category)}</span>
      <span class="text-sm text-slate-500">${formattedDate}</span>
      <span class="text-sm text-slate-500">· ${escapeHtml(post.readTime)}</span>
    </div>

    <h1 class="heading-serif text-4xl md:text-5xl leading-none tracking-tighter mb-8">${escapeHtml(post.title)}</h1>

    ${post.image ? `<figure class="mb-10"><img src="${escapeHtml(post.image)}" alt="" class="w-full rounded-2xl border border-slate-200 shadow-sm" /></figure>` : ''}

    <div class="prose prose-slate max-w-none blog-content">
      ${post.content}
    </div>

    ${tagsHtml}
  </main>

  <footer class="border-t border-slate-200 bg-white py-10 mt-8">
    <div class="max-w-3xl mx-auto px-6 text-sm text-slate-500 flex flex-col sm:flex-row gap-y-3 items-center justify-between">
      <div>© Steve Luiting. All rights reserved.</div>
      <div class="flex gap-x-5">
        <a href="/" class="hover:text-slate-900 transition">Home</a>
        <a href="/blog/" class="hover:text-slate-900 transition">Insights</a>
        <a href="mailto:steveknowsweb@gmail.com" class="hover:text-slate-900 transition">Email</a>
      </div>
    </div>
  </footer>

  <script src="/scripts/components.js"></script>
</body>
</html>
`;

    write(`blog/${post.slug}/index.html`, html);
    console.log(`  blog/${post.slug}/index.html`);
  }
}

function buildLlmsTxt(corePages, blogPages) {
  const fixed = [
    '# Steve Luiting — steveknowsweb.com',
    '',
    '> Strategic web design and digital experiences for museums, nonprofits, and purpose-driven organizations.',
    '',
    '## Pages',
    '',
    ...corePages.map((p) => `- [${p.title}](${SITE}${p.mdPath})`),
    `- [Blog index](${SITE}/md/blog.md)`,
    '',
    '## Articles',
    '',
    ...blogPages.map((p) => `- [${p.title}](${SITE}${p.mdPath})`),
    '',
  ];

  write('llms.txt', fixed.join('\n'));
  console.log('  llms.txt');
}

function buildSitemap(posts) {
  const staticUrls = [
    { loc: '/', changefreq: 'monthly', priority: '1.0' },
    { loc: '/about', changefreq: 'monthly', priority: '0.8' },
    { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
    { loc: '/work/syndeo', changefreq: 'monthly', priority: '0.7' },
    { loc: '/work/wordcut', changefreq: 'monthly', priority: '0.7' },
  ];

  const blogUrls = posts.map((post) => ({
    loc: `/blog/${post.slug}`,
    changefreq: 'monthly',
    priority: '0.6',
  }));

  const all = [...staticUrls, ...blogUrls];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
  .map(
    (u) => `  <url>
    <loc>${SITE}${u.loc === '/' ? '/' : u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

  write('sitemap.xml', xml);
  console.log('  sitemap.xml');
}

function sortPosts(posts) {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
}

function main() {
  console.log('Building Markdown for agents...');
  cleanGenerated();

  const posts = sortPosts(JSON.parse(read('data/blog-posts.json')));

  console.log('Core pages:');
  const corePages = buildCoreMarkdown();

  console.log('Blog posts:');
  const blogPages = buildBlogMarkdown(posts);

  console.log('Blog permalinks:');
  buildBlogPermalinks(posts);

  // Keep /blog/ serving the listing even though post folders live under blog/.
  // Cloudflare pretty-URLs + a rewrite of /blog → blog.html caused redirect loops.
  const blogListing = path.join(ROOT, 'blog.html');
  const blogIndex = path.join(ROOT, 'blog', 'index.html');
  if (fs.existsSync(blogListing)) {
    fs.copyFileSync(blogListing, blogIndex);
    console.log('  blog/index.html (synced from blog.html)');
  }

  buildLlmsTxt(corePages, blogPages);
  buildSitemap(posts);

  console.log(`Done — ${posts.length} articles, ${CORE_PAGES.length} core pages.`);
}

main();