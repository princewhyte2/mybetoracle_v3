import { NextResponse } from "next/server";
import { authBffConfig, forwardedCookie } from "@/features/auth/bff";

export async function GET(request:Request){
  const {baseUrl,serviceKey}=authBffConfig();
  const locale=new URL(request.url).searchParams.get("locale");const upstream=await fetch(`${baseUrl}/api/v3/saved${locale?`?locale=${encodeURIComponent(locale)}`:""}`,{headers:{"X-MyBetOracle-V3-Key":serviceKey,...forwardedCookie(request)},cache:"no-store",signal:AbortSignal.timeout(5000)});
  return new NextResponse(await upstream.text(),{status:upstream.status,headers:{"Content-Type":"application/json","Cache-Control":"private, no-store"}});
}
