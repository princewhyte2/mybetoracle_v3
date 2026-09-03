import "server-only";

export function authBffConfig() {
  const baseUrl = process.env.MYBETORACLE_SERVER_BASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.MYBETORACLE_SERVER_SERVICE_KEY;
  if (!baseUrl || !serviceKey || serviceKey.length < 32) throw new Error("MyBetOracle Server auth configuration is incomplete");
  return { baseUrl, serviceKey };
}

export function forwardedCookie(request: Request): Record<string, string> {
  const value = request.headers.get("cookie");
  return value ? { Cookie: value } : {};
}

export function mutationIsSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const expected = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  try { return new URL(origin).origin === new URL(expected).origin; } catch { return false; }
}
