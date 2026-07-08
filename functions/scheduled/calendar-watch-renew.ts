import type { CalendarEnv } from "../_utils/env";
import { renewCalendarWatchIfNeeded } from "../_utils/watch";

export const onSchedule: PagesFunction<CalendarEnv> = async (context) => {
  const origin = context.env.SITE_ORIGIN ?? "https://steveknowsweb.com";

  try {
    const result = await renewCalendarWatchIfNeeded(context.env, origin);
    console.log("calendar watch renew:", result);
  } catch (err) {
    console.error("calendar watch renew failed:", err);
  }
};