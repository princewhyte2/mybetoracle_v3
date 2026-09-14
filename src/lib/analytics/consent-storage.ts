const STORAGE_KEY = "mbo_analytics_consent";
const DATE_KEY = "mbo_analytics_consent_date";
const CONSENT_TTL_MS = 365 * 24 * 60 * 60 * 1000;

export type ConsentChoice = "granted" | "denied";

// Returns null when there is no real, still-valid stored choice -- callers
// must treat null the same as "denied" (Consent Mode default), never as
// "granted". localStorage can throw in some private-browsing modes; that
// must fail closed (treated as no consent), not throw into the caller.
export function getStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    const date = window.localStorage.getItem(DATE_KEY);
    if (!value || !date) return null;
    const ageMs = Date.now() - new Date(date).getTime();
    if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > CONSENT_TTL_MS) return null;
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function storeConsent(choice: ConsentChoice): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
    window.localStorage.setItem(DATE_KEY, new Date().toISOString());
  } catch {
    // Consent still applies for this session via applyAnalyticsConsent();
    // only the persisted memory of the choice is lost.
  }
}
