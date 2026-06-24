#!/usr/bin/env node
/**
 * Cross-post blog entries flagged with publishToLinkedIn: true.
 *
 * Required GitHub secrets:
 *   LINKEDIN_ACCESS_TOKEN
 *
 * Optional (token refresh):
 *   LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_REFRESH_TOKEN
 *
 * Optional overrides:
 *   LINKEDIN_PERSON_URN, LINKEDIN_VERSION, SITE_URL
 *
 * One-time local setup: node scripts/linkedin-oauth.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildPostCommentary,
  createTextPost,
  getMemberUrn,
  refreshAccessToken,
} from './lib/linkedin-api.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_PATH = path.join(ROOT, 'data', 'blog-posts.json');
const MANIFEST_PATH = path.join(ROOT, 'data', 'linkedin-posted.json');
const SITE_URL = process.env.SITE_URL || 'https://steveknowsweb.com';
const DRY_RUN = process.argv.includes('--dry-run');

async function loadJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function resolveAccessToken() {
  let token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!token) {
    return null;
  }

  const { LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_REFRESH_TOKEN } = process.env;
  if (LINKEDIN_CLIENT_ID && LINKEDIN_CLIENT_SECRET && LINKEDIN_REFRESH_TOKEN) {
    try {
      const refreshed = await refreshAccessToken({
        clientId: LINKEDIN_CLIENT_ID,
        clientSecret: LINKEDIN_CLIENT_SECRET,
        refreshToken: LINKEDIN_REFRESH_TOKEN,
      });
      if (refreshed.access_token) {
        token = refreshed.access_token;
        if (refreshed.refresh_token) {
          console.log('LinkedIn access token refreshed. Update LINKEDIN_ACCESS_TOKEN in GitHub secrets if posting failed before.');
        }
      }
    } catch (err) {
      console.warn(`Token refresh skipped: ${err.message}`);
    }
  }

  return token;
}

function pendingPosts(posts, manifest) {
  const posted = manifest.posts || {};
  return posts.filter((post) => post.publishToLinkedIn === true && !posted[post.slug]);
}

async function main() {
  const [posts, manifest] = await Promise.all([
    loadJson(BLOG_PATH),
    loadJson(MANIFEST_PATH),
  ]);

  manifest.posts ||= {};
  const queue = pendingPosts(posts, manifest);

  if (!queue.length) {
    console.log('No blog posts pending LinkedIn cross-post.');
    return;
  }

  console.log(`Found ${queue.length} post(s) to cross-post to LinkedIn.`);

  if (DRY_RUN) {
    for (const post of queue) {
      console.log('\n---');
      console.log(`Slug: ${post.slug}`);
      console.log(buildPostCommentary(post, SITE_URL));
    }
    return;
  }

  const accessToken = await resolveAccessToken();
  if (!accessToken) {
    console.log('LINKEDIN_ACCESS_TOKEN not configured — skipping LinkedIn cross-post.');
    return;
  }
  const authorUrn = await getMemberUrn(accessToken);
  console.log(`Posting as ${authorUrn}`);

  for (const post of queue) {
    const commentary = buildPostCommentary(post, SITE_URL);
    console.log(`Posting: ${post.slug}`);
    const { postUrn } = await createTextPost(accessToken, { authorUrn, commentary });
    manifest.posts[post.slug] = {
      postedAt: new Date().toISOString(),
      method: 'api',
      postUrn: postUrn || null,
      title: post.title,
    };
    console.log(`Posted ${post.slug}${postUrn ? ` → ${postUrn}` : ''}`);
  }

  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Updated ${path.relative(ROOT, MANIFEST_PATH)}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});