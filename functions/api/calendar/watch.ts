import type { CalendarEnv } from "../../_utils/env";
import { ensureCalendarWatch } from "../../_utils/watch";

export const onRequestPost: PagesFunction<CalendarEnv> = async (context) => {
  const setupSecret = context.env.CALENDAR_SETUP_SECRET;
  if (!setupSecret) {
    return json({ error: "CALENDAR_SETUP_SECRET not configured." }, 503);
  }

  const auth = context.request.headers.get("Authorization") ?? "";
  if (auth !== `Bearer ${setupSecret}`) {
    return json({ error: "Unauthorized" }, 401);
  }

  const url = new URL(context.request.url);
  const origin = url.origin;

  try {
    const result = await ensureCalendarWatch(context.env, origin, "manual-setup");
    return json({
      ok: true,
      channelId: result.channelId,
      expiration: result.expiration,
      webhook: `${origin}/api/calendar/webhook`,
      initialSyncToken: result.initialSyncToken ? "stored" : "pending",
    });
  } catch (err) {
    console.error("calendar watch setup error:", err);
    return json({ error: err instanceof Error ? err.message : "Setup failed" }, 500);
  }
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}