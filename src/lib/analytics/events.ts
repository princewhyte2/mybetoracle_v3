import type { Locale } from "@/i18n/config";
import { trackEvent } from "./client";

// Event names and required parameters, fixed here so web and the future
// mobile app can share the same taxonomy without drifting (see
// doubleengine/docs/V3_ANALYTICS_STRATEGY.md SS3). Only `todayViewed` has a
// real call site today -- the rest are defined now so the shape is locked
// before more call sites are added in a later phase.
type BaseParams = { locale: Locale };

export const AnalyticsEvents = {
  todayViewed: (params: BaseParams & { date: string; fixtureCount: number }) =>
    trackEvent("today_viewed", params),

  predictionViewed: (params: BaseParams & { marketType: string; confidenceTier?: string; fixtureId: string }) =>
    trackEvent("prediction_viewed", params),

  multiPickViewed: (params: BaseParams & { band: string; variant: number }) =>
    trackEvent("multi_pick_viewed", params),

  multiPickBuilt: (params: BaseParams & { legCount: number; totalOddsBand: string }) =>
    trackEvent("multi_pick_built", params),

  bookingCodeGenerated: (params: BaseParams & { legCount: number; totalOdds: number; bookmaker: string }) =>
    trackEvent("booking_code_generated", params),

  bookingCodeCopied: (params: BaseParams & { legCount: number }) =>
    trackEvent("booking_code_copied", params),

  streakExplored: (params: BaseParams & { metric: string; scope: string }) =>
    trackEvent("streak_explored", params),

  resultViewed: (params: BaseParams & { resultType: "won" | "lost" | "void" }) =>
    trackEvent("result_viewed", params),

  saveToggled: (params: BaseParams & { entityType: string }) =>
    trackEvent("save_toggled", params),

  authCompleted: (params: BaseParams & { method: string }) =>
    trackEvent("auth_completed", params),

  localeSwitched: (params: { fromLocale: Locale; toLocale: Locale }) =>
    trackEvent("locale_switched", params),
};
