export interface CalendarSyncState {
  channelId: string;
  resourceId: string;
  expiration: number;
  syncToken?: string;
  calendarId: string;
}

const STATE_KEY = "calendar:sync";

export async function loadState(kv: KVNamespace): Promise<CalendarSyncState | null> {
  const raw = await kv.get(STATE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as CalendarSyncState;
}

export async function saveState(kv: KVNamespace, state: CalendarSyncState): Promise<void> {
  await kv.put(STATE_KEY, JSON.stringify(state));
}