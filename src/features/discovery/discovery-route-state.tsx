"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { discoveryLabels } from "./labels";
import { systemLabels } from "@/i18n/system-labels";
import styles from "./discovery-route-state.module.css";

export function DiscoveryLoading() {
  return <main className={styles.loading} aria-label="Loading verified football catalogue"><header><i/><i/><i/></header><section>{Array.from({length:8},(_,index)=><article key={index}><i/><span><b/><b/></span><i/></article>)}</section></main>;
}

export function DiscoveryError({ reset }: { reset: () => void }) {
  const params = useParams();
  const locale: Locale = isLocale(params.locale as string) ? params.locale as Locale : "en";
  return <main className={styles.error}><section><AlertTriangle/><span>MYBETORACLE</span><h1>{discoveryLabels[locale].exploreTitle}</h1><button onClick={reset}><RefreshCw/>{systemLabels[locale].retry}</button></section></main>;
}
