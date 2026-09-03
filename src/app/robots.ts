import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mybetoracle.com";
  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/*/saved", "/*/profile", "/*/settings", "/*/login", "/*/signup"],
    }],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
