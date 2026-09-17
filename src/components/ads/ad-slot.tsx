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
  leaderboard: "4617161848",
  rectangle: "4617161848",
  "half-page": "4617161848",
  "in-feed": "4617161848",
  "mobile-anchor": "9713121259",
};

function ensureAdSenseScript(clientId: string) {
  if (typeof window === "undefined") return;
  if (document.querySelector('script[src*="adsbygoogle.js"]')) return;
  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.dataset.adsbygoogleLoader = "true";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
  document.body.appendChild(script);
}

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

  useEffect(() => {
    if (!clientId || !effectiveSlotId || pushedRef.current) return;
    try {
      ensureAdSenseScript(clientId);
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      }
    } catch {
      // Graceful fallback if ad blocker is present or ad script is blocked
    }
  }, [clientId, effectiveSlotId]);

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
        {clientId && effectiveSlotId ? (
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={clientId}
            data-ad-slot={effectiveSlotId}
            data-ad-format={format === "leaderboard" || format === "in-feed" ? "auto" : undefined}
            data-full-width-responsive={format === "leaderboard" || format === "in-feed" ? "true" : "false"}
          />
        ) : (
          <div className={styles.adPlaceholder}>
            <span className={styles.adPlaceholderText}>
              {format === "leaderboard" && "728 × 90 Responsive Leaderboard"}
              {format === "rectangle" && "300 × 250 Medium Rectangle"}
              {format === "half-page" && "300 × 600 Sticky Skyscraper"}
              {format === "mobile-anchor" && "320 × 50 Mobile Anchor"}
              {format === "in-feed" && "Sponsored Intelligence Placement"}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
