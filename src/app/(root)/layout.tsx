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
  verification: {
    google: "googlee80a038678157d65",
  },
  other: {
    "google-adsense-account": "ca-pub-8194555862221451",
  },
  openGraph: {
    type: "website",
    siteName: "MyBetOracle",
    title: "MyBetOracle - Football Intelligence & Multi-Picks",
    description: "Verified football intelligence, prediction markets, streak evidence and performance tracking.",
    images: [{
      url: "https://res.cloudinary.com/codewithwhyte/image/upload/c_crop,w_1200,h_630/v1692965057/oracle.png",
      width: 1200,
      height: 630,
      alt: "MyBetOracle",
    }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mybetoracle",
    creator: "@mybetoracle",
    title: "MyBetOracle - Football Intelligence & Multi-Picks",
    description: "Verified football intelligence, prediction markets, streak evidence and performance tracking.",
    images: ["https://res.cloudinary.com/codewithwhyte/image/upload/c_crop,w_1200,h_630/v1692965057/oracle.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/maskable_icon_x192.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${sora.variable}`}>{children}<WebVitals /></body>
    </html>
  );
}
