import { NextResponse } from "next/server";
import { authBffConfig, forwardedCookie, mutationIsSameOrigin } from "@/features/auth/bff";

function passCookie(upstream: Response, response: NextResponse) {
  const value = upstream.headers.get("set-cookie"); if (value) response.headers.set("set-cookie", value);
  response.headers.set("Cache-Control", "private, no-store"); return response;
}
export async function GET(request: Request) {
  const { baseUrl, serviceKey } = authBffConfig();
  const upstream = await fetch(`${baseUrl}/api/v3/auth/session`, { headers: { "X-MyBetOracle-V3-Key": serviceKey, ...forwardedCookie(request) }, cache: "no-store", signal: AbortSignal.timeout(4000) });
  return passCookie(upstream, new NextResponse(await upstream.text(), { status: upstream.status, headers: { "Content-Type": "application/json" } }));
}
export async function POST(request: Request) {
  if (!mutationIsSameOrigin(request)) return NextResponse.json({ error: { code: "INVALID_ORIGIN" } }, { status: 403 });
  const contentType = request.headers.get("content-type") || ""; if (!contentType.startsWith("application/json")) return NextResponse.json({ error: { code: "INVALID_CONTENT_TYPE" } }, { status: 415 });
  const body = await request.json().catch(() => null) as { idToken?: unknown } | null;
  if (typeof body?.idToken !== "string" || body.idToken.length < 100 || body.idToken.length > 10000) return NextResponse.json({ error: { code: "INVALID_TOKEN" } }, { status: 400 });
  const { baseUrl, serviceKey } = authBffConfig();
  const upstream = await fetch(`${baseUrl}/api/v3/auth/session`, { method: "POST", headers: { "X-MyBetOracle-V3-Key": serviceKey, Authorization: `Bearer ${body.idToken}` }, cache: "no-store", signal: AbortSignal.timeout(5000) });
  return passCookie(upstream, new NextResponse(await upstream.text(), { status: upstream.status, headers: { "Content-Type": "application/json" } }));
}
export async function DELETE(request: Request) {
  if (!mutationIsSameOrigin(request)) return NextResponse.json({ error: { code: "INVALID_ORIGIN" } }, { status: 403 });
  const { baseUrl, serviceKey } = authBffConfig();
  const upstream = await fetch(`${baseUrl}/api/v3/auth/session`, { method: "DELETE", headers: { "X-MyBetOracle-V3-Key": serviceKey, ...forwardedCookie(request) }, cache: "no-store", signal: AbortSignal.timeout(4000) });
  return passCookie(upstream, new NextResponse(await upstream.text(), { status: upstream.status, headers: { "Content-Type": "application/json" } }));
}
