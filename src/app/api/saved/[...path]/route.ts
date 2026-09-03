import { NextResponse } from "next/server";
import { authBffConfig, forwardedCookie, mutationIsSameOrigin } from "@/features/auth/bff";

type Context={params:Promise<{path?:string[]}>};
async function proxy(request:Request,context:Context){
  if(request.method!=="GET"&&!mutationIsSameOrigin(request))return NextResponse.json({error:{code:"INVALID_ORIGIN"}},{status:403});
  const {baseUrl,serviceKey}=authBffConfig();const {path=[]}=await context.params;const suffix=path.map(encodeURIComponent).join("/");const url=`${baseUrl}/api/v3/saved${suffix?`/${suffix}`:""}`;
  const contentType=request.headers.get("content-type");const headers:Record<string,string>={"X-MyBetOracle-V3-Key":serviceKey,...forwardedCookie(request)};if(contentType)headers["Content-Type"]=contentType;
  const body=request.method==="GET"||request.method==="HEAD"?undefined:await request.text();
  const upstream=await fetch(url,{method:request.method,headers,body,cache:"no-store",signal:AbortSignal.timeout(5000)});
  return new NextResponse(await upstream.text(),{status:upstream.status,headers:{"Content-Type":"application/json","Cache-Control":"private, no-store"}});
}
export const GET=proxy;export const PUT=proxy;export const DELETE=proxy;
