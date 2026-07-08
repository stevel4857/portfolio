import type { CalendarEnv } from "../../_utils/env";
import { processCalendarWebhook } from "../../_utils/watch";

export const onRequestPost: PagesFunction<CalendarEnv> = async (context) => {
  const secret = context.env.CALENDAR_WEBHOOK_SECRET;
  if (secret) {
    const token = context.request.headers.get("X-Goog-Channel-Token");
    if (token !== secret) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const resourceState = context.request.headers.get("X-Goog-Resource-State") ?? "";
  if (resourceState === "sync") {
    return new Response("ok", { status: 200 });
  }

  if (resourceState !== "exists") {
    return new Response("ignored", { status: 200 });
  }

  try {
    const sent = await processCalendarWebhook(context.env, "google-push-webhook");
    console.log(`calendar webhook processed, emails sent: ${sent}`);
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("calendar webhook error:", err);
    return new Response("error", { status: 500 });
  }
};