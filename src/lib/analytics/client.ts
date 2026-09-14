"use client";

import type { Analytics } from "firebase/analytics";
import { getFirebaseApp } from "@/lib/firebase/app";
import { isMeasurementConfigured } from "@/lib/firebase/config";
import { getStoredConsent } from "./consent-storage";

let analyticsPromise: Promise<Analytics | null> | null = null;
let sessionConsent: boolean | null = null;
function hasConsent(): boolean { return sessionConsent ?? getStoredConsent() === "granted"; }

// The Firebase Analytics SDK itself defaults consent to "granted" until
// setConsent() is called (documented directly on setConsent's own type in
// @firebase/analytics) -- the same risk shape as the gtag.js default-grant
// bug found in V2. This must run before getAnalytics()/logEvent() are ever
// reachable, every page load, not just once on first visit.
export async function applyAnalyticsConsent(granted: boolean): Promise<void> {
  if (typeof window === "undefined") return;
  sessionConsent = granted;
  try {
    const { setConsent } = await import("firebase/analytics");
    setConsent({
    analytics_storage: hasConsent() ? "granted" : "denied",
    // This module governs analytics consent only. Ad-related consent stays
    // denied here regardless of the analytics choice -- a separate, real
    // decision for whoever owns advertising, not implied by an analytics opt-in.
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    });
  } catch { /* Optional telemetry cannot break navigation or consent controls. */ }
}

function loadAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined" || !isMeasurementConfigured() || !hasConsent()) {
    return Promise.resolve(null);
  }
  return import("firebase/analytics")
    .then(async ({ getAnalytics, isSupported, setConsent }) => {
      const supported = await isSupported();
      if (!supported || !hasConsent()) return null;
      setConsent({ analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      return getAnalytics(getFirebaseApp());
    })
    .catch(() => null);
}

// Idempotent: safe to call from multiple mount points, only initializes once.
export function initAnalytics(): Promise<Analytics | null> {
  if (!hasConsent()) return Promise.resolve(null);
  if (!analyticsPromise) analyticsPromise = loadAnalytics().then(value => {
    if (!value) analyticsPromise = null;
    return value;
  });
  return analyticsPromise;
}

// Never throws. Consent-denied, unsupported-browser, unconfigured-env, and
// network failures all resolve as a silent no-op -- analytics must never be
// able to break a page or surface an error to a user.
export async function trackEvent(name: string, params?: Record<string, string | number | boolean>): Promise<void> {
  const analytics = await initAnalytics();
  if (!analytics) return;
  try {
    const { logEvent } = await import("firebase/analytics");
    if (!hasConsent()) return;
    logEvent(analytics, name, params);
  } catch {
    // Swallow -- see function contract above.
  }
}
