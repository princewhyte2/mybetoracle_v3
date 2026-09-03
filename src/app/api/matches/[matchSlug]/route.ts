import { getMatchDetail, MatchDetailError } from "@/features/match/match-service";
import { locales, type Locale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ matchSlug: string }> },
) {
  const { matchSlug } = await context.params;
  const requestedLocale = new URL(request.url).searchParams.get("locale");
  if (!locales.includes(requestedLocale as Locale)) {
    return Response.json({ error: { code: "INVALID_LOCALE" } }, { status: 400 });
  }
  try {
    return Response.json(await getMatchDetail(matchSlug, requestedLocale as Locale), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof MatchDetailError && error.code === "MATCH_NOT_FOUND") {
      return Response.json({ error: { code: error.code } }, { status: 404 });
    }
    return Response.json({ error: { code: "MATCH_UNAVAILABLE" } }, { status: 503 });
  }
}
