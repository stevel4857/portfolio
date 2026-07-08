import type { CalendarEnv } from "./env";
import { calendarId, requireEnv } from "./env";
import { loadState, saveState, type CalendarSyncState } from "./calendar-state";
import {
  listEventChanges,
  notifyCalendarChanges,
  startWatchChannel,
  stopWatchChannel,
} from "./google";

function randomChannelId(): string {
  return `skw-${crypto.randomUUID()}`;
}

export async function ensureCalendarWatch(
  env: CalendarEnv,
  origin: string,
  source: string,
): Promise<{ ok: true; channelId: string; expiration: number; initialSyncToken?: string }> {
  requireEnv(env);

  const webhookSecret = env.CALENDAR_WEBHOOK_SECRET ?? "change-me";
  const webhookUrl = `${origin.replace(/\/$/, "")}/api/calendar/webhook`;
  const cal = calendarId(env);

  const existing = await loadState(env.CALENDAR_STATE);
  if (existing?.channelId && existing.resourceId) {
    try {
      await stopWatchChannel(env, existing.channelId, existing.resourceId);
    } catch (err) {
      console.warn("stopWatchChannel:", err);
    }
  }

  const channelId = randomChannelId();
  const watch = await startWatchChannel(env, channelId, webhookUrl, webhookSecret);

  const initial = await listEventChanges(env);
  const state: CalendarSyncState = {
    channelId: watch.id,
    resourceId: watch.resourceId,
    expiration: Number(watch.expiration),
    syncToken: initial.nextSyncToken,
    calendarId: cal,
  };
  await saveState(env.CALENDAR_STATE, state);

  return {
    ok: true,
    channelId: watch.id,
    expiration: Number(watch.expiration),
    initialSyncToken: initial.nextSyncToken,
  };
}

export async function processCalendarWebhook(env: CalendarEnv, source: string): Promise<number> {
  requireEnv(env);
  const state = await loadState(env.CALENDAR_STATE);
  if (!state?.syncToken) {
    console.warn("calendar webhook: sync token not ready yet");
    return 0;
  }

  const changes = await listEventChanges(env, state.syncToken);

  if (changes.resetRequired) {
    const baseline = await listEventChanges(env);
    if (baseline.nextSyncToken) {
      await saveState(env.CALENDAR_STATE, { ...state, syncToken: baseline.nextSyncToken });
    }
    return 0;
  }

  if (changes.nextSyncToken) {
    await saveState(env.CALENDAR_STATE, { ...state, syncToken: changes.nextSyncToken });
  }

  if (!changes.events.length) return 0;
  return notifyCalendarChanges(env, changes.events, source);
}

export async function renewCalendarWatchIfNeeded(
  env: CalendarEnv,
  origin: string,
): Promise<{ renewed: boolean; expiration?: number }> {
  requireEnv(env);
  const state = await loadState(env.CALENDAR_STATE);
  const now = Date.now();
  const renewBeforeMs = 24 * 60 * 60 * 1000;

  if (!state || state.expiration - now < renewBeforeMs) {
    const result = await ensureCalendarWatch(env, origin, "scheduled-renew");
    return { renewed: true, expiration: result.expiration };
  }

  return { renewed: false, expiration: state.expiration };
}