"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { systemLabels } from "@/i18n/system-labels";

export function RouteError({ reset }: { reset: () => void }) {
  const params=useParams<{locale?:string}>();
  const requestedLocale=params.locale ?? "";
  const locale=isLocale(requestedLocale) ? requestedLocale : "en";
  const copy=systemLabels[locale];
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f5f7fa", padding: 24 }}><section style={{ width: "min(440px, 100%)", background: "white", border: "1px solid #dfe4ea", borderRadius: 7, padding: 28, textAlign: "center" }}><AlertTriangle size={28} color="#b54708" /><h1 style={{ fontSize: 20, margin: "12px 0 6px" }}>{copy.errorTitle}</h1><p style={{ color: "#667085", fontSize: 13, lineHeight: 1.6 }}>{copy.errorDescription}</p><button onClick={reset} style={{ height: 38, border: 0, borderRadius: 5, background: "#103e80", color: "white", padding: "0 15px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 7 }}><RefreshCw size={16} />{copy.retry}</button></section></main>;
}
