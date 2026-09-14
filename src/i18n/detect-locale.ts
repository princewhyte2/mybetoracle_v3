import { locales, type Locale } from "./config";

// Small, dependency-free Accept-Language negotiation -- only 6 target
// locales, so a full negotiator/intl-localematcher dependency isn't
// warranted. Ranks entries by their explicit q value (default 1) and
// matches on the base language subtag, so "pt-BR;q=0.9" still matches "pt".
export function detectLocale(acceptLanguage: string): Locale {
  const ranked = acceptLanguage
    .split(",")
    .map((entry) => {
      const [tag, qPart] = entry.trim().split(";q=");
      const quality = qPart ? Number.parseFloat(qPart) : 1;
      return { lang: tag.trim().toLowerCase().split("-")[0], quality: Number.isFinite(quality) ? quality : 1 };
    })
    .sort((left, right) => right.quality - left.quality);
  for (const { lang } of ranked) {
    if ((locales as readonly string[]).includes(lang)) return lang as Locale;
  }
  return "en";
}
