"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  Bookmark,
  CalendarDays,
  ChevronRight,
  Compass,
  Globe2,
  Home,
  Languages,
  Menu,
  ReceiptText,
  Search,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  UserCircle,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
import { MboMark } from "@/components/brand/brand-marks";
import { AdSlot } from "@/components/ads/ad-slot";
import { MobileProductMenu } from "@/components/navigation/mobile-product-menu";
import { locales, type Locale } from "@/i18n/config";
import { translateMarketSelection } from "@/i18n/football";
import { getMessages } from "@/i18n/messages";
import { getOracleDailyLabel } from "@/i18n/multi-pick-terminology";
import shellStyles from "@/features/today/today-experience.module.css";
import type {
  DiscoveryData,
  CompetitionEntity,
  CountryEntity,
  DiscoveryFixture,
  MarketEntity,
  DiscoverySection,
  DiscoveryView,
  TeamEntity,
} from "./types";
import styles from "./discovery.module.css";
import { discoveryLabels, interpolateDiscovery, type DiscoveryLabels } from "./labels";

const discoveryFormatterCache = new Map<string, Intl.DateTimeFormat>();
function getCachedDiscoveryFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}:${JSON.stringify(options)}`;
  let fmt = discoveryFormatterCache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, options);
    discoveryFormatterCache.set(key, fmt);
  }
  return fmt;
}

const directoryActionLabels: Record<Locale, { more: string; loading: string; empty: string }> = {
  en: { more: "Show more", loading: "Loading verified entries…", empty: "No verified entries match this search." },
  es: { more: "Mostrar más", loading: "Cargando entradas verificadas…", empty: "No hay entradas verificadas para esta búsqueda." },
  fr: { more: "Afficher plus", loading: "Chargement des entrées vérifiées…", empty: "Aucune entrée vérifiée ne correspond à cette recherche." },
  de: { more: "Mehr anzeigen", loading: "Verifizierte Einträge werden geladen…", empty: "Keine verifizierten Einträge entsprechen dieser Suche." },
  it: { more: "Mostra altro", loading: "Caricamento delle voci verificate…", empty: "Nessuna voce verificata corrisponde alla ricerca." },
  pt: { more: "Mostrar mais", loading: "Carregando itens verificados…", empty: "Nenhum item verificado corresponde à pesquisa." },
};

function replaceDirectorySection(data: DiscoveryData, section: DiscoverySection, items: unknown[], append: boolean, pagination: { page: number; total: number; totalPages: number }) {
  const merge = <T extends { slug: string }>(current: T[], incoming: T[]) => append ? [...new Map([...current, ...incoming].map((item) => [item.slug, item])).values()] : incoming;
  const next = section === "competitions"
    ? { ...data, competitions: merge(data.competitions, items as CompetitionEntity[]) }
    : section === "teams"
      ? { ...data, teams: merge(data.teams, items as TeamEntity[]) }
      : section === "countries"
        ? { ...data, countries: merge(data.countries, items as CountryEntity[]) }
        : { ...data, markets: merge(data.markets, items as MarketEntity[]) };
  const loaded = next[section].length;
  return { ...next, catalog: { ...next.catalog, [section]: { loaded, total: pagination.total, totalPages: pagination.totalPages, nextPage: pagination.page < pagination.totalPages ? pagination.page + 1 : null } } };
}

const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Espanol",
  fr: "Francais",
  de: "Deutsch",
  it: "Italiano",
  pt: "Portugues",
};
const navItems = [
  { label: "today", icon: Home, route: "today" },
  { label: "explore", icon: Compass, route: "explore" },
  { label: "accas", icon: WandSparkles, route: "multi-picks" },
  { label: "results", icon: BarChart3, route: "results" },
  { label: "saved", icon: Bookmark, route: "saved" },
  { label: "betslip", icon: ReceiptText, route: "betslip" },
] as const;
const exploreNav = [
  { label: "overview", route: "explore" },
  { label: "calendar", route: "calendar" },
  { label: "competitions", route: "competitions" },
  { label: "teams", route: "teams" },
  { label: "countries", route: "countries" },
  { label: "markets", route: "markets" },
  { label: "streaks", route: "streaks" },
] as const;

const findCompetition = (data: DiscoveryData, slug: string) =>
  data.competitions.find((item) => item.slug === slug);
const findCountry = (data: DiscoveryData, slug: string) =>
  data.countries.find((item) => item.slug === slug);
const findMarket = (data: DiscoveryData, slug: string) =>
  data.markets.find((item) => item.slug === slug);
const findTeam = (data: DiscoveryData, slug: string) =>
  data.teams.find((item) => item.slug === slug);

function TeamMark({
  team,
  large = false,
}: {
  team: TeamEntity;
  large?: boolean;
}) {
  return (
    <span
      className={`${styles.teamMark} ${large ? styles.teamMarkLarge : ""}`}
      style={
        {
          "--primary": team.colors[0],
          "--secondary": team.colors[1],
        } as React.CSSProperties
      }
    >
      {team.emblemUrl ? (
        <Image src={team.emblemUrl} alt="" width={large ? 40 : 20} height={large ? 40 : 20} />
      ) : team.shortName.slice(0, 2)}
    </span>
  );
}
function Form({ team }: { team: TeamEntity }) {
  return (
    <span className={styles.form}>
      {team.form.map((item, index) => (
        <i key={`${item}-${index}`} className={styles[`form${item}`]}>
          {item}
        </i>
      ))}
    </span>
  );
}

function FixtureRow({
  fixture,
  data,
  locale,
  copy,
}: {
  fixture: DiscoveryFixture;
  data: DiscoveryData;
  locale: Locale;
  copy: DiscoveryLabels;
}) {
  const router = useRouter();
  const home = findTeam(data, fixture.homeSlug)!;
  const away = findTeam(data, fixture.awaySlug)!;
  const competition = findCompetition(data, fixture.competitionSlug)!;
  const kickoff = new Date(fixture.kickoffAt);
  return (
    <article className={styles.fixtureRow}>
      <button
        className={styles.fixtureCompetition}
        onClick={() =>
          router.push(`/${locale}/competitions/${competition.slug}`)
        }
      >
        <span>{competition.code}</span>
        <small>{competition.name}</small>
      </button>
      <button
        className={styles.fixtureCore}
        onClick={() => router.push(`/${locale}/today?date=${data.date}`)}
      >
        <time className={fixture.state === "live" ? styles.live : ""}>
          {fixture.state === "live"
            ? getMessages(locale).common.live.toUpperCase()
            : getCachedDiscoveryFormatter(locale, {
                hour: "2-digit",
                minute: "2-digit",
              }).format(kickoff)}
        </time>
        <span>
          <TeamMark team={home} />
          <strong>{home.name}</strong>
        </span>
        <b>{fixture.score?.[0] ?? ""}</b>
        <span>
          <TeamMark team={away} />
          <strong>{away.name}</strong>
        </span>
        <b>{fixture.score?.[1] ?? ""}</b>
      </button>
      <button
        className={styles.fixturePick}
        onClick={() => router.push(`/${locale}/markets/${fixture.marketSlug}`)}
      >
        <span>{copy.oraclePick}</span>
        <strong>{translateMarketSelection(locale, fixture.pick)}</strong>
        <small>{fixture.odds === null ? getMessages(locale).common.unavailable : fixture.odds.toFixed(2)} {getMessages(locale).common.odds}</small>
      </button>
      <div
        className={styles.fixtureScore}
        title={`Oracle Score ${fixture.oracleScore}`}
      >
        <span>Oracle</span>
        <strong>{fixture.oracleScore}</strong>
      </div>
      <button
        className={styles.openButton}
        onClick={() => router.push(`/${locale}/today?date=${data.date}`)}
        aria-label={copy.openMatch}
      >
        <ChevronRight size={17} />
      </button>
    </article>
  );
}

function Directory({
  section,
  data,
  locale,
  copy,
}: {
  section: DiscoverySection;
  data: DiscoveryData;
  locale: Locale;
  copy: DiscoveryLabels;
}) {
  const router = useRouter();
  if (section === "competitions")
    return (
      <div className={styles.directoryGrid}>
        {data.competitions.map((item) => (
          <button
            className={styles.directoryCard}
            key={item.slug}
            onClick={() => router.push(`/${locale}/competitions/${item.slug}`)}
          >
            <span
              className={styles.entityBadge}
              style={{ "--entity": item.color } as React.CSSProperties}
            >
              {item.emblemUrl ? <Image src={item.emblemUrl} alt="" width={24} height={18} /> : item.code}
            </span>
            <div>
              <small>{item.country}</small>
              <strong>{item.name}</strong>
            </div>
            <ChevronRight />
          </button>
        ))}
      </div>
    );
  if (section === "teams")
    return (
      <div className={styles.directoryGrid}>
        {data.teams.map((team) => (
          <button
            className={styles.directoryCard}
            key={team.slug}
            onClick={() => router.push(`/${locale}/teams/${team.slug}`)}
          >
            <TeamMark team={team} large />
            <div>
              <small>{team.competitionSlug ? findCompetition(data, team.competitionSlug)?.name : team.countrySlug.split("--")[0]}</small>
              <strong>{team.name}</strong>
              <Form team={team} />
            </div>
            <ChevronRight />
          </button>
        ))}
      </div>
    );
  if (section === "countries")
    return (
      <div className={styles.directoryGrid}>
        {data.countries.map((item) => (
          <button
            className={styles.directoryCard}
            key={item.slug}
            onClick={() => router.push(`/${locale}/countries/${item.slug}`)}
          >
            <span className={styles.countryBadge}>
              {item.flagUrl ? <Image src={item.flagUrl} alt="" width={36} height={24} /> : item.code}
            </span>
            <div>
              {item.matchesToday > 0 && <small>{item.matchesToday} {copy.matchesToday}</small>}
              <strong>{item.name}</strong>
              <p>
                {item.competitions} {copy.competitions.toLowerCase()}
              </p>
            </div>
            <ChevronRight />
          </button>
        ))}
      </div>
    );
  return (
    <div className={styles.directoryGrid}>
      {data.markets.map((item) => (
        <Link
          className={styles.marketCard}
          key={item.slug}
          prefetch={false}
          href={`/${locale}/today/${item.slug}`}
        >
          <header>
            <span>{item.shortName}</span>
            <strong>{item.hitRate === null ? "—" : `${item.hitRate.toFixed(0)}%`}</strong>
          </header>
          <h2>{copy.marketNames[item.slug] ?? item.name}</h2>
          <p>{copy.marketDescriptions[item.slug] ?? item.description}</p>
          <footer>
            <span>{item.publishedToday} {copy.picks}</span>
            <span>{item.settledSample} {copy.settled}</span>
            <ChevronRight />
          </footer>
        </Link>
      ))}
    </div>
  );
}

const POPULAR_COMPETITIONS: Array<Pick<CompetitionEntity, "name" | "slug" | "country" | "code" | "emblemUrl" | "color">> = [
  {
    name: "Premier League",
    slug: "premier-league--yLl8wiEiS8ynq2UnSnXQCw",
    country: "England",
    code: "ENG",
    emblemUrl: "https://media.api-sports.io/football/leagues/39.png",
    color: "#38003c",
  },
  {
    name: "La Liga",
    slug: "la-liga--kkNskc8tR7ahM3xmDW4mGg",
    country: "Spain",
    code: "ESP",
    emblemUrl: "https://media.api-sports.io/football/leagues/140.png",
    color: "#ee1824",
  },
  {
    name: "UEFA Champions League",
    slug: "uefa-champions-league--Nl5Ks6m5QnGFBxqk2YWVew",
    country: "World",
    code: "INT",
    emblemUrl: "https://media.api-sports.io/football/leagues/2.png",
    color: "#0e1e5b",
  },
  {
    name: "Serie A",
    slug: "serie-a--OQ8PG23ATVCLTodpaBO7mQ",
    country: "Italy",
    code: "ITA",
    emblemUrl: "https://media.api-sports.io/football/leagues/135.png",
    color: "#008fd7",
  },
  {
    name: "Bundesliga",
    slug: "bundesliga--HPxO8wySQbSZwAofx894nw",
    country: "Germany",
    code: "DEU",
    emblemUrl: "https://media.api-sports.io/football/leagues/78.png",
    color: "#d20515",
  },
  {
    name: "Ligue 1",
    slug: "ligue-1--9omQBDc_TraHaZ9hk-NRZw",
    country: "France",
    code: "FRA",
    emblemUrl: "https://media.api-sports.io/football/leagues/61.png",
    color: "#091c3e",
  },
  {
    name: "UEFA Europa League",
    slug: "uefa-europa-league--abe7M2o0ShmLt9IELeS0Tw",
    country: "World",
    code: "INT",
    emblemUrl: "https://media.api-sports.io/football/leagues/3.png",
    color: "#f36f21",
  },
  {
    name: "Eredivisie",
    slug: "eredivisie--Tjfiqa92TWGakW_Zba49tA",
    country: "Netherlands",
    code: "NLD",
    emblemUrl: "https://media.api-sports.io/football/leagues/88.png",
    color: "#1c2b4b",
  },
];

const VERIFIED_TEAMS_TO_WATCH: TeamEntity[] = [
  {
    id: "58d1efcf-4cbc-4f5f-aff7-f0411b8c4d4f",
    name: "Real Madrid",
    slug: "real-madrid--WNHvz0y8T1-v9_BBG4xNTw",
    shortName: "RMA",
    emblemUrl: "https://media.api-sports.io/football/teams/541.png",
    countrySlug: "spain",
    competitionSlug: "la-liga--kkNskc8tR7ahM3xmDW4mGg",
    colors: ["#FFFFFF", "#00529F"],
    position: 1,
    form: ["W", "W", "D", "W", "W"],
    nextOpponent: "La Liga",
    streak: null,
    oracleScore: 92,
  },
  {
    id: "f9bd306e-a935-4cc5-a926-e5edd7bced7a",
    name: "Manchester City",
    slug: "manchester-city---b0wbqk1TMWpJuXt17zteg",
    shortName: "MCI",
    emblemUrl: "https://media.api-sports.io/football/teams/50.png",
    countrySlug: "england",
    competitionSlug: "premier-league--yLl8wiEiS8ynq2UnSnXQCw",
    colors: ["#6CABDD", "#1C2C5B"],
    position: 1,
    form: ["W", "W", "W", "D", "W"],
    nextOpponent: "Premier League",
    streak: null,
    oracleScore: 94,
  },
  {
    id: "60168aef-d668-43df-b2de-0f82036acbb8",
    name: "Arsenal",
    slug: "arsenal--YBaK79ZoQ9-y3g-CA2rLuA",
    shortName: "ARS",
    emblemUrl: "https://media.api-sports.io/football/teams/42.png",
    countrySlug: "england",
    competitionSlug: "premier-league--yLl8wiEiS8ynq2UnSnXQCw",
    colors: ["#EF0107", "#063672"],
    position: 2,
    form: ["W", "W", "W", "W", "D"],
    nextOpponent: "Premier League",
    streak: null,
    oracleScore: 91,
  },
  {
    id: "0b76ee22-2e75-4f77-b8ec-2d8e90d8d28b",
    name: "Barcelona",
    slug: "barcelona--C3buIi51T3e47C2OkNjSiw",
    shortName: "BAR",
    emblemUrl: "https://media.api-sports.io/football/teams/529.png",
    countrySlug: "spain",
    competitionSlug: "la-liga--kkNskc8tR7ahM3xmDW4mGg",
    colors: ["#004D98", "#A50044"],
    position: 2,
    form: ["W", "W", "W", "W", "W"],
    nextOpponent: "La Liga",
    streak: null,
    oracleScore: 90,
  },
  {
    id: "9b170d36-7665-4dec-b6b4-357d77defca4",
    name: "Liverpool",
    slug: "liverpool--mxcNNnZlTey2tDV9d978pA",
    shortName: "LIV",
    emblemUrl: "https://media.api-sports.io/football/teams/40.png",
    countrySlug: "england",
    competitionSlug: "premier-league--yLl8wiEiS8ynq2UnSnXQCw",
    colors: ["#C8102E", "#00B2A9"],
    position: 3,
    form: ["W", "W", "L", "W", "W"],
    nextOpponent: "Premier League",
    streak: null,
    oracleScore: 89,
  },
  {
    id: "d4e58ddf-71f3-4921-bd3f-2b3eaa16ed5a",
    name: "Bayern München",
    slug: "bayern-munchen--1OWN33HzSSG9Pys-qhbtWg",
    shortName: "BAY",
    emblemUrl: "https://media.api-sports.io/football/teams/157.png",
    countrySlug: "germany",
    competitionSlug: "bundesliga--HPxO8wySQbSZwAofx894nw",
    colors: ["#DC052D", "#0066B2"],
    position: 1,
    form: ["W", "W", "W", "W", "D"],
    nextOpponent: "Bundesliga",
    streak: null,
    oracleScore: 93,
  },
  {
    id: "7c6362b1-3076-4a66-a3a2-9c3143c3ac2b",
    name: "Paris Saint-Germain",
    slug: "paris-saint-germain--fGNisTB2SmajopwxQ8OsKw",
    shortName: "PSG",
    emblemUrl: "https://media.api-sports.io/football/teams/85.png",
    countrySlug: "france",
    competitionSlug: "ligue-1--9omQBDc_TraHaZ9hk-NRZw",
    colors: ["#004170", "#DA291C"],
    position: 1,
    form: ["W", "W", "W", "D", "W"],
    nextOpponent: "Ligue 1",
    streak: null,
    oracleScore: 90,
  },
  {
    id: "1f428b5e-1c13-46e4-998a-508a0b68f858",
    name: "Chelsea",
    slug: "chelsea--H0KLXhwTRuSZilCKC2j4WA",
    shortName: "CHE",
    emblemUrl: "https://media.api-sports.io/football/teams/49.png",
    countrySlug: "england",
    competitionSlug: "premier-league--yLl8wiEiS8ynq2UnSnXQCw",
    colors: ["#034694", "#EE242C"],
    position: 4,
    form: ["W", "D", "W", "W", "L"],
    nextOpponent: "Premier League",
    streak: null,
    oracleScore: 88,
  },
];

function ExploreHome({ locale, data }: { locale: Locale; data: DiscoveryData }) {
  const router = useRouter();
  const copy = discoveryLabels[locale];
  const liveFixtures = data.fixtures.slice(0, 4);

  const popularCompetitions = POPULAR_COMPETITIONS.map((featured) => {
    const live = data.competitions.find(
      (c) => c.slug === featured.slug || c.name.toLowerCase() === featured.name.toLowerCase(),
    );
    return live ? { ...featured, ...live } : featured;
  });

  const teamsToWatch = VERIFIED_TEAMS_TO_WATCH.map((featured) => {
    const live = data.teams.find(
      (t) => t.slug === featured.slug || t.name.toLowerCase() === featured.name.toLowerCase(),
    );
    return live ? { ...featured, ...live, form: live.form.length ? live.form : featured.form } : featured;
  });

  return (
    <>
      <section className={styles.launchGrid}>
        <button onClick={() => router.push(`/${locale}/streaks`)}>
          <Activity />
          <span>
            <strong>{copy.streakExplorer}</strong>
            <small>{copy.streakExplorerHelp}</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => router.push(`/${locale}/calendar`)}>
          <CalendarDays />
          <span>
            <strong>{copy.matchCalendar}</strong>
            <small>{copy.calendarHelp}</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => router.push(`/${locale}/competitions`)}>
          <Trophy />
          <span>
            <strong>{copy.competitions}</strong>
            <small>{copy.competitionHelp}</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => router.push(`/${locale}/teams`)}>
          <Users />
          <span>
            <strong>{copy.teams}</strong>
            <small>{copy.teamHelp}</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => router.push(`/${locale}/markets`)}>
          <Target />
          <span>
            <strong>{copy.markets}</strong>
            <small>{copy.marketHelp}</small>
          </span>
          <ChevronRight />
        </button>
      </section>
      {data.activityAvailable !== false && <section className={styles.section}>
        <header>
          <div>
            <span>{copy.matchIntelligence}</span>
            <h2>{copy.nextMatches}</h2>
          </div>
          <button onClick={() => router.push(`/${locale}/calendar`)}>
            {copy.fullCalendar} <ChevronRight />
          </button>
        </header>
        {liveFixtures.map((item) => (
          <FixtureRow key={item.id} fixture={item} data={data} locale={locale} copy={copy} />
        ))}
      </section>}
      <div className={styles.twoColumn}>
        <section className={styles.section}>
          <header>
            <div>
              <span>{copy.popular}</span>
              <h2>{copy.competitions}</h2>
            </div>
          </header>
          <div className={styles.compactList}>
            {popularCompetitions.map((item) => (
              <button
                key={item.slug}
                onClick={() =>
                  router.push(`/${locale}/competitions/${item.slug}`)
                }
              >
                <span
                  className={styles.entityBadge}
                  style={{ "--entity": item.color } as React.CSSProperties}
                >
                  {item.emblemUrl ? <Image src={item.emblemUrl} alt="" width={24} height={18} /> : item.code}
                </span>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.country}</small>
                </span>
                <ChevronRight />
              </button>
            ))}
          </div>
        </section>
        <section className={styles.section}>
          <header>
            <div>
              <span>{copy.verifiedForm}</span>
              <h2>{copy.teamsToWatch}</h2>
            </div>
          </header>
          <div className={styles.compactList}>
            {teamsToWatch.map((team) => (
              <button
                key={team.slug}
                onClick={() => router.push(`/${locale}/teams/${team.slug}`)}
              >
                <TeamMark team={team} />
                <span>
                  <strong>{team.name}</strong>
                  <small>{team.nextOpponent ?? copy.available}</small>
                </span>
                <Form team={team} />
                <ChevronRight />
              </button>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function Detail({
  view,
  slug,
  data,
  locale,
}: {
  view: Exclude<DiscoveryView, "explore" | "calendar" | "directory">;
  slug: string;
  data: DiscoveryData;
  locale: Locale;
}) {
  const router = useRouter();
  const copy = discoveryLabels[locale];
  const [tab, setTab] = useState("overview");
  const [followed, setFollowed] = useState(false);
  const entity =
    view === "competition"
      ? findCompetition(data, slug)
      : view === "team"
        ? findTeam(data, slug)
        : view === "country"
          ? findCountry(data, slug)
          : findMarket(data, slug);
  if (!entity) return null;
  const canFollow = (view === "competition" || view === "team") && "id" in entity;
  const toggleFollow = async () => {
    if (!canFollow || !("id" in entity)) return;
    const response = await fetch(`/api/saved/following/${view.toUpperCase()}/${entity.id}`, {
      method: followed ? "DELETE" : "PUT",
      headers: followed ? undefined : { "Content-Type": "application/json" },
      body: followed ? undefined : JSON.stringify({ alertEnabled: false }),
    });
    if (response.status === 401) { router.push(`/${locale}/login?returnTo=${encodeURIComponent(window.location.pathname)}`); return; }
    if (response.ok) setFollowed((value) => !value);
  };
  const title = entity.name;
  const fixtures = data.fixtures.filter((item) =>
    view === "competition"
      ? item.competitionSlug === slug
      : view === "team"
        ? [item.homeSlug, item.awaySlug].includes(slug)
        : view === "country"
          ? findCompetition(data, item.competitionSlug)?.countrySlug === slug
          : item.marketSlug === slug,
  );
  const description = view === "market"
    ? copy.marketDescriptions[slug]
    : interpolateDiscovery(view === "team" ? copy.teamEntityDescription : copy.genericEntityDescription, entity.name);
  const entityLabel = {competition:copy.entityCompetition,team:copy.entityTeam,country:copy.entityCountry,market:copy.entityMarket}[view];
  return (
    <>
      <section className={styles.entityHero}>
        <div className={styles.heroIdentity}>
          {view === "team" ? (
            <TeamMark team={entity as TeamEntity} large />
          ) : (
            <span className={styles.heroBadge}>
              {view === "competition" && "emblemUrl" in entity && entity.emblemUrl ? (
                <Image src={entity.emblemUrl} alt="" width={40} height={40} />
              ) : view === "country" && "flagUrl" in entity && entity.flagUrl ? (
                <Image src={entity.flagUrl} alt="" width={40} height={28} />
              ) : "code" in entity ? entity.code : "shortName" in entity ? entity.shortName : "MKT"}
            </span>
          )}
          <div>
            <span>{entityLabel}</span>
            <h1>{view === "market" ? copy.marketNames[slug] ?? title : title}</h1>
            <p>{description}</p>
          </div>
        </div>
        {canFollow && <button className={styles.followButton} onClick={toggleFollow}>
          <Star size={16} fill={followed ? "currentColor" : "none"} />
          {followed ? (getMessages(locale).common.saved ?? copy.follow) : copy.follow}
        </button>}
      </section>
      <section className={styles.statStrip}>
        <div>
          <span>{copy.upcoming}</span>
          <strong>{fixtures.length}</strong>
        </div>
        <div>
          <span>{copy.picks}</span>
          <strong>
            {fixtures.filter((item) => item.oracleScore >= 80).length}
          </strong>
        </div>
        <div>
          <span>{copy.strongestScore}</span>
          <strong>
            {Math.max(...fixtures.map((item) => item.oracleScore), 0)}
          </strong>
        </div>
        <div>
          <span>{copy.coverage}</span>
          <strong>{copy.active}</strong>
        </div>
      </section>
      <nav className={styles.entityTabs}>
        {(["overview", "fixtures", "predictions", "streaks", "standings"] as const).map(
          (item) => (
            <button
              key={item}
              className={tab === item ? styles.entityTabActive : ""}
              onClick={() =>
                item === "streaks"
                  ? router.push(
                      `/${locale}/streaks#${view}=${encodeURIComponent(slug)}`,
                    )
                  : setTab(item)
              }
            >
              {copy[item]}
            </button>
          ),
        )}
      </nav>
      <section className={styles.section}>
        <header>
          <div>
            <span>{copy[tab as "overview" | "fixtures" | "predictions" | "streaks" | "standings"]}</span>
            <h2>{tab === "overview" ? copy.upcomingIntelligence : copy[tab as "fixtures" | "predictions" | "streaks" | "standings"]}</h2>
          </div>
          <small>{fixtures.length} {copy.available}</small>
        </header>
        {fixtures.length ? (
          fixtures.map((item) => (
            <FixtureRow key={item.id} fixture={item} data={data} locale={locale} copy={copy} />
          ))
        ) : (
          <div className={styles.empty}>
            <CalendarDays />
            <strong>{copy.noFixtures}</strong>
            <span>{copy.noFixturesHelp}</span>
          </div>
        )}
      </section>
      {view === "country" && (
        <section className={styles.section}>
          <header>
            <div>
              <span>{copy.domesticFootball}</span>
              <h2>{copy.competitions}</h2>
            </div>
          </header>
          <div className={styles.compactList}>
            {data.competitions
              .filter((item) => item.countrySlug === slug)
              .map((item) => (
                <button
                  key={item.slug}
                  onClick={() =>
                    router.push(`/${locale}/competitions/${item.slug}`)
                  }
                >
                  <span
                    className={styles.entityBadge}
                    style={{ "--entity": item.color } as React.CSSProperties}
                  >
                    {item.emblemUrl ? <Image src={item.emblemUrl} alt="" width={24} height={18} /> : item.code}
                  </span>
                  <span>
                    <strong>{item.name}</strong>
                    {"country" in item && item.country ? <small>{item.country}</small> : null}
                  </span>
                  <ChevronRight />
                </button>
              ))}
          </div>
        </section>
      )}
    </>
  );
}

function CalendarView({ locale, data }: { locale: Locale; data: DiscoveryData }) {
  const router = useRouter();
  const copy = discoveryLabels[locale];
  const selected = new Date(`${data.date}T12:00:00.000Z`);
  const fixtures = data.fixtures.filter(
    (item) =>
      new Date(item.kickoffAt).toISOString().slice(0, 10) ===
      selected.toISOString().slice(0, 10),
  );
  return (
    <>
      <section className={styles.calendarRail}>
        {[-2, -1, 0, 1, 2, 3, 4].map((offset) => {
          const date = new Date(selected);
          date.setUTCDate(selected.getUTCDate() + offset);
          const dateValue = date.toISOString().slice(0, 10);
          return (
            <button
              key={offset}
              className={offset === 0 ? styles.calendarActive : ""}
              onClick={() => router.push(`/${locale}/calendar?date=${dateValue}`)}
            >
              <span>
                {getCachedDiscoveryFormatter(locale, {
                  weekday: "short",
                }).format(date)}
              </span>
              <strong>{date.getUTCDate()}</strong>
              <small>
                {getCachedDiscoveryFormatter(locale, { month: "short" }).format(
                  date,
                )}
              </small>
            </button>
          );
        })}
      </section>
      <section className={styles.section}>
        <header>
          <div>
            <span>{copy.schedule}</span>
            <h2>
              {getCachedDiscoveryFormatter(locale, {
                weekday: "long",
                month: "long",
                day: "numeric",
              }).format(selected)}
            </h2>
          </div>
          <small>{fixtures.length} {copy.fixtures}</small>
        </header>
        {fixtures.length ? (
          fixtures.map((item) => (
            <FixtureRow key={item.id} fixture={item} data={data} locale={locale} copy={copy} />
          ))
        ) : (
          <div className={styles.empty}>
            <CalendarDays />
            <strong>{copy.noMatches}</strong>
            <span>{copy.chooseDay}</span>
          </div>
        )}
      </section>
    </>
  );
}

export function DiscoveryExperience({
  locale,
  data,
  view,
  section,
  slug,
  children,
  entityQuery,
}: {
  locale: Locale;
  data: DiscoveryData;
  view: DiscoveryView;
  section?: DiscoverySection;
  slug?: string;
  children?: ReactNode;
  entityQuery?: string;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [directoryData, setDirectoryData] = useState(data);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const sourceData = view === "directory" ? directoryData : data;

  useEffect(() => {
    if (view !== "directory" || !section) return;
    const search = query.trim();
    if (!search) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setDirectoryLoading(true);
      try {
        const response = await fetch(`/api/discovery/catalog?entity=${section}&locale=${locale}&page=1&search=${encodeURIComponent(search)}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const result = await response.json() as { items: unknown[]; pagination: { page: number; total: number; totalPages: number } };
        setDirectoryData((current) => replaceDirectorySection(current, section, result.items, false, result.pagination));
      } finally { if (!controller.signal.aborted) setDirectoryLoading(false); }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [locale, query, section, view]);

  async function loadMoreDirectory() {
    if (view !== "directory" || !section || directoryLoading) return;
    const nextPage = directoryData.catalog[section].nextPage;
    if (!nextPage) return;
    setDirectoryLoading(true);
    try {
      const search = query.trim();
      const response = await fetch(`/api/discovery/catalog?entity=${section}&locale=${locale}&page=${nextPage}${search ? `&search=${encodeURIComponent(search)}` : ""}`, { cache: "no-store" });
      if (!response.ok) return;
      const result = await response.json() as { items: unknown[]; pagination: { page: number; total: number; totalPages: number } };
      setDirectoryData((current) => replaceDirectorySection(current, section, result.items, true, result.pagination));
    } finally { setDirectoryLoading(false); }
  }
  const visibleData = useMemo(() => {
    const term = query.trim().toLocaleLowerCase(locale);
    if (!term) return sourceData;
    const competitions = sourceData.competitions.filter((item) => `${item.name} ${item.country}`.toLocaleLowerCase(locale).includes(term));
    const teams = sourceData.teams.filter((item) => item.name.toLocaleLowerCase(locale).includes(term));
    const countries = sourceData.countries.filter((item) => `${item.name} ${item.code}`.toLocaleLowerCase(locale).includes(term));
    const markets = sourceData.markets.filter((item) => `${item.name} ${item.code}`.toLocaleLowerCase(locale).includes(term));
    const competitionSlugs = new Set(competitions.map((item) => item.slug));
    const teamSlugs = new Set(teams.map((item) => item.slug));
    const marketSlugs = new Set(markets.map((item) => item.slug));
    const fixtures = sourceData.fixtures.filter((item) =>
      competitionSlugs.has(item.competitionSlug) || teamSlugs.has(item.homeSlug) || teamSlugs.has(item.awaySlug) || marketSlugs.has(item.marketSlug) || item.pick.toLocaleLowerCase(locale).includes(term),
    );
    const fixtureTeams = new Set(fixtures.flatMap((item) => [item.homeSlug, item.awaySlug]));
    const fixtureCompetitions = new Set(fixtures.map((item) => item.competitionSlug));
    const fixtureMarkets = new Set(fixtures.map((item) => item.marketSlug));
    return {
      ...sourceData,
      competitions: sourceData.competitions.filter((item) => competitionSlugs.has(item.slug) || fixtureCompetitions.has(item.slug)),
      teams: sourceData.teams.filter((item) => teamSlugs.has(item.slug) || fixtureTeams.has(item.slug)),
      countries,
      markets: sourceData.markets.filter((item) => marketSlugs.has(item.slug) || fixtureMarkets.has(item.slug)),
      fixtures,
    };
  }, [locale, query, sourceData]);
  const copy = discoveryLabels[locale];
  const common = getMessages(locale).common;
  const page = useMemo(
    () =>
      view === "explore"
        ? {
            eyebrow: copy.exploreEyebrow,
            title: copy.exploreTitle,
            description: copy.exploreDescription,
          }
        : view === "calendar"
          ? {
              eyebrow: copy.calendarEyebrow,
              title: copy.calendarTitle,
              description: copy.calendarDescription,
            }
          : view === "directory"
            ? section === "competitions" ? {eyebrow:copy.competitionEyebrow,title:copy.competitions,description:copy.competitionDescription}
              : section === "teams" ? {eyebrow:copy.teamEyebrow,title:copy.teams,description:copy.teamDescription}
              : section === "countries" ? {eyebrow:copy.countryEyebrow,title:copy.countries,description:copy.countryDescription}
              : {eyebrow:copy.marketEyebrow,title:copy.marketTitle,description:copy.marketDescription}
            : null,
    [view, section, copy],
  );
  const currentRoute = view === "directory" ? section : view;
  return (
    <div className={`${shellStyles.app} ${styles.app}`}>
      <header className={shellStyles.topbar}>
        <div className={shellStyles.topbarInner}>
          <button
            className={`${shellStyles.brand} ${styles.brandButton}`}
            onClick={() => router.push(`/${locale}/today`)}
          >
            <MboMark className={shellStyles.brandMark} title="MyBetOracle" />
            <span className={shellStyles.brandName}>MyBetOracle</span>
          </button>
          {children ? <button className={shellStyles.globalSearch} onClick={() => router.push(`/${locale}/explore`)}><Search size={18} /><span>{copy.search}</span></button> : <label className={shellStyles.globalSearch}>
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => {
                const value = e.target.value;
                if (!value.trim()) setDirectoryData(data);
                setQuery(value);
              }}
              placeholder={copy.search}
            />
            <kbd>Ctrl K</kbd>
          </label>}
          <div className={shellStyles.topbarActions}>
            <button
              className={shellStyles.topIconButton}
              title={common.notifications}
              onClick={() => router.push(`/${locale}/saved`)}
            >
              <Bell size={19} />
            </button>
            <label className={shellStyles.localeSelect}>
              <Languages size={18} />
              <select
                value={locale}
                onChange={(e) =>
                  router.push(
                    `/${e.target.value}/${view === "directory" ? section : view === "competition" ? "competitions" : view === "team" ? "teams" : view}${slug ? `/${slug}` : ""}${entityQuery ? `?${entityQuery}` : ""}`,
                  )
                }
              >
                {locales.map((item) => (
                  <option key={item} value={item}>
                    {localeNames[item]}
                  </option>
                ))}
              </select>
            </label>
            <button
              className={shellStyles.avatarButton}
              title={common.profile}
              onClick={() => router.push(`/${locale}/profile`)}
            >
              <UserCircle size={24} />
            </button>
            <button
              className={shellStyles.mobileMenuButton}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      {menuOpen && (
        <MobileProductMenu
          locale={locale}
          activeRoute="explore"
          onNavigate={() => setMenuOpen(false)}
        />
      )}
      <div className={`${shellStyles.shell} ${styles.shell} ${children ? styles.entityShell : ''}`}>
        <aside className={shellStyles.sidebar}>
          <nav className={shellStyles.primaryNav}>
            {navItems.map(({ label, icon: Icon, route }) => (
              <button
                key={label}
                className={route === "explore" ? shellStyles.navActive : ""}
                onClick={() => router.push(`/${locale}/${route}`)}
              >
                <Icon size={19} />
                <span>{route === "betslip" ? getOracleDailyLabel() : common[label]}</span>
              </button>
            ))}
          </nav>
          <div className={shellStyles.sidebarSection}>
            <div className={shellStyles.sidebarHeading}>
              <span>{common.explore}</span>
            </div>
            {exploreNav.map((item) => (
              <button
                key={item.route}
                className={`${styles.sideLink} ${currentRoute === item.route ? styles.sideActive : ""}`}
                onClick={() => router.push(`/${locale}/${item.route}`)}
              >
                <span>{copy[item.label]}</span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
          <div className={shellStyles.sidebarFooter}>
            <button onClick={() => router.push(`/${locale}/countries`)}>
              <Globe2 size={17} />
              {copy.allCountries}
            </button>
            <button>
              <ShieldCheck size={17} />
              {common.responsiblePlay}
            </button>
          </div>
        </aside>
        <main className={`${shellStyles.main} ${styles.main}`}>
          {page && (
            <header className={styles.pageHeader}>
              <div>
                <span>{page.eyebrow}</span>
                <h1>{page.title}</h1>
                <p>{page.description}</p>
              </div>
              {view === "explore" && (
                <div className={styles.pageActions}>
                  <button
                    onClick={() => router.push(`/${locale}/streaks`)}
                    title={copy.openStreaks}
                  >
                    <Activity size={17} />
                    {copy.streaks}
                  </button>
                  <button
                    onClick={() => router.push(`/${locale}/calendar`)}
                    title={copy.openCalendar}
                  >
                    <CalendarDays size={17} />
                    {copy.calendar}
                  </button>
                </div>
              )}
            </header>
          )}
          <AdSlot format="leaderboard" label={copy.advertisement} />
          {children}
          {view === "explore" && <ExploreHome locale={locale} data={visibleData} />}{" "}
          {view === "calendar" && <CalendarView locale={locale} data={visibleData} />}{" "}
          {view === "directory" && (
            <>
              <Directory section={section!} data={visibleData} locale={locale} copy={copy} />
              {visibleData[section!].length === 0 && <div className={styles.directoryEmpty}>{directoryActionLabels[locale].empty}</div>}
              {directoryData.catalog[section!].nextPage && <button className={styles.directoryMore} disabled={directoryLoading} onClick={() => void loadMoreDirectory()}>{directoryLoading ? directoryActionLabels[locale].loading : directoryActionLabels[locale].more}<span>{directoryData.catalog[section!].loaded} / {directoryData.catalog[section!].total}</span></button>}
            </>
          )}{" "}
          {(
            ["competition", "team", "country", "market"] as DiscoveryView[]
          ).includes(view) &&
            slug && !children && (
              <Detail
                view={view as "competition" | "team" | "country" | "market"}
                slug={slug}
                data={data}
                locale={locale}
              />
            )}
        </main>
        {!children && <aside className={`${shellStyles.intelligenceRail} ${styles.rail}`}>
          <section>
            <header>
              <span>{copy.coverageNow}</span>
              <Globe2 size={15} />
            </header>
            <dl>
              <div>
                <dt>{copy.fixtures}</dt>
                <dd>{data.fixtures.length}</dd>
              </div>
              <div>
                <dt>Oracle 80+</dt>
                <dd>
                  {
                    data.fixtures.filter(
                      (item) => item.oracleScore >= 80,
                    ).length
                  }
                </dd>
              </div>
              <div>
                <dt>{copy.competitions}</dt>
                <dd>{data.catalog.competitions.total}</dd>
              </div>
            </dl>
          </section>
          <section>
            <header>
              <span>{copy.quickAccess}</span>
              <Compass size={15} />
            </header>
            {data.competitions.slice(0, 4).map((item) => (
              <button
                key={item.slug}
                onClick={() =>
                  router.push(`/${locale}/competitions/${item.slug}`)
                }
              >
                <span>{item.code}</span>
                <strong>{item.name}</strong>
                <ChevronRight size={14} />
              </button>
            ))}
          </section>
        </aside>}
      </div>
      <nav className={shellStyles.mobileBottomNav}>
        {navItems.slice(0, 5).map(({ label, icon: Icon, route }) => (
          <button
            key={label}
            className={route === "explore" ? shellStyles.mobileNavActive : ""}
            onClick={() => router.push(`/${locale}/${route}`)}
          >
            <Icon size={19} />
            <span>{common[label]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
