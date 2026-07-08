import type { CalendarEnv } from "./env";
import { calendarId, notifyEmail } from "./env";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface CalendarEvent {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  htmlLink?: string;
  created?: string;
  updated?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  organizer?: { email?: string; displayName?: string };
  attendees?: Array<{ email?: string; displayName?: string; responseStatus?: string }>;
}

interface EventsListResponse {
  items?: CalendarEvent[];
  nextSyncToken?: string;
}

interface WatchResponse {
  id: string;
  resourceId: string;
  expiration: string;
}

let cachedAccessToken: { value: string; expiresAt: number } | null = null;

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function getAccessToken(env: CalendarEnv): Promise<string> {
  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60_000) {
    return cachedAccessToken.value;
  }

  const body = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    refresh_token: env.GOOGLE_REFRESH_TOKEN,
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as GoogleTokenResponse;
  cachedAccessToken = {
    value: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return data.access_token;
}

export async function stopWatchChannel(
  env: CalendarEnv,
  channelId: string,
  resourceId: string,
): Promise<void> {
  const token = await getAccessToken(env);
  await fetch("https://www.googleapis.com/calendar/v3/channels/stop", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: channelId, resourceId }),
  });
}

export async function startWatchChannel(
  env: CalendarEnv,
  channelId: string,
  webhookUrl: string,
  webhookToken: string,
): Promise<WatchResponse> {
  const token = await getAccessToken(env);
  const cal = calendarId(env);

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal)}/events/watch`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: channelId,
      type: "web_hook",
      address: webhookUrl,
      token: webhookToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`Calendar watch failed: ${res.status} ${await res.text()}`);
  }

  return (await res.json()) as WatchResponse;
}

export async function listEventChanges(
  env: CalendarEnv,
  syncToken?: string,
): Promise<{ events: CalendarEvent[]; nextSyncToken?: string; resetRequired: boolean }> {
  const token = await getAccessToken(env);
  const cal = calendarId(env);
  const params = new URLSearchParams({ singleEvents: "true", showDeleted: "true" });
  if (syncToken) {
    params.set("syncToken", syncToken);
  } else {
    params.set("maxResults", "50");
  }

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal)}/events?${params}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (res.status === 410) {
    return { events: [], nextSyncToken: undefined, resetRequired: true };
  }

  if (!res.ok) {
    throw new Error(`Calendar events.list failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as EventsListResponse;
  return {
    events: data.items ?? [],
    nextSyncToken: data.nextSyncToken,
    resetRequired: false,
  };
}

export function classifyEventAction(event: CalendarEvent): "created" | "updated" | "deleted" {
  if (event.status === "cancelled") return "deleted";
  if (event.created && event.updated) {
    const created = new Date(event.created).getTime();
    const updated = new Date(event.updated).getTime();
    if (Math.abs(updated - created) < 5000) return "created";
  }
  return "updated";
}

export function formatEventTime(event: CalendarEvent): string {
  const start = event.start?.dateTime ?? event.start?.date ?? "unknown";
  const end = event.end?.dateTime ?? event.end?.date ?? "";
  return end ? `${start} → ${end}` : start;
}

export async function sendGmailNotification(
  env: CalendarEnv,
  subject: string,
  body: string,
): Promise<void> {
  const accessToken = await getAccessToken(env);
  const to = notifyEmail(env);
  const from = notifyEmail(env);

  const message = [
    `To: ${to}`,
    `From: Steve Knows Web <${from}>`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    body,
  ].join("\r\n");

  const raw = toBase64Url(message);

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    throw new Error(`Gmail send failed: ${res.status} ${await res.text()}`);
  }
}

export async function notifyCalendarChanges(
  env: CalendarEnv,
  events: CalendarEvent[],
  source: string,
): Promise<number> {
  let sent = 0;
  for (const event of events) {
    const action = classifyEventAction(event);
    const title = event.summary ?? "(no title)";
    const subject = `Calendar ${action}: ${title}`;
    const attendeeLines = (event.attendees ?? [])
      .map((a) => `- ${a.displayName ?? a.email ?? "unknown"} (${a.responseStatus ?? "unknown"})`)
      .join("\n");

    const body = [
      `A calendar event was ${action}.`,
      "",
      `Title: ${title}`,
      `When: ${formatEventTime(event)}`,
      `Link: ${event.htmlLink ?? "n/a"}`,
      attendeeLines ? `\nAttendees:\n${attendeeLines}` : "",
      "",
      `Detected via: ${source}`,
      `Event ID: ${event.id}`,
    ].filter(Boolean).join("\n");

    await sendGmailNotification(env, subject, body);
    sent += 1;
  }
  return sent;
}