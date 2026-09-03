import { NextResponse } from "next/server";
import { DiscoveryDataError, getDiscoveryCatalogSlice } from "@/features/discovery/discovery-service";
import type { DiscoverySection } from "@/features/discovery/types";
import { isLocale } from "@/i18n/config";

const sections = new Set<DiscoverySection>(["countries", "competitions", "teams", "markets"]);
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? "en";
  const section = url.searchParams.get("entity") as DiscoverySection;
  const page = Number(url.searchParams.get("page") ?? "1");
  const search = url.searchParams.get("search")?.trim().slice(0, 100) || undefined;
  if (!isLocale(locale) || !sections.has(section) || !Number.isInteger(page) || page < 1) {
    return NextResponse.json({ error: { code: "INVALID_DISCOVERY_QUERY" } }, { status: 400 });
  }
  try {
    return NextResponse.json(await getDiscoveryCatalogSlice({ locale, section, page, search }), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const code = error instanceof DiscoveryDataError ? error.code : "DISCOVERY_SERVICE_UNAVAILABLE";
    return NextResponse.json({ error: { code } }, { status: 503 });
  }
}
