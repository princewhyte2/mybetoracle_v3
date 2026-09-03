import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { authBffConfig } from "./bff";
import type { WebSession } from "./contract";

export const getWebSession = cache(async (): Promise<WebSession | null> => {
  const jar = await cookies(); const session = jar.get("mbo_session")?.value;
  if (!session) return null;
  const { baseUrl, serviceKey } = authBffConfig();
  try {
    const response = await fetch(`${baseUrl}/api/v3/auth/session`, { headers: { "X-MyBetOracle-V3-Key": serviceKey, Cookie: `mbo_session=${encodeURIComponent(session)}` }, cache: "no-store", signal: AbortSignal.timeout(4000) });
    if (!response.ok) return null;
    return await response.json() as WebSession;
  } catch { return null; }
});
