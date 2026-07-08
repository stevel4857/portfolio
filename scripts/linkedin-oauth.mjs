#!/usr/bin/env node
/**
 * One-time LinkedIn OAuth setup for blog cross-posting.
 *
 * Before running:
 * 1. Create an app at https://www.linkedin.com/developers/
 * 2. Products: enable "Share on LinkedIn" (w_member_social)
 *    Optional: "Sign in with LinkedIn using OpenID Connect" for openid/profile scopes
 * 3. Auth tab → add redirect URL: http://localhost:8888/callback
 * 4. Set env vars LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET (or pass as args)
 *
 * Usage:
 *   LINKEDIN_CLIENT_ID=... LINKEDIN_CLIENT_SECRET=... node scripts/linkedin-oauth.mjs
 */

import http from 'node:http';
import { URL, URLSearchParams } from 'node:url';
import { getMemberUrn } from './lib/linkedin-api.mjs';

const PORT = Number(process.env.LINKEDIN_OAUTH_PORT || 8888);
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || `http://localhost:${PORT}/callback`;
// Default to Share on LinkedIn only. Override if OpenID product is added:
// LINKEDIN_SCOPES="openid profile w_member_social"
const SCOPES = (process.env.LINKEDIN_SCOPES || 'w_member_social').trim().split(/\s+/);

function required(name) {
  const value = process.env[name] || process.argv.find((arg) => arg.startsWith(`${name}=`))?.split('=').slice(1).join('=');
  if (!value) {
    throw new Error(`Missing ${name}. Export it before running this script.`);
  }
  return value;
}

async function exchangeCode({ clientId, clientSecret, code }) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Token exchange failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  const clientId = required('LINKEDIN_CLIENT_ID');
  const clientSecret = required('LINKEDIN_CLIENT_SECRET');

  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('scope', SCOPES.join(' '));
  authUrl.searchParams.set('state', Math.random().toString(36).slice(2));

  console.log('\nLinkedIn OAuth setup');
  console.log(`Scopes: ${SCOPES.join(' ')}\n`);
  console.log('1. Open this URL in your browser and approve the app:\n');
  console.log(authUrl.toString());
  console.log('\n2. Waiting for callback on', REDIRECT_URI, '...\n');

  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${PORT}`);
      if (url.pathname !== '/callback') {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const error = url.searchParams.get('error');
      if (error) {
        const description = url.searchParams.get('error_description') || error;
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>Authorization failed</h1><p>${description}</p>`);
        server.close();
        if (/scope/i.test(description)) {
          reject(new Error(
            `${description}\n\nFix: Developer Portal → your app → Auth tab → check OAuth 2.0 scopes. ` +
            'Only request scopes listed there. Add missing Products first, or use w_member_social only (default). ' +
            'Fallback: https://www.linkedin.com/developers/tools/oauth/token-generator',
          ));
        } else {
          reject(new Error(description));
        }
        return;
      }

      const authCode = url.searchParams.get('code');
      if (!authCode) {
        res.writeHead(400);
        res.end('Missing code');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>LinkedIn connected</h1><p>You can close this tab and return to the terminal.</p>');
      server.close();
      resolve(authCode);
    });

    server.listen(PORT, () => {
      console.log(`Listening on http://localhost:${PORT}`);
    });

    server.on('error', reject);
  });

  const tokens = await exchangeCode({ clientId, clientSecret, code });

  console.log('\nSuccess. Add these GitHub repository secrets (Settings → Secrets → Actions):\n');
  console.log(`LINKEDIN_ACCESS_TOKEN=${tokens.access_token}`);
  if (tokens.refresh_token) {
    console.log(`LINKEDIN_REFRESH_TOKEN=${tokens.refresh_token}`);
  }
  console.log(`LINKEDIN_CLIENT_ID=${clientId}`);
  console.log(`LINKEDIN_CLIENT_SECRET=${clientSecret}`);

  try {
    const personUrn = await getMemberUrn(tokens.access_token);
    console.log(`LINKEDIN_PERSON_URN=${personUrn}`);
  } catch (err) {
    console.log('\nNote: Could not auto-detect LINKEDIN_PERSON_URN.');
    console.log(err.message || err);
    console.log('Posting may still work — add OpenID Connect product and re-auth, or set PERSON_URN manually later.\n');
  }
  console.log('\nOptional repo variable: SITE_URL=https://steveknowsweb.com');
  console.log(`\nToken expires in ~${tokens.expires_in || 'unknown'} seconds.`);
  console.log('Keep refresh token + client credentials in secrets so CI can refresh access tokens.\n');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});