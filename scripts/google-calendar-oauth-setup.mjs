#!/usr/bin/env node
/**
 * One-time Google OAuth setup for calendar push notifications.
 *
 * 1. Create OAuth client (Web app) in Google Cloud Console
 * 2. Enable Google Calendar API + Gmail API
 * 3. Add redirect URI: http://localhost:8789/oauth/callback
 * 4. Run:
 *      set GOOGLE_CLIENT_ID=...
 *      set GOOGLE_CLIENT_SECRET=...
 *      node scripts/google-calendar-oauth-setup.mjs
 * 5. Copy refresh token into Cloudflare Pages secrets (GOOGLE_REFRESH_TOKEN)
 */

import http from "node:http";
import { randomBytes } from "node:crypto";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const PORT = Number(process.env.OAUTH_PORT ?? 8789);
const REDIRECT_URI = `http://localhost:${PORT}/oauth/callback`;

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/gmail.send",
].join(" ");

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first.");
  process.exit(1);
}

const state = randomBytes(16).toString("hex");

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.searchParams.set("client_id", CLIENT_ID);
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", SCOPES);
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("prompt", "consent");
authUrl.searchParams.set("state", state);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  if (url.pathname === "/") {
    res.writeHead(302, { Location: authUrl.toString() });
    res.end();
    return;
  }

  if (url.pathname !== "/oauth/callback") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  if (url.searchParams.get("state") !== state) {
    res.writeHead(400);
    res.end("Invalid state");
    server.close();
    return;
  }

  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(400);
    res.end("Missing code");
    server.close();
    return;
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Success. Check your terminal for the refresh token.\n");

  console.log("\n--- Add these Cloudflare Pages secrets ---\n");
  console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`);
  console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`);
  console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token ?? "(missing — revoke app access and retry)"}`);
  console.log("\nAlso set:");
  console.log("NOTIFY_EMAIL=steveknowsweb@gmail.com");
  console.log("CALENDAR_WEBHOOK_SECRET=<random-long-string>");
  console.log("CALENDAR_SETUP_SECRET=<another-random-long-string>");
  console.log("GOOGLE_CALENDAR_ID=primary  (optional)");
  console.log("\nThen register the watch:");
  console.log('curl -X POST https://steveknowsweb.com/api/calendar/watch -H "Authorization: Bearer <CALENDAR_SETUP_SECRET>"');

  server.close();
});

server.listen(PORT, () => {
  console.log(`Open http://localhost:${PORT} to authorize Google Calendar + Gmail send.`);
});