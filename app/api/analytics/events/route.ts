import { NextRequest, NextResponse } from "next/server";

import { recordAnalyticsEvent } from "@/lib/analytics/store";
import { AnalyticsEvent } from "@/lib/analytics/types";

export async function POST(request: NextRequest) {
  try {
    const event = (await request.json()) as AnalyticsEvent;
    if (!event?.type || !event?.userId || !event?.timestamp) {
      return NextResponse.json({ error: "invalid_event" }, { status: 400 });
    }

    await recordAnalyticsEvent(event);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[analytics] failed to record event", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
