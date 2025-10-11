"use client";

import { Analytics } from "@vercel/analytics/react";

export function AnalyticsToggle() {
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true") {
    return null;
  }

  return <Analytics />;
}
