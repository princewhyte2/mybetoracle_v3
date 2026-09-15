export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const fixtures = searchParams.get("fixtures") ?? "";
  const date = searchParams.get("date") ?? "";
  const validFixtures = /^[A-Za-z0-9_-]{22}(,[A-Za-z0-9_-]{22}){0,49}$/.test(fixtures);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
  if (!validFixtures && !validDate) return Response.json({ error: { code: "INVALID_LIVE_SCOPE" } }, { status: 400 });
  const baseUrl = process.env.MYBETORACLE_SERVER_BASE_URL?.replace(/\/$/, ""); if (!baseUrl) return Response.json({ error: { code: "LIVE_CONFIGURATION_ERROR" } }, { status: 503 });
  const upstream = new URL(`${baseUrl}/api/v3/live/stream`);
  if (validDate) upstream.searchParams.set("date", date);
  else upstream.searchParams.set("fixtures", fixtures);
  const forwardHeaders: Record<string, string> = {
    Accept: "text/event-stream",
  };
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
  if (clientIp) {
    forwardHeaders["X-Forwarded-For"] = clientIp;
  }
  const lastEventId = request.headers.get("last-event-id");
  if (lastEventId) {
    forwardHeaders["Last-Event-ID"] = lastEventId;
  }

  try {
    const response = await fetch(upstream, {
      headers: forwardHeaders,
      cache: "no-store",
      signal: request.signal,
    });
    if (!response.ok || !response.body) return Response.json({ error: { code: "LIVE_UNAVAILABLE" } }, { status: 503 });
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return Response.json({ error: { code: "LIVE_UNAVAILABLE" } }, { status: 503 });
  }
}
