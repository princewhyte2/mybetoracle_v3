export const locales = ["en", "es", "fr", "de", "it", "pt"] as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
