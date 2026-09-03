import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${sora.variable}`}>{children}<WebVitals /></body>
    </html>
  );
}
