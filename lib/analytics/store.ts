import { AnalyticsEvent, PageViewEvent } from "@/lib/analytics/types";
import { logAnalyticsEvent, logAnalyticsSignal } from "@/lib/analytics/airtable";

interface EngagementSignal {
  userId: string;
  email?: string;
  event: PageViewEvent;
  label: string;
  triggeredAt: string;
}

const analyticsBuffer: AnalyticsEvent[] = [];
const engagementSignals: EngagementSignal[] = [];

const WATCH_LIST: Array<{
  slugIncludes: string;
  thresholdMs: number;
  label: string;
}> = [
  { slugIncludes: "investor", thresholdMs: 180_000, label: "Investor deck deep-view" },
  { slugIncludes: "updates", thresholdMs: 60_000, label: "Updates page repeat engagement" },
  { slugIncludes: "intelligence", thresholdMs: 120_000, label: "Intelligence feed dwell" }
];

export async function recordAnalyticsEvent(event: AnalyticsEvent) {
  analyticsBuffer.push(event);

  if (process.env.ANALYTICS_DEBUG === "1") {
    console.log("[analytics] event", event);
  }

  await logAnalyticsEvent(mapEventToAirtableFields(event));

  if (event.type === "page_view" && event.phase === "end") {
    await evaluateSignals(event);
  }
}

function mapEventToAirtableFields(event: AnalyticsEvent) {
  return {
    Type: event.type,
    Timestamp: event.timestamp,
    UserID: event.userId,
    Email: event.email ?? null,
    URL: event.type === "page_view" ? event.url : null,
    Pathname: event.type === "page_view" ? event.pathname : null,
    PageSlug: event.type === "page_view" ? event.pageSlug : null,
    Mode: event.type === "page_view" ? event.mode ?? null : null,
    Phase: event.type === "page_view" ? event.phase : null,
    DurationMs: event.type === "page_view" ? event.durationMs ?? null : null,
    ScrollDepthPct: event.type === "page_view" ? event.scrollDepthPct ?? null : null,
    Referrer: event.type === "page_view" ? event.referrer ?? null : null,
    SessionRole: event.type === "page_view" ? event.sessionUserRole ?? null : null,
    Metadata: event.type === "page_view" && event.meta ? JSON.stringify(event.meta) : null
  };
}

async function evaluateSignals(event: PageViewEvent) {
  if (!event.durationMs) return;
  const matched = WATCH_LIST.find((rule) => event.pageSlug.includes(rule.slugIncludes));
  if (!matched) return;

  if (event.durationMs >= matched.thresholdMs) {
    const signal: EngagementSignal = {
      userId: event.userId,
      email: event.email,
      event,
      label: matched.label,
      triggeredAt: new Date().toISOString()
    };
    engagementSignals.push(signal);
    if (process.env.ANALYTICS_DEBUG !== "0") {
      console.info("[analytics] engagement signal", signal);
    }

    await logAnalyticsSignal({
      Label: signal.label,
      TriggeredAt: signal.triggeredAt,
      UserID: signal.userId,
      Email: signal.email ?? null,
      PageSlug: signal.event.pageSlug,
      DurationMs: signal.event.durationMs ?? null,
      Mode: signal.event.mode ?? null,
      URL: signal.event.url,
      SessionRole: signal.event.sessionUserRole ?? null
    });
  }
}

export function getAnalyticsSnapshot() {
  return {
    events: analyticsBuffer.slice(-200),
    signals: engagementSignals.slice(-50)
  };
}
