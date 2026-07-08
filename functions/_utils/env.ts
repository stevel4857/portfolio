export interface CalendarEnv {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REFRESH_TOKEN: string;
  GOOGLE_CALENDAR_ID?: string;
  NOTIFY_EMAIL?: string;
  CALENDAR_WEBHOOK_SECRET?: string;
  CALENDAR_SETUP_SECRET?: string;
  CALENDAR_STATE: KVNamespace;
}

export function requireEnv(env: CalendarEnv) {
  const missing: string[] = [];
  if (!env.GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID");
  if (!env.GOOGLE_CLIENT_SECRET) missing.push("GOOGLE_CLIENT_SECRET");
  if (!env.GOOGLE_REFRESH_TOKEN) missing.push("GOOGLE_REFRESH_TOKEN");
  if (!env.CALENDAR_STATE) missing.push("CALENDAR_STATE (KV)");
  if (missing.length) {
    throw new Error(`Missing configuration: ${missing.join(", ")}`);
  }
}

export function notifyEmail(env: CalendarEnv): string {
  return env.NOTIFY_EMAIL ?? "steveknowsweb@gmail.com";
}

export function calendarId(env: CalendarEnv): string {
  return env.GOOGLE_CALENDAR_ID ?? "primary";
}