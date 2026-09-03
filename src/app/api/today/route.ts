import { NextResponse } from "next/server";
import { getTodayData, TodayFeedError } from "@/features/today/today-service";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? "en";
  const date = url.searchParams.get("date") ?? "";
  const page = Number(url.searchParams.get("page") ?? "1");
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const view = url.searchParams.get("view") ?? "all";
  const search = url.searchParams.get("search")?.trim() || undefined;
  if (!isLocale(locale) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(page) || page < 1 || !["all", "live"].includes(view) || (cursor !== undefined && (cursor.length === 0 || cursor.length > 512)) || (search !== undefined && (search.length < 2 || search.length > 100))) {
    return NextResponse.json({ error: { code: "INVALID_TODAY_QUERY" } }, { status: 400 });
  }
  try {
    return NextResponse.json(await getTodayData({ date, locale, page, cursor, view: view as "all" | "live", search }), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const code = error instanceof TodayFeedError ? error.code : "TODAY_SERVICE_UNAVAILABLE";
    return NextResponse.json({ error: { code } }, { status: 503 });
  }
}
