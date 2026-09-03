export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const fixtures = new URL(request.url).searchParams.get("fixtures") ?? "";
  if (!/^[A-Za-z0-9_-]{22}(,[A-Za-z0-9_-]{22}){0,49}$/.test(fixtures)) return Response.json({ error: { code: "INVALID_LIVE_FIXTURES" } }, { status: 400 });
  const baseUrl = process.env.MYBETORACLE_SERVER_BASE_URL?.replace(/\/$/, ""); if (!baseUrl) return Response.json({ error: { code: "LIVE_CONFIGURATION_ERROR" } }, { status: 503 });
  const upstream = new URL(`${baseUrl}/api/v3/live/stream`); upstream.searchParams.set("fixtures", fixtures);
  try {
    const response = await fetch(upstream, { headers: { Accept: "text/event-stream" }, cache: "no-store", signal: request.signal });
    if (!response.ok || !response.body) return Response.json({ error: { code: "LIVE_UNAVAILABLE" } }, { status: 503 });
    return new Response(response.body, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" } });
  } catch { return Response.json({ error: { code: "LIVE_UNAVAILABLE" } }, { status: 503 }); }
}
