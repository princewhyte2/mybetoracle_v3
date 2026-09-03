import { NextResponse } from "next/server";

const VITALS = new Set(["CLS", "FCP", "FID", "INP", "LCP", "TTFB"]);

export async function POST(request: Request) {
  if (!String(request.headers.get("content-type") || "").includes("application/json")) return new NextResponse(null, { status: 415 });
  let value: unknown;
  try { value = await request.json(); } catch { return new NextResponse(null, { status: 400 }); }
  if (!value || typeof value !== "object" || Array.isArray(value)) return new NextResponse(null, { status: 400 });
  const metric = value as Record<string, unknown>;
  if (!VITALS.has(String(metric.name)) || typeof metric.value !== "number" || !Number.isFinite(metric.value)) return new NextResponse(null, { status: 400 });
  console.info(JSON.stringify({ event: "web_vital", name: metric.name, value: Number(metric.value.toFixed(4)), rating: String(metric.rating || "unknown"), navigationType: String(metric.navigationType || "unknown") }));
  return NextResponse.json({ accepted: true }, { headers: { "Cache-Control": "no-store" } });
}
