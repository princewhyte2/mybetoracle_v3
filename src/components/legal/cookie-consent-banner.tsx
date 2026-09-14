"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { consentLabels } from "@/i18n/consent-labels";
import { applyAnalyticsConsent, initAnalytics } from "@/lib/analytics/client";
import { getStoredConsent, storeConsent, type ConsentChoice } from "@/lib/analytics/consent-storage";
import styles from "./cookie-consent-banner.module.css";

// localStorage has no same-tab change event, so there is nothing real to
// subscribe to here -- this store is only ever read once per mount plus
// once explicitly after decide() below forces a re-render via justDecided.
const noopSubscribe = () => () => {};
const getServerConsentSnapshot = (): ConsentChoice | null => null;

export function CookieConsentBanner({ locale }: { locale: Locale }) {
  // useSyncExternalStore, not useState+useEffect: the real value only
  // exists in a browser-only store (localStorage). The server snapshot is
  // always "unknown" so server and first-client-render agree, and React
  // reconciles to the real client value after hydration without a
  // synchronous setState-in-effect.
  const stored = useSyncExternalStore(noopSubscribe, getStoredConsent, getServerConsentSnapshot);
  const [justDecided, setJustDecided] = useState(false);
  const labels = consentLabels[locale];
  const visible = !justDecided && stored === null;

  function decide(choice: ConsentChoice) {
    storeConsent(choice);
    void applyAnalyticsConsent(choice === "granted").then(() => {
      if (choice === "granted") void initAnalytics();
    });
    setJustDecided(true);
  }

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-label={labels.title} aria-live="polite">
      <div className={styles.content}>
        <p className={styles.title}>{labels.title}</p>
        <p className={styles.description}>
          {labels.description} <Link href={`/${locale}/privacy`}>{labels.privacyLink}</Link>
        </p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.decline} onClick={() => decide("denied")}>
          {labels.decline}
        </button>
        <button type="button" className={styles.accept} onClick={() => decide("granted")}>
          {labels.accept}
        </button>
      </div>
    </div>
  );
}
