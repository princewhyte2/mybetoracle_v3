import type { NextConfig } from "next";

const LEGACY_LOCALES = ["en", "es", "fr", "de", "it", "pt"] as const;
type LegacyLocale = (typeof LEGACY_LOCALES)[number];

// V2's real per-locale route segments (mybetoracle_client/utils/routeData.js),
// mapped to the closest real V3 destination -- preserves crawl/ranking
// equity on indexed V2 URLs that have no direct V3 equivalent. Blog and
// `subscribe` are deliberately excluded (see docs/V3_SEO_STRATEGY.md).
const LEGACY_REDIRECTS: Array<{ segments: Record<LegacyLocale, string>; destination: string }> = [
  { segments: { en: "", es: "", fr: "", de: "", it: "", pt: "" }, destination: "/today" },
  { segments: { en: "accumulators", es: "acumuladores", fr: "accumulateurs", de: "akkumulatoren", it: "accumulatori", pt: "acumuladores" }, destination: "/multi-picks" },
  { segments: { en: "betslip", es: "boleto", fr: "coupon", de: "wettschein", it: "schedina", pt: "boletim" }, destination: "/betslip" },
  { segments: { en: "special", es: "especial", fr: "special", de: "spezial", it: "speciale", pt: "especial" }, destination: "/pick-analyzer" },
  { segments: { en: "recent-wins", es: "ultimas-victorias", fr: "dernieres-victoires", de: "letzte-gewinne", it: "ultime-vittorie", pt: "ultimas-vitorias" }, destination: "/results" },
  { segments: { en: "contact", es: "contacto", fr: "contact", de: "kontakt", it: "contatto", pt: "contacto" }, destination: "/support" },
  { segments: { en: "faq", es: "preguntas-frecuentes", fr: "foire-aux-questions", de: "haeufige-fragen", it: "domande-frequenti", pt: "perguntas-frequentes" }, destination: "/support" },
  { segments: { en: "how-to-use", es: "como-usar", fr: "comment-utiliser", de: "anleitung", it: "come-usare", pt: "como-usar" }, destination: "/support" },
  { segments: { en: "beginners-guide", es: "guia-principiantes", fr: "guide-debutant", de: "anfaenger-leitfaden", it: "guida-principianti", pt: "guia-iniciantes" }, destination: "/support" },
  { segments: { en: "about", es: "acerca-de", fr: "a-propos", de: "uber-uns", it: "chi-siamo", pt: "sobre" }, destination: "/today" },
  { segments: { en: "disclaimer", es: "descargo", fr: "avertissement", de: "haftungsausschluss", it: "note-legali", pt: "isencao-de-responsabilidade" }, destination: "/responsible-play" },
  { segments: { en: "terms-of-service", es: "terminos-servicio", fr: "conditions-utilisation", de: "nutzungsbedingungen", it: "termini-di-servizio", pt: "termos-de-servico" }, destination: "/terms" },
  { segments: { en: "privacy-policy", es: "politica-privacidad", fr: "politique-confidentialite", de: "datenschutz", it: "informativa-privacy", pt: "politica-de-privacidade" }, destination: "/privacy" },
  { segments: { en: "responsible-gambling", es: "juego-responsable", fr: "jeu-responsable", de: "verantwortungsvolles-spielen", it: "gioco-responsabile", pt: "jogo-responsavel" }, destination: "/responsible-play" },
  { segments: { en: "subscribe", es: "suscripcion", fr: "abonnement", de: "abonnieren", it: "abbonamento", pt: "assinatura" }, destination: "/today" },
];

// GSC-evidenced (last 3 months): these prediction-intent pages carry real,
// substantial traffic -- e.g. /fr/previsions/demain alone is 744 clicks /
// 31k impressions -- unlike the AI-generated league/team/prediction/result
// pages and the blog, which are deliberately NOT redirected (confirmed ~0
// clicks in the same report). Segments from V2's real
// utils/predictionIntentRoutes.ts, combined with each locale's predictions
// hub segment already used above.
const PREDICTION_INTENT_REDIRECTS: Array<{ segments: Record<LegacyLocale, string> }> = [
  { segments: { en: "predictions/today", es: "predicciones/hoy", fr: "previsions/aujourdhui", de: "vorhersagen/heute", it: "pronostici/oggi", pt: "previsoes/hoje" } },
  { segments: { en: "predictions/tomorrow", es: "predicciones/manana", fr: "previsions/demain", de: "vorhersagen/morgen", it: "pronostici/domani", pt: "previsoes/amanha" } },
  { segments: { en: "predictions/over-2-5-today", es: "predicciones/over-2-5-hoy", fr: "previsions/over-2-5-aujourdhui", de: "vorhersagen/over-2-5-heute", it: "pronostici/over-2-5-oggi", pt: "previsoes/over-2-5-hoje" } },
  { segments: { en: "predictions/btts-today", es: "predicciones/btts-hoy", fr: "previsions/btts-aujourdhui", de: "vorhersagen/btts-heute", it: "pronostici/btts-oggi", pt: "previsoes/btts-hoje" } },
];

// GSC-evidenced geo-hub pages (V2's utils/geoSeoConfig.ts) -- smaller but
// real signal (e.g. Kenya's hub page: 48 clicks). en/fr/pt only, matching
// V2's real GeoSeoLocale coverage -- V3 has no geo-hub of its own yet.
const GEO_HUB_KIND_SEGMENTS: Record<"en" | "fr" | "pt", Record<"hub" | "today" | "tomorrow" | "btts" | "over25", string>> = {
  en: { hub: "football-predictions", today: "predictions-today", tomorrow: "predictions-tomorrow", btts: "btts-today", over25: "over-2-5-today" },
  fr: { hub: "pronostics-football", today: "previsions-aujourdhui", tomorrow: "previsions-demain", btts: "btts-aujourdhui", over25: "over-2-5-aujourdhui" },
  pt: { hub: "previsoes-futebol", today: "previsoes-hoje", tomorrow: "previsoes-amanha", btts: "btts-hoje", over25: "over-2-5-hoje" },
};
const GEO_HUB_COUNTRIES: Array<{ locale: "en" | "fr" | "pt"; slug: string }> = [
  { locale: "en", slug: "nigeria" }, { locale: "en", slug: "ghana" }, { locale: "en", slug: "kenya" },
  { locale: "en", slug: "south-africa" }, { locale: "en", slug: "uganda" }, { locale: "en", slug: "tanzania" },
  { locale: "fr", slug: "senegal" }, { locale: "fr", slug: "cote-divoire" }, { locale: "fr", slug: "cameroun" },
  { locale: "pt", slug: "angola" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactCompiler: true,
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    // Portraits use the provider media CDN, never the paid football API.
    // The match mapper additionally restricts this to numeric player filenames.
    remotePatterns: [
      { protocol: "https", hostname: "media.api-sports.io", pathname: "/flags/**" },
      { protocol: "https", hostname: "media.api-sports.io", pathname: "/football/leagues/**" },
      { protocol: "https", hostname: "media.api-sports.io", pathname: "/football/teams/**" },
      { protocol: "https", hostname: "media.api-sports.io", port: "", pathname: "/football/players/*.png", search: "" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "flagcdn.com", pathname: "/**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/apple-app-site-association",
        destination: "/.well-known/apple-app-site-association",
      },
      {
        source: "/manifest.json",
        destination: "/manifest.webmanifest",
      },
    ];
  },
  async redirects() {
    return [
      ...LEGACY_LOCALES.flatMap((locale) => [
        {
          source: `/${locale}/predictions`,
          destination: `/${locale}/today`,
          permanent: true,
        },
        {
          source: `/${locale}/performance`,
          destination: `/${locale}/results`,
          permanent: true,
        },
      ]),
      ...LEGACY_REDIRECTS.flatMap(({ segments, destination }) =>
        LEGACY_LOCALES.map((locale) => ({
          source: segments[locale] ? `/${locale}/${segments[locale]}` : `/${locale}`,
          destination: `/${locale}${destination}`,
          permanent: true,
        })),
      ),
      ...PREDICTION_INTENT_REDIRECTS.flatMap(({ segments }) =>
        LEGACY_LOCALES.map((locale) => ({
          source: `/${locale}/${segments[locale]}`,
          destination: `/${locale}/${({ "predictions/tomorrow": "tomorrow", "predictions/over-2-5-today": "today/total-2-5", "predictions/btts-today": "today/both-teams-score" } as Record<string, string>)[segments.en] ?? "today"}`,
          permanent: true,
        })),
      ),
      ...GEO_HUB_COUNTRIES.flatMap(({ locale, slug }) =>
        Object.values(GEO_HUB_KIND_SEGMENTS[locale]).map((kindSegment) => ({
          source: `/${locale}/${slug}/${kindSegment}`,
          destination: `/${locale}/today`,
          permanent: true,
        })),
      ),
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-Accel-Buffering", value: "no" },
        ],
      },
      {
        source: "/.well-known/apple-app-site-association",
        headers: [
          { key: "Content-Type", value: "application/json" },
        ],
      },
      {
        source: "/apple-app-site-association",
        headers: [
          { key: "Content-Type", value: "application/json" },
        ],
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: [
          { key: "Content-Type", value: "application/json" },
        ],
      },
      {
        source: "/assetlinks.json",
        headers: [
          { key: "Content-Type", value: "application/json" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/firebase-messaging-sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
