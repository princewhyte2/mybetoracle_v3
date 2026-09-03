import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import { isLocale } from "@/i18n/config";
import { WebVitals } from "@/components/observability/web-vitals";
import "../globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.mybetoracle.com"),
  applicationName: "MyBetOracle",
  title: { default: "MyBetOracle", template: "%s | MyBetOracle" },
  description: "Verified football intelligence, prediction markets, streak evidence and performance tracking.",
};

export default async function LocaleRootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  return (
    <html lang={isLocale(locale) ? locale : "en"}>
      <body className={`${manrope.variable} ${sora.variable}`}>{children}<WebVitals /></body>
    </html>
  );
}
