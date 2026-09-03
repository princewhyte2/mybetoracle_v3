import { NextResponse } from "next/server";
import { authBffConfig, forwardedCookie, mutationIsSameOrigin } from "@/features/auth/bff";

export async function POST(request: Request) {
  if (!mutationIsSameOrigin(request)) return NextResponse.json({ error: { code: "INVALID_ORIGIN" } }, { status: 403 });
  const { baseUrl, serviceKey } = authBffConfig();
  const upstream = await fetch(`${baseUrl}/api/v3/auth/revoke-all`, { method: "POST", headers: { "X-MyBetOracle-V3-Key": serviceKey, ...forwardedCookie(request) }, cache: "no-store", signal: AbortSignal.timeout(5000) });
  const response = new NextResponse(await upstream.text(), { status: upstream.status, headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" } });
  const value = upstream.headers.get("set-cookie"); if (value) response.headers.set("set-cookie", value); return response;
}
