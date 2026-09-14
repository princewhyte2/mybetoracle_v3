import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { detectLocale } from "@/i18n/detect-locale";

export const dynamic = "force-dynamic";

export default async function Home() {
  const acceptLanguage = (await headers()).get("accept-language") ?? "";
  redirect(`/${detectLocale(acceptLanguage)}/today`);
}
