export type AnalyticsEventType = "page_view";

export type PageViewPhase = "start" | "end";

export interface AnalyticsEventBase {
  type: AnalyticsEventType;
  timestamp: string;
  userId: string;
  email?: string;
}

export interface PageViewEvent extends AnalyticsEventBase {
  type: "page_view";
  phase: PageViewPhase;
  viewId: string;
  url: string;
  pathname: string;
  pageSlug: string;
  pageTitle?: string;
  mode?: string;
  sessionUserRole?: string | null;
  meta?: Record<string, unknown>;
  durationMs?: number;
  scrollDepthPct?: number;
  referrer?: string | null;
}

export type AnalyticsEvent = PageViewEvent;
