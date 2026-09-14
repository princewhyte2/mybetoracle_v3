"use client";

import { useEffect } from "react";
import { applyAnalyticsConsent, initAnalytics } from "@/lib/analytics/client";
import { getStoredConsent } from "@/lib/analytics/consent-storage";

// One consent initializer; event tracking independently enforces consent.
// No server-rendered content is replaced by this optional telemetry.
export function AnalyticsProvider() {
  useEffect(() => {
    const stored = getStoredConsent();
    void applyAnalyticsConsent(stored === "granted").then(() => {
      if (stored === "granted") void initAnalytics();
    });
  }, []);
  return null;
}
