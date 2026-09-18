import { NextResponse } from "next/server";
import { authBffConfig, forwardedCookie } from "@/features/auth/bff";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie");
  if (!cookie || !cookie.includes("mbo_session")) {
    return NextResponse.json(
      { matches: [], multiPickCount: 0, followingCount: 0, authenticated: false },
      { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" } }
    );
  }

  try {
    const { baseUrl, serviceKey } = authBffConfig();
    const locale = new URL(request.url).searchParams.get("locale");
    const upstream = await fetch(`${baseUrl}/api/v3/saved${locale ? `?locale=${encodeURIComponent(locale)}` : ""}`, {
      headers: {
        "X-MyBetOracle-V3-Key": serviceKey,
        ...forwardedCookie(request),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (upstream.status === 401) {
      return NextResponse.json(
        { matches: [], multiPickCount: 0, followingCount: 0, authenticated: false },
        { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" } }
      );
    }

    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { matches: [], multiPickCount: 0, followingCount: 0, authenticated: false },
      { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" } }
    );
  }
}

