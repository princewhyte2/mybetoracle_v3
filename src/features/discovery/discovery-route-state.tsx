"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import styles from "./discovery-route-state.module.css";

export function DiscoveryLoading() {
  return <main className={styles.loading} aria-label="Loading verified football catalogue"><header><i/><i/><i/></header><section>{Array.from({length:8},(_,index)=><article key={index}><i/><span><b/><b/></span><i/></article>)}</section></main>;
}

export function DiscoveryError({ reset }: { reset: () => void }) {
  return <main className={styles.error}><section><AlertTriangle/><span>MYBETORACLE</span><h1>Football catalogue unavailable</h1><p>The verified catalogue could not be retrieved safely. No placeholder football data has been substituted.</p><button onClick={reset}><RefreshCw/>Try again</button></section></main>;
}
