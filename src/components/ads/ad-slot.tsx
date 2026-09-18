"use client";

import { useEffect, useRef } from "react";
import styles from "./ad-slot.module.css";

export type AdSlotFormat = "leaderboard" | "rectangle" | "half-page" | "in-feed" | "mobile-anchor";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

const DEFAULT_SLOT_BY_FORMAT: Record<AdSlotFormat, string> = {
  leaderboard: "1518345150",
  rectangle: "8304824361",
  "half-page": "8304824361",
  "in-feed": "1406664512",
  "mobile-anchor": "6991742690",
};

interface AdSlotProps {
  readonly format: AdSlotFormat;
  readonly slotId?: string;
  readonly className?: string;
  readonly label?: string;
}

export function AdSlot({ format, slotId, className, label = "Advertisement" }: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-8194555862221451";
  const effectiveSlotId = slotId || DEFAULT_SLOT_BY_FORMAT[format];
  const isDev = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_FORCE_ADS !== "true";

  useEffect(() => {
    if (isDev || !clientId || !effectiveSlotId || pushedRef.current) return;

    const element = adRef.current;
    if (!element) return;

    const attemptPush = () => {
      if (pushedRef.current) return;
      // Do not push if element is not in layout or has 0 width (e.g. display: none in media queries)
      // This eliminates the Google AdSense error: "No slot size for availableWidth=0"
      if (element.offsetWidth <= 0) return;
      if (element.getAttribute("data-adsbygoogle-status")) {
        pushedRef.current = true;
        return;
      }

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch {
        // Gracefully catch ad blocker or script blocking
      }
    };

    // Attempt immediately if already visible
    attemptPush();

    if (pushedRef.current) return;

    // Observe when the element becomes visible (e.g. screen orientation change, responsive breakpoint)
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        attemptPush();
        if (pushedRef.current) {
          observer.disconnect();
        }
      });
      observer.observe(element);
      return () => observer.disconnect();
    }
  }, [clientId, effectiveSlotId, isDev]);

  const formatClass =
    format === "leaderboard"
      ? styles.leaderboard
      : format === "rectangle"
        ? styles.rectangle
        : format === "half-page"
          ? styles.halfPage
          : format === "mobile-anchor"
            ? styles.mobileAnchor
            : styles.inFeed;

  return (
    <aside
      className={`${styles.adWrapper} ${formatClass} ${className ?? ""}`}
      aria-label={label}
    >
      <span className={styles.adBadge}>{label}</span>
      <div className={styles.adInner}>
        {isDev ? (
          <div className={styles.adPlaceholder}>
            <span className={styles.adPlaceholderText}>
              <strong>Ad Banner (Dev Preview)</strong>
              <br />
              {format === "leaderboard" && "Top Leaderboard (Responsive)"}
              {format === "rectangle" && "Sidebar Rectangle (300 × 250)"}
              {format === "half-page" && "Sidebar Skyscraper (300 × 600)"}
              {format === "mobile-anchor" && "Mobile Anchor Banner (Responsive)"}
              {format === "in-feed" && "Native In-Feed Banner (Responsive)"}
              <br />
              <small>Slot: {effectiveSlotId}</small>
            </span>
          </div>
        ) : clientId && effectiveSlotId ? (
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={clientId}
            data-ad-slot={effectiveSlotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div className={styles.adPlaceholder}>
            <span className={styles.adPlaceholderText}>
              {format === "leaderboard" && "Top Leaderboard (Responsive)"}
              {format === "rectangle" && "Sidebar Rectangle (300 × 250)"}
              {format === "half-page" && "Sidebar Skyscraper (300 × 600)"}
              {format === "mobile-anchor" && "Mobile Anchor Banner (Responsive)"}
              {format === "in-feed" && "Native In-Feed Banner (Responsive)"}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}

