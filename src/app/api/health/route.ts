import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    { schemaVersion: "mbo-web-health-v1", status: "up", service: "mybetoracle-v3-web" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
