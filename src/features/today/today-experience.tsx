"use client";

import { competitionShortcuts } from "./competition-shortcuts";
import { predictionMarketLabel } from "@/i18n/prediction-markets";
import { marketPresentation, valueViewLabels } from "@/features/discovery/market-presentation";
import { discoveryLabels } from "@/features/discovery/labels";
import Link from "next/link";
import { PageEditorial } from "@/components/editorial/page-editorial";

import {
  Activity,
  BarChart3,
  Bell,
  Bookmark,
  CalendarDays,
  Check,
  CircleCheck,
  CircleMinus,
  CircleX,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Compass,
  Flag,
  Globe2,
  Home,
  Languages,
  LayoutGrid,
  ListFilter,
  LoaderCircle,
  Menu,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  UserCircle,
  WandSparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MboMark } from "@/components/brand/brand-marks";
import { MobileProductMenu } from "@/components/navigation/mobile-product-menu";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { getMessages, localeTags, type Messages } from "@/i18n/messages";
import { withMultiPickTerminology } from "@/i18n/multi-pick-terminology";
import { systemLabels } from "@/i18n/system-labels";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { interpolate, todayLabels, type TodayLabels } from "./labels";
import { translateInsight } from "./insights";
import { valueMarket } from "./value-picks";
import type { Competition, Match, OracleMarket, PredictionMarket, Team, TipOutcome, TodayData } from "./types";
import styles from "./today-experience.module.css";

type Filter = "all" | "live" | "oracle" | "following";
type PredictionLens = "best" | "value" | "top" | Exclude<PredictionMarket, "ORACLE_PICK">;
function stateForLiveCode(code: string): Match["state"] { if (["FT", "AET", "PEN"].includes(code)) return "finished"; if (["NS", "TBD", "PST", "CANC", "ABD", "AWD", "WO"].includes(code)) return "scheduled"; return "live"; }

function mergeTodayFeed(current: TodayData, next: TodayData): TodayData {
  const competitions = new Map(current.competitions.map((competition) => [competition.id, competition]));
  for (const competition of next.competitions) {
    const existing = competitions.get(competition.id);
    if (!existing) competitions.set(competition.id, competition);
    else {
      const matches = new Map(existing.matches.map((match) => [match.id, match]));
      for (const match of competition.matches) matches.set(match.id, match);
      competitions.set(competition.id, { ...existing, matches: [...matches.values()] });
    }
  }
  return { ...current, freshness: next.freshness, pagination: next.pagination, oraclePickId: next.oraclePickId, oraclePick: next.oraclePick ?? current.oraclePick, competitions: [...competitions.values()] };
}

// Launch presentation only. Keep the existing pick-selection workflow intact
// so it can be restored when the product flow is ready for review.
const SHOW_TODAY_ADD_TO_PICKS = false;
// Preserve these launch surfaces until their production contracts are connected.
// Keeping them out of the UI prevents dead controls and non-canonical directory links.
const SHOW_TODAY_STANDINGS = false;
const SHOW_TODAY_SORT = false;
const SHOW_TODAY_COMPETITION_FOLLOWING = false;


const marketOptions = [
  { value: "best", label: "oracleBest", title: "oracleBestHelp" },
  { value: "top", text: "Top Picks" },
  { value: "value", text: "Value" },
  { value: "DOUBLE_CHANCE", text: "Double Chance" },
  { value: "TOTAL_2_5", text: "O/U 2.5" },
  { value: "BTTS", text: "GG/NG" },
  { value: "CORNERS", text: "Corners" },
  { value: "CARDS", text: "Cards" },
  { value: "REGULAR", text: "Regular" },
  { value: "TOTAL_1_5", text: "O/U 1.5" },
  { value: "MIXED", text: "Mixed" },
  { value: "HALFTIME_RESULT", text: "Half-time" },
  { value: "CORRECT_SCORE", text: "Correct Score" },
  { value: "TOTAL_3_5", text: "O/U 3.5" },
  { value: "GOALS_BAND", text: "Goals band" },
  { value: "HANDICAP", text: "Handicap" },
  { value: "TEAM_TO_SCORE", text: "Team To Score" },
  { value: "HALFTIME_FULLTIME", text: "HT/FT" },
] as const;

const allMarketsLabels: Record<Locale, string> = {
  en: "All Markets",
  es: "Todos los mercados",
  fr: "Tous les marchés",
  de: "Alle Märkte",
  it: "Tutti i mercati",
  pt: "Todos os mercados",
};

const marketCategoryTitles: Record<Locale, Record<"featured" | "outcomes" | "goals" | "stats", string>> = {
  en: { featured: "Curated & Value", outcomes: "Match Outcomes", goals: "Goals & Scores", stats: "Match Stats" },
  es: { featured: "Destacados y valor", outcomes: "Resultados del partido", goals: "Goles y marcadores", stats: "Estadísticas del partido" },
  fr: { featured: "En vedette et valeur", outcomes: "Résultats du match", goals: "Buts et scores", stats: "Statistiques du match" },
  de: { featured: "Empfohlen & Value", outcomes: "Spielausgänge", goals: "Tore & Ergebnisse", stats: "Spielstatistiken" },
  it: { featured: "In evidenza e valore", outcomes: "Esiti partita", goals: "Gol e punteggi", stats: "Statistiche partita" },
  pt: { featured: "Destaques e valor", outcomes: "Resultados da partida", goals: "Gols e placares", stats: "Estatísticas da partida" },
};

const marketCategories = [
  {
    id: "featured" as const,
    items: ["best", "top", "value"] as const,
  },
  {
    id: "outcomes" as const,
    items: ["DOUBLE_CHANCE", "REGULAR", "HALFTIME_RESULT", "HALFTIME_FULLTIME", "HANDICAP", "MIXED"] as const,
  },
  {
    id: "goals" as const,
    items: ["TOTAL_2_5", "BTTS", "TOTAL_1_5", "TOTAL_3_5", "CORRECT_SCORE", "GOALS_BAND", "TEAM_TO_SCORE"] as const,
  },
  {
    id: "stats" as const,
    items: ["CORNERS", "CARDS"] as const,
  },
] as const;

function getMarketOptionHref(locale: Locale, scope: "today" | "tomorrow", value: PredictionLens, dateIso: string) {
  const dateParam = `?date=${dateIso.slice(0, 10)}`;
  if (value === "best") return `/${locale}/${scope}${dateParam}`;
  if (value === "top" || value === "value") return `/${locale}/${scope}/${value}-picks${dateParam}`;
  const presentation = marketPresentation[value];
  return `/${locale}/${scope}/${presentation ? presentation.slug : value.toLowerCase()}${dateParam}`;
}

function getMarketOptionLabel(locale: Locale, value: PredictionLens, copy: TodayLabels) {
  if (value === "best") return copy.oracleBest;
  if (value === "top" || value === "value") return valueViewLabels[locale][value];
  return predictionMarketLabel(locale, value);
}


const showMoreLabels: Record<Locale, string> = {
  en: "Show more competitions",
  es: "Mostrar más competiciones",
  fr: "Afficher plus de compétitions",
  de: "Weitere Wettbewerbe anzeigen",
  it: "Mostra altre competizioni",
  pt: "Mostrar mais competições",
};


const marketEmptyLabels: Record<Locale, [string, string]> = {
  en: ["No published picks for this view yet", "Explore the other prediction markets for this date."],
  es: ["Aún no hay pronósticos publicados en esta vista", "Explora los otros mercados de pronósticos para esta fecha."],
  fr: ["Aucun pronostic publié dans cette vue pour le moment", "Découvrez les autres marchés de pronostics pour cette date."],
  de: ["Noch keine veröffentlichten Tipps in dieser Ansicht", "Entdecke die anderen Prognosemärkte für dieses Datum."],
  it: ["Nessun pronostico pubblicato in questa vista", "Esplora gli altri mercati di pronostici per questa data."],
  pt: ["Ainda não há palpites publicados nesta vista", "Explore os outros mercados de palpites para esta data."],
};

const navItems = [
  { label: "today", icon: Home, active: true, route: "today" },
  { label: "explore", icon: Compass, active: false, route: "explore" },
  { label: "accas", icon: WandSparkles, active: false, route: "multi-picks" },
  { label: "results", icon: BarChart3, active: false, route: "results" },
  { label: "saved", icon: Bookmark, active: false, route: "saved" },
  { label: "betslip", icon: ReceiptText, active: false, route: "betslip" },
] as const;

function Crest({ team }: { team: Team }) {
  if (team.emblemUrl) return <span className={styles.crest} aria-hidden="true"><Image src={team.emblemUrl} alt="" fill sizes="28px" /></span>;
  return (
    <span className={`${styles.crest} ${styles.crestFallback}`} aria-hidden="true">
      {team.shortName.slice(0, 2)}
    </span>
  );
}

function OracleGauge({ score, compact = false }: { score: number; compact?: boolean }) {
  return (
    <div className={compact ? styles.gaugeCompact : styles.gauge} aria-label={`Oracle score ${score} out of 100`}>
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle className={styles.gaugeTrack} cx="22" cy="22" r="18" />
        <circle
          className={styles.gaugeValue}
          cx="22"
          cy="22"
          r="18"
          pathLength="100"
          strokeDasharray={`${score} 100`}
        />
      </svg>
      <strong>{score}</strong>
    </div>
  );
}

function resolveMarketKey(match: Match, lens: PredictionLens): PredictionMarket {
  if ((lens === 'value' || lens === 'top') && match.rankedSelection) return match.rankedSelection.marketGroup;
  if (lens === 'value' || lens === 'top') return valueMarket(match, lens === 'top') ?? 'ORACLE_PICK';
  return lens === "best" ? "ORACLE_PICK" : lens;
}

function getMarket(match: Match, lens: PredictionLens): OracleMarket {
  if ((lens === "top" || lens === "value") && match.rankedSelection) { const rank = match.rankedSelection; return { ...match.markets[rank.marketGroup], probability: rank.selection.probability, selection: rank.selection.selectionLabel ?? rank.selection.marketValue, shortSelection: rank.selection.selectionShortLabel ?? rank.selection.marketValue, marketType: rank.selection.marketType, marketValue: rank.selection.marketValue, valueAnalysis: rank.valueAnalysis, odds: String(rank.valueAnalysis.decimalOdds) }; }
  const market = match.markets[resolveMarketKey(match, lens)];
  if ((lens === 'value' || lens === 'top') && market.valueAnalysis) return { ...market, odds: String(market.valueAnalysis.decimalOdds) };
  return market;
}

function getPickKey(match: Match, lens: PredictionLens) {
  return `${match.id}::${resolveMarketKey(match, lens)}`;
}

function OutcomeBadge({ outcome, labels, compact = false }: { outcome: TipOutcome; labels: { won: string; lost: string; void: string }; compact?: boolean }) {
  const Icon = outcome === "won" ? CircleCheck : outcome === "lost" ? CircleX : CircleMinus;
  const label = labels[outcome];
  const styleKey = outcome === "won" ? "Won" : outcome === "lost" ? "Lost" : "Void";

  return (
    <span className={`${styles.outcomeBadge} ${styles[`outcome${styleKey}`]} ${compact ? styles.outcomeCompact : ""}`}>
      <Icon size={compact ? 14 : 16} />
      {label}
    </span>
  );
}

function MatchRow({
  match,
  market,
  followed,
  added,
  selected,
  copy,
  statuses,
  onFollow,
  onAdd,
  onSelect,
}: {
  match: Match;
  market: OracleMarket;
  followed: boolean;
  added: boolean;
  selected: boolean;
  copy: TodayLabels;
  statuses: { won: string; lost: string; void: string };
  onFollow: () => void;
  onAdd: () => void;
  onSelect: () => void;
}) {
  return (
    <article className={`${styles.matchRow} ${selected ? styles.matchSelected : ""}`}>
      <button
        className={`${styles.iconButton} ${followed ? styles.followed : ""}`}
        onClick={onFollow}
        aria-label={interpolate(followed ? copy.removeSaved : copy.saveVersus, { home: match.home.name, away: match.away.name })}
        title={followed ? copy.saved : copy.saveMatch}
      >
        <Star size={17} fill={followed ? "currentColor" : "none"} />
      </button>

      <button className={styles.matchCore} onClick={onSelect} aria-label={interpolate(copy.openIntelligence, { home: match.home.name, away: match.away.name })}>
        <span className={`${styles.kickoff} ${match.state === "live" ? styles.live : ""}`}>
          {match.state === "live" && <span className={styles.liveDot} />}
          {match.kickoff}
        </span>
        <span className={styles.teams}>
          <span className={styles.teamLine}>
            <Crest team={match.home} />
            <span>{match.home.name}</span>
            {match.score && <strong>{match.score[0]}</strong>}
          </span>
          <span className={styles.teamLine}>
            <Crest team={match.away} />
            <span>{match.away.name}</span>
            {match.score && <strong>{match.score[1]}</strong>}
          </span>
        </span>
      </button>

      <button className={styles.marketPreview} onClick={onSelect} aria-label={market.selection} title={market.selection}>
        <strong>{market.shortSelection}</strong>
      </button>

      <button className={styles.scorePreview} onClick={onSelect} title={interpolate(copy.oracleScore, { score: market.confidence })}>
        <OracleGauge score={market.confidence} compact />
      </button>

      <div className={styles.rowActions}>
        {market.outcome ? (
          <OutcomeBadge outcome={market.outcome} labels={statuses} compact />
        ) : (
          <>
            <span className={styles.odds}>{market.odds ?? "—"}</span>
            {SHOW_TODAY_ADD_TO_PICKS && (
              <button
                className={`${styles.addButton} ${added ? styles.addedButton : ""}`}
                onClick={() => market.available && onAdd()}
                disabled={!market.available}
                aria-label={interpolate(added ? copy.removePick : copy.addPick, { pick: market.selection })}
                title={added ? copy.addedToPicks : copy.addToPicks}
              >
                {added ? <Check size={17} /> : <Plus size={17} />}
              </button>
            )}
          </>
        )}
      </div>
      <button className={styles.mobilePrediction} onClick={onSelect} aria-label={market.selection}>
        <strong title={market.selection}>{market.shortSelection}</strong>
        {market.available && <span className={styles.mobileConfidence} title={interpolate(copy.oracleScore, { score: market.confidence })} aria-label={interpolate(copy.oracleScore, { score: market.confidence })}><Sparkles size={12} />{market.confidence}/100</span>}
        {market.odds !== null && <span className={styles.mobileOdds}>{market.odds}</span>}
        {market.outcome && <OutcomeBadge outcome={market.outcome} labels={statuses} compact />}
      </button>
    </article>
  );
}

// A compact, crawlable nav between the three core SEO surfaces -- Today,
// Tomorrow, and a curated subset of the real scoped market pages for
// whichever scope is currently active. Real <Link>s, not client buttons,
// so both users and crawlers can move between these pages without relying
// on the sitemap.

function ScopeMarketNav({
  locale,
  scope,
  marketLens,
  dateIso,
  common,
}: {
  locale: Locale;
  scope: "today" | "tomorrow";
  marketLens: PredictionLens;
  dateIso: string;
  common: Messages["common"];
}) {
  const discoveryCopy = discoveryLabels[locale];
  return (
    <nav className={styles.scopeMarketNav} aria-label={discoveryCopy.predictions}>
      <div className={styles.scopeNavDateLinks}>
        <Link
          href={`/${locale}/today`}
          prefetch={false}
          aria-current={scope === "today" && marketLens === "best" ? "page" : undefined}
          className={`${styles.scopeMarketLink} ${scope === "today" && marketLens === "best" ? styles.scopeMarketLinkActive : ""}`}
        >
          {common.today}
        </Link>
        <Link
          href={`/${locale}/tomorrow`}
          prefetch={false}
          aria-current={scope === "tomorrow" && marketLens === "best" ? "page" : undefined}
          className={`${styles.scopeMarketLink} ${scope === "tomorrow" && marketLens === "best" ? styles.scopeMarketLinkActive : ""}`}
        >
          {common.tomorrow}
        </Link>
      </div>

      <span className={styles.scopeMarketDivider} aria-hidden="true" />

      <div className={styles.scopeMarketQuickPills}>
        <Link
          href={getMarketOptionHref(locale, scope, "top", dateIso)}
          prefetch={false}
          className={`${styles.scopeMarketQuickPill} ${marketLens === "top" ? styles.scopeMarketQuickPillActive : ""}`}
          aria-current={marketLens === "top" ? "page" : undefined}
        >
          <Star size={12} />
          <span>{valueViewLabels[locale].top}</span>
        </Link>
        <Link
          href={getMarketOptionHref(locale, scope, "value", dateIso)}
          prefetch={false}
          className={`${styles.scopeMarketQuickPill} ${marketLens === "value" ? styles.scopeMarketQuickPillActive : ""}`}
          aria-current={marketLens === "value" ? "page" : undefined}
        >
          <Sparkles size={12} />
          <span>{valueViewLabels[locale].value}</span>
        </Link>
        <Link
          href={getMarketOptionHref(locale, scope, "MIXED", dateIso)}
          prefetch={false}
          className={`${styles.scopeMarketQuickPill} ${marketLens === "MIXED" ? styles.scopeMarketQuickPillActive : ""}`}
          aria-current={marketLens === "MIXED" ? "page" : undefined}
        >
          <WandSparkles size={12} />
          <span>{predictionMarketLabel(locale, "MIXED")}</span>
        </Link>
        <Link
          href={getMarketOptionHref(locale, scope, "DOUBLE_CHANCE", dateIso)}
          prefetch={false}
          className={`${styles.scopeMarketQuickPill} ${marketLens === "DOUBLE_CHANCE" ? styles.scopeMarketQuickPillActive : ""}`}
          aria-current={marketLens === "DOUBLE_CHANCE" ? "page" : undefined}
        >
          <span>{predictionMarketLabel(locale, "DOUBLE_CHANCE")}</span>
        </Link>
        <Link
          href={getMarketOptionHref(locale, scope, "BTTS", dateIso)}
          prefetch={false}
          className={`${styles.scopeMarketQuickPill} ${marketLens === "BTTS" ? styles.scopeMarketQuickPillActive : ""}`}
          aria-current={marketLens === "BTTS" ? "page" : undefined}
        >
          <span>{predictionMarketLabel(locale, "BTTS")}</span>
        </Link>
        <Link
          href={getMarketOptionHref(locale, scope, "TOTAL_2_5", dateIso)}
          prefetch={false}
          className={`${styles.scopeMarketQuickPill} ${marketLens === "TOTAL_2_5" ? styles.scopeMarketQuickPillActive : ""}`}
          aria-current={marketLens === "TOTAL_2_5" ? "page" : undefined}
        >
          <span>{predictionMarketLabel(locale, "TOTAL_2_5")}</span>
        </Link>
        <Link
          href={getMarketOptionHref(locale, scope, "CORNERS", dateIso)}
          prefetch={false}
          className={`${styles.scopeMarketQuickPill} ${marketLens === "CORNERS" ? styles.scopeMarketQuickPillActive : ""}`}
          aria-current={marketLens === "CORNERS" ? "page" : undefined}
        >
          <Flag size={12} />
          <span>{predictionMarketLabel(locale, "CORNERS")}</span>
        </Link>
        <Link
          href={getMarketOptionHref(locale, scope, "CARDS", dateIso)}
          prefetch={false}
          className={`${styles.scopeMarketQuickPill} ${marketLens === "CARDS" ? styles.scopeMarketQuickPillActive : ""}`}
          aria-current={marketLens === "CARDS" ? "page" : undefined}
        >
          <span className={styles.cardsIconMini} aria-hidden="true" />
          <span>{predictionMarketLabel(locale, "CARDS")}</span>
        </Link>
      </div>
    </nav>
  );
}

function CompetitionBlock({
  competition,
  marketLens,
  followed,
  added,
  selectedId,
  collapsed,
  copy,
  statuses,
  onToggle,
  onFollow,
  onAdd,
  onSelect,
}: {
  competition: Competition;
  marketLens: PredictionLens;
  followed: Set<string>;
  added: Set<string>;
  selectedId: string;
  collapsed: boolean;
  copy: TodayLabels;
  statuses: { won: string; lost: string; void: string };
  onToggle: () => void;
  onFollow: (id: string) => void;
  onAdd: (match: Match) => void;
  onSelect: (match: Match) => void;
}) {
  return (
    <section className={styles.competitionBlock}>
      <header className={styles.competitionHeader}>
        {/* h2 wraps the collapse/expand toggle so the competition group gets a
            real semantic heading without losing the interactive control. */}
        <h2 className={styles.competitionHeadingReset}>
          <button className={styles.competitionIdentity} onClick={onToggle} aria-expanded={!collapsed}>
            <span className={styles.countryCode}>{competition.countryFlagUrl ? <Image src={competition.countryFlagUrl} alt="" width={22} height={16} /> : competition.countryCode}</span>
            {competition.emblemUrl && <Image className={styles.competitionEmblem} src={competition.emblemUrl} alt="" width={24} height={24} />}
            <strong>{competition.name}</strong>
            <ChevronDown className={collapsed ? styles.chevronCollapsed : ""} size={17} />
          </button>
        </h2>
        {SHOW_TODAY_STANDINGS && <button className={styles.textButton}>{copy.standings}</button>}
      </header>
      {!collapsed && (
        <div>
          {competition.matches.map((match) => (
            <MatchRow
              key={match.id}
              match={match}
              market={getMarket(match, marketLens)}
              followed={followed.has(match.id)}
              added={added.has(getPickKey(match, marketLens))}
              selected={selectedId === match.id}
              copy={copy}
              statuses={statuses}
              onFollow={() => onFollow(match.id)}
              onAdd={() => onAdd(match)}
              onSelect={() => onSelect(match)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function TodayExperience({ data, locale, scope = "today", heading, initialMarket = "best", pinnedCompetitions = [] }: { data: TodayData; locale: Locale; scope?: "today" | "tomorrow"; heading?: string; initialMarket?: PredictionLens; pinnedCompetitions?: ReadonlyArray<Pick<Competition, "id" | "name" | "countryCode">> }) {
  const router = useRouter();
  const [feed, setFeed] = useState(data);
  const [allFeed, setAllFeed] = useState(data);
  const copy = withMultiPickTerminology(todayLabels[locale], locale, "today");
  const common = getMessages(locale).common;
  const statuses = { won: common.won, lost: common.lost, void: common.void };
  const allMatches = useMemo(() => feed.competitions.flatMap((competition) => competition.matches), [feed.competitions]);
  const [filter, setFilter] = useState<Filter>("all");
  const [marketLens, setMarketLens] = useState<PredictionLens>(initialMarket);
  const marketFilter = initialMarket === "best" || initialMarket === "top" || initialMarket === "value" ? "" : initialMarket;
  const discovery = marketLens === "top" || marketLens === "value" ? marketLens : "all";
  const [clockNow,setClockNow]=useState(()=>Date.now());
  useEffect(()=>{const timer=setInterval(()=>setClockNow(Date.now()),10000);return()=>clearInterval(timer)},[]);
  const [query, setQuery] = useState("");
  const [followed, setFollowed] = useState(new Set<string>());
  const [added, setAdded] = useState(new Set<string>());
  const [collapsed, setCollapsed] = useState(new Set<string>());
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(() => (initialMarket === "best" ? data.oraclePick : null) ?? allMatches[0] ?? null);
  useEffect(() => {
    const fixtureCount = data.competitions.reduce((total, competition) => total + competition.matches.length, 0);
    void AnalyticsEvents.todayViewed({ locale, date: data.dateIso.slice(0, 10), fixtureCount });
  }, [data, locale]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [visibleCompetitionCount, setVisibleCompetitionCount] = useState(20);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);
  const loadingView = false;
  const [viewFailed, setViewFailed] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const [searchAttempt, setSearchAttempt] = useState(0);
  const lastFeedRequest = useRef(JSON.stringify([data.dateIso, locale, "", 0, discovery, marketFilter, "all"]));
  const searchInputRef = useRef<HTMLInputElement>(null);
  const infiniteSentinelRef = useRef<HTMLDivElement>(null);
  const marketNavRef = useRef<HTMLElement>(null);
  const allMarketsRef = useRef<HTMLDivElement>(null);
  const [allMarketsOpen, setAllMarketsOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollAffordance = useCallback(() => {
    const el = marketNavRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
  }, []);

  useEffect(() => {
    const el = marketNavRef.current;
    if (!el) return;
    updateScrollAffordance();
    el.addEventListener("scroll", updateScrollAffordance, { passive: true });
    window.addEventListener("resize", updateScrollAffordance);
    return () => {
      el.removeEventListener("scroll", updateScrollAffordance);
      window.removeEventListener("resize", updateScrollAffordance);
    };
  }, [updateScrollAffordance]);

  useEffect(() => {
    const nav = marketNavRef.current;
    const selected = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (nav && selected) {
      const leftOffset = selected.getBoundingClientRect().left - nav.getBoundingClientRect().left - 16;
      nav.scrollBy({ left: leftOffset, behavior: "smooth" });
    }
    updateScrollAffordance();
  }, [marketLens, updateScrollAffordance]);

  useEffect(() => {
    if (!allMarketsOpen) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (allMarketsRef.current && !allMarketsRef.current.contains(event.target as Node)) {
        setAllMarketsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAllMarketsOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [allMarketsOpen]);

  const scrollMarketRail = (direction: "left" | "right") => {
    const nav = marketNavRef.current;
    if (!nav) return;
    const distance = direction === "left" ? -240 : 240;
    nav.scrollBy({ left: distance, behavior: "smooth" });
  };

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleSearchShortcut);
    return () => window.removeEventListener("keydown", handleSearchShortcut);
  }, []);

  useEffect(() => {
    const search = query.trim();
    const identity = JSON.stringify([data.dateIso, locale, query, searchAttempt, discovery, marketFilter, filter]);
    if (lastFeedRequest.current === identity) return;
    const controller = new AbortController(); let active = true;
    const timer = window.setTimeout(async () => {
      setSearchLoading(true); setSearchFailed(false);
      try {
        const params = new URLSearchParams({ date:data.dateIso.slice(0,10), locale, view:filter==='live'?'live':discovery, page:'1' });
        if(search.length>=2)params.set('search',search);
        if(marketFilter)params.set('marketGroup',marketFilter);
        const response=await fetch(`/api/today?${params}`,{cache:'no-store',signal:controller.signal});
        if(!response.ok)throw new Error('TODAY_DISCOVERY_UNAVAILABLE');
        const next=await response.json() as TodayData;
        if(active){lastFeedRequest.current=identity;setFeed(next);setVisibleCompetitionCount(20);setSelectedMatch(next.competitions[0]?.matches[0]??null)}
      }catch(error){if(active&&!(error instanceof DOMException&&error.name==='AbortError'))setSearchFailed(true)}
      finally{if(active)setSearchLoading(false)}
    },search.length>=2?250:0);
    return()=>{active=false;clearTimeout(timer);controller.abort()};
  },[data.dateIso,locale,query,searchAttempt,discovery,marketFilter,filter]);

  useEffect(() => {
    let active=true;
    fetch(`/api/saved?locale=${locale}`,{cache:"no-store"}).then(async response=>response.ok?response.json():null).then(data=>{if(active&&Array.isArray(data?.matches))setFollowed(new Set(data.matches.map((item:{fixtureId?:string})=>item.fixtureId).filter(Boolean)))}).catch(()=>{});
    return()=>{active=false};
  }, [locale]);

  useEffect(() => {
    const source = new EventSource(`/api/live?date=${encodeURIComponent(feed.dateIso.slice(0, 10))}`);
    const update = (event: MessageEvent<string>) => { try {
      const payload = JSON.parse(event.data) as { livePredictions?: Match["livePrediction"]; fixtureId?: string; statusCode?: string; homeScore?: number | null; awayScore?: number | null; elapsedMinute?: number | null; predictionResults?: Array<{ predictionId: string; marketGroup: PredictionMarket; result: "PENDING" | "WON" | "LOST" | "VOID" }> };
      if (!payload.fixtureId) return;
      const apply = (match: Match): Match => {
        if (!match || match.id !== payload.fixtureId) return match;
        if(payload.livePredictions&&match.livePrediction&&Date.parse(payload.livePredictions.sourceObservedAt)<Date.parse(match.livePrediction.sourceObservedAt))return match;
        const results = new Map((payload.predictionResults ?? []).map((result) => [result.predictionId, result.result]));
        const markets = Object.fromEntries(Object.entries(match.markets).map(([group, market]) => {
          const result = market.predictionId ? results.get(market.predictionId) : undefined;
          const outcome: TipOutcome | undefined = result === "WON" ? "won" : result === "LOST" ? "lost" : result === "VOID" ? "void" : market.outcome;
          return [group, { ...market, outcome }];
        })) as Match["markets"];
        return { ...match, livePrediction:payload.livePredictions??match.livePrediction, markets, statusCode: payload.statusCode ?? match.statusCode, state: payload.statusCode ? stateForLiveCode(payload.statusCode) : match.state, kickoff: payload.statusCode ? `${payload.statusCode}${payload.elapsedMinute !== null && payload.elapsedMinute !== undefined ? ` ${payload.elapsedMinute}'` : ""}` : match.kickoff, elapsedMinute: payload.elapsedMinute ?? match.elapsedMinute, score: payload.homeScore !== undefined || payload.awayScore !== undefined ? [payload.homeScore ?? null, payload.awayScore ?? null] : match.score };
      };
      setFeed((current) => ({ ...current, competitions: current.competitions.map((competition) => ({ ...competition, matches: competition.matches.map(apply) })) }));
      setSelectedMatch((current) => current ? apply(current) : null);
    } catch {} };
    source.addEventListener("fixture_update", update as EventListener);
    return () => {
      source.removeEventListener("fixture_update", update as EventListener);
      source.close();
    };
  }, [feed.dateIso]);

  const selectedDate = useMemo(() => new Date(feed.dateIso), [feed.dateIso]);

  const filteredCompetitions = useMemo(() => {
    return feed.competitions
      .map((competition) => ({
        ...competition,
        matches: competition.matches.filter((match) => {
          const matchesFilter =
            filter === "all" ||
            (filter === "live" && match.state === "live") ||
            (filter === "oracle" && match.oracleScore >= 80) ||
            (filter === "following" && followed.has(match.id));
          return matchesFilter && (marketLens !== 'value' && marketLens !== 'top' || Boolean(match.rankedSelection) && (!match.kickoffAt || Date.parse(match.kickoffAt)>clockNow));
        }),
      }))
      .filter((competition) => competition.matches.length > 0);
  }, [feed.competitions, filter, followed, marketLens, clockNow]);

  const visibleCompetitions = filteredCompetitions.slice(0, visibleCompetitionCount);

  const hasMoreToDisplay = visibleCompetitionCount < filteredCompetitions.length || Boolean(feed.pagination.hasMore);
  const loadingMoreRef = useRef(false);
  const stateRef = useRef({ feed, filter, discovery, query, marketFilter, locale });
  useEffect(() => {
    stateRef.current = { feed, filter, discovery, query, marketFilter, locale };
  }, [feed, filter, discovery, query, marketFilter, locale]);

  useEffect(() => {
    const sentinel = infiniteSentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (visibleCompetitionCount < filteredCompetitions.length) {
          setVisibleCompetitionCount((current) => Math.min(filteredCompetitions.length, current + 20));
        } else if (feed.pagination.hasMore && !loadingMoreRef.current) {
          void loadMoreFixtures();
        }
      }
    }, { rootMargin: "1200px 0px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [feed.pagination.hasMore, feed.pagination.nextCursor, filteredCompetitions.length, visibleCompetitionCount]);

  async function loadMoreFixtures() {
    const { feed: currentFeed, filter: currentFilter, discovery: currentDiscovery, query: currentQuery, marketFilter: currentMarketFilter, locale: currentLocale } = stateRef.current;
    if (loadingMoreRef.current || !currentFeed.pagination.hasMore || !currentFeed.pagination.nextCursor) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadMoreFailed(false);
    try {
      const view = currentFilter === "live" ? "live" : currentDiscovery;
      const search = currentQuery.trim().length >= 2 ? currentQuery.trim() : undefined;
      const params = new URLSearchParams({
        date: currentFeed.dateIso.slice(0, 10),
        locale: currentLocale,
        view,
        page: String(currentFeed.pagination.page + 1),
        cursor: currentFeed.pagination.nextCursor,
      });
      if (currentMarketFilter) params.set("marketGroup", currentMarketFilter);
      if (search) params.set("search", search);
      const response = await fetch(`/api/today?${params}`, { cache: "no-store" });
      if (!response.ok) { setLoadMoreFailed(true); return; }
      const next = await response.json() as TodayData;
      setFeed((current) => mergeTodayFeed(current, next));
      if (view === "all" && !search) setAllFeed((current) => mergeTodayFeed(current, next));
      setVisibleCompetitionCount((current) => current + 20);
    } catch {
      setLoadMoreFailed(true);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }

  async function selectFilter(value: Filter) {
    setFilter(value);setViewFailed(false);setVisibleCompetitionCount(20);
    if(value==='live'&&(marketLens==='top'||marketLens==='value'))setMarketLens(marketFilter?marketFilter as PredictionLens:'REGULAR');
  }

  function toggleSet(setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) {
    setter((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function toggleSaved(id:string){
    const wasSaved=followed.has(id);toggleSet(setFollowed,id);
    try{const response=await fetch(`/api/saved/matches/${encodeURIComponent(id)}`,{method:wasSaved?"DELETE":"PUT",headers:wasSaved?undefined:{"Content-Type":"application/json"},body:wasSaved?undefined:JSON.stringify({alertEnabled:false})});if(response.status===401){toggleSet(setFollowed,id);router.push(`/${locale}/auth?returnTo=/${locale}/today?date=${feed.dateIso.slice(0,10)}`);return}if(!response.ok)throw new Error("save")}
    catch{toggleSet(setFollowed,id)}
  }

  function switchLocale(nextLocale: string) {
    if (locales.includes(nextLocale as Locale)) {
      router.push(`/${nextLocale}/${scope}${initialMarket === "best" ? "" : `/${initialMarket === "top" || initialMarket === "value" ? `${initialMarket}-picks` : marketPresentation[initialMarket].slug}`}?date=${feed.dateIso.slice(0,10)}`);
    }
  }

  function changeDate(offset: number) {
    const date = new Date(feed.dateIso); date.setUTCDate(date.getUTCDate() + offset);
    router.push(`/${locale}/today?date=${date.toISOString().slice(0, 10)}`);
  }

  function navigate(route?: string) {
    if (route) router.push(`/${locale}/${route}`);
  }

  function updateSearch(value: string) {
    setQuery(value);
    setVisibleCompetitionCount(20);
    setSearchFailed(false);
    if (value.trim().length >= 2) setSearchLoading(true);
    else {
      setSearchLoading(false);
      setFeed(allFeed);
    }
    if (value && filter !== "all") {
      setFilter("all");
      setFeed(allFeed);
      setViewFailed(false);
    }
  }

  function clearSearch(focus = true) {
    setQuery("");
    setFeed(allFeed);
    setSearchFailed(false);
    setVisibleCompetitionCount(20);
    if (focus) searchInputRef.current?.focus();
  }

  const dateFormatter = new Intl.DateTimeFormat(localeTags[locale], { weekday: "long", month: "long", day: "numeric" });
  const shortDateFormatter = new Intl.DateTimeFormat(localeTags[locale], { weekday: "short" });
  const selectedMarket = selectedMatch ? getMarket(selectedMatch, marketLens) : null;
  const selectedPickKey = selectedMatch ? getPickKey(selectedMatch, marketLens) : "";
  const selectedPicks = Array.from(added).flatMap((key) => {
    const [matchId, marketKey] = key.split("::") as [string, PredictionMarket];
    const match = allMatches.find((item) => item.id === matchId);
    return match ? [{ key, match, market: match.markets[marketKey] }] : [];
  });

  return (
    <div className={styles.app}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <button className={styles.brand} onClick={() => navigate("today")} aria-label={`MyBetOracle ${common.today}`}>
            <MboMark className={styles.brandMark} title="MyBetOracle" />
            <span className={styles.brandName}>MyBetOracle</span>
          </button>

          <label className={styles.globalSearch}>
            <Search size={18} />
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(event) => updateSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape" && query) {
                  event.preventDefault();
                  clearSearch();
                }
              }}
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchPlaceholder}
              autoComplete="off"
              aria-busy={searchLoading}
            />
            {query ? (
              <button type="button" className={styles.searchClear} onClick={() => clearSearch()} aria-label={copy.clearFilters}>
                <X size={16} />
              </button>
            ) : (
              <kbd>Ctrl K</kbd>
            )}
          </label>

          <div className={styles.topbarActions}>
            <button
              type="button"
              className={styles.mobileSearchToggle}
              title={copy.searchPlaceholder}
              aria-label={copy.searchPlaceholder}
              onClick={() => {
                setMobileSearchOpen((prev) => !prev);
              }}
            >
              <Search size={19} />
            </button>
            <button className={styles.topIconButton} title={common.notifications} aria-label={common.notifications} onClick={() => navigate("saved")}><Bell size={19} /></button>
            <label className={styles.localeSelect} title={common.language}>
              <Languages size={18} />
              <select value={locale} onChange={(event) => switchLocale(event.target.value)} aria-label={common.language}>
                {locales.map((item) => <option value={item} key={item}>{localeNames[item]}</option>)}
              </select>
            </label>
            <button className={styles.avatarButton} title={common.profile} aria-label={common.profile} onClick={() => navigate("profile")}><UserCircle size={24} /></button>
            <button className={styles.mobileMenuButton} onClick={() => setMobileMenuOpen((current) => !current)} aria-label={common.openNavigation}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {mobileSearchOpen && (
          <div className={styles.mobileSearchExpanded}>
            <Search size={18} className={styles.mobileSearchIcon} />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(event) => updateSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  if (query) clearSearch(false);
                  else setMobileSearchOpen(false);
                }
              }}
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchPlaceholder}
              autoComplete="off"
              aria-busy={searchLoading}
            />
            {query && (
              <button type="button" className={styles.searchClear} onClick={() => clearSearch(false)} aria-label={copy.clearFilters}>
                <X size={17} />
              </button>
            )}
            <button
              type="button"
              className={styles.mobileSearchClose}
              onClick={() => setMobileSearchOpen(false)}
              aria-label={common.close ?? "Close"}
            >
              <X size={18} />
            </button>
          </div>
        )}
      </header>

      {mobileMenuOpen && <MobileProductMenu locale={locale} activeRoute="today" onNavigate={() => setMobileMenuOpen(false)} />}

      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <nav className={styles.primaryNav} aria-label={common.primaryNavigation}>
            {navItems.map(({ label, icon: Icon, active, route }) => (
              <button key={label} className={active ? styles.navActive : ""} onClick={() => navigate(route)}>
                <Icon size={19} />
                <span>{common[label]}</span>
                {label === "saved" && followed.size > 0 && <small>{followed.size}</small>}
              </button>
            ))}
          </nav>

          {SHOW_TODAY_COMPETITION_FOLLOWING && <div className={styles.sidebarSection}>
            <div className={styles.sidebarHeading}>
              <span>{copy.following}</span>
              <button title={copy.manageFollowing} aria-label={copy.manageFollowing}><Plus size={16} /></button>
            </div>
            {competitionShortcuts(pinnedCompetitions, locale).map(({ id, name, countryCode, href }) => (
              <Link className={styles.pinnedLeague} key={id} href={href} prefetch={false}>
                <span>{countryCode}</span>
                <strong>{name}</strong>
              </Link>
            ))}
          </div>}

          <div className={styles.sidebarFooter}>
            <Link href={`/${locale}/competitions`} prefetch={false}><Globe2 size={17} /> {common.allCompetitions}</Link>
            <Link href={`/${locale}/responsible-play`} prefetch={false}><ShieldCheck size={17} /> {common.responsiblePlay}</Link>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>{heading ?? (scope === "tomorrow" ? copy.tomorrowMatches : copy.todayMatches)}</h1>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.calendarButton} onClick={() => navigate("multi-picks")} title={copy.openAccas}><WandSparkles size={18} /> {common.accas}</button>
              <button className={styles.calendarButton} onClick={() => navigate("streaks")} title={copy.openStreaks}><Activity size={18} /> {common.streaks}</button>
              <button className={styles.calendarButton} onClick={() => navigate("calendar")} title={copy.openCalendar}><CalendarDays size={18} /> {copy.calendar}</button>
            </div>
          </div>

          <ScopeMarketNav locale={locale} scope={scope} marketLens={marketLens} dateIso={feed.dateIso} common={common} />

          <section className={styles.dateRail} aria-label={copy.matchDate}>
            <button className={styles.dateArrow} onClick={() => changeDate(-1)} aria-label={copy.previousDay}><ChevronLeft size={20} /></button>
            {[-1, 0, 1].map((relative) => {
              const date = new Date(feed.dateIso);
              date.setUTCDate(date.getUTCDate() + relative);
              return (
                <button key={relative} onClick={() => changeDate(relative)} className={relative === 0 ? styles.dateActive : ""}>
                  <span>{shortDateFormatter.format(date)}</span>
                  <strong>{date.getUTCDate()}</strong>
                </button>
              );
            })}
            <button className={styles.dateArrow} onClick={() => changeDate(1)} aria-label={copy.nextDay}><ChevronRight size={20} /></button>
          </section>

          <section className={styles.feedToolbar}>
            <div className={styles.filterTabs} role="tablist" aria-label={copy.matchFilters}>
              {([
                ["all", copy.all],
                ["live", copy.live],
                ["oracle", copy.oracle80],
                ["following", copy.following],
              ] as const).filter(([value]) => SHOW_TODAY_COMPETITION_FOLLOWING || value !== "following").map(([value, label]) => (
                <button key={value} onClick={() => void selectFilter(value)} className={filter === value ? styles.filterActive : ""} role="tab" aria-selected={filter === value}>
                  {value === "live" && <span className={styles.liveDot} />}{label}
                </button>
              ))}
            </div>
            {SHOW_TODAY_SORT && <button className={styles.sortButton}><ListFilter size={17} /> {copy.sort}</button>}
          </section>

          <section className={styles.marketLens} aria-label={copy.predictionMarket}>
            <div className={`${styles.marketRailContainer} ${canScrollLeft ? styles.hasScrollLeft : ""} ${canScrollRight ? styles.hasScrollRight : ""}`}>
              {canScrollLeft && (
                <button
                  type="button"
                  className={`${styles.marketScrollChevron} ${styles.marketScrollChevronLeft}`}
                  onClick={() => scrollMarketRail("left")}
                  aria-label={copy.previousDay}
                  tabIndex={-1}
                >
                  <ChevronLeft size={16} />
                </button>
              )}

              <nav ref={marketNavRef} className={styles.marketSegments} aria-label={copy.marketFamilies}>
                {marketOptions.map((option) => (
                  <Link
                    key={option.value}
                    prefetch={false}
                    scroll={false}
                    href={getMarketOptionHref(locale, scope, option.value, feed.dateIso)}
                    className={marketLens === option.value ? styles.marketSegmentActive : ""}
                    aria-current={marketLens === option.value ? "page" : undefined}
                  >
                    {option.value === "best" && <Sparkles size={14} />}
                    {option.value === "top" && <Star size={13} />}
                    {option.value === "value" && <Sparkles size={13} />}
                    {option.value === "CORNERS" && <Flag size={13} />}
                    {option.value === "CARDS" && <span className={styles.cardsIconMini} aria-hidden="true" />}
                    <span>{getMarketOptionLabel(locale, option.value, copy)}</span>
                  </Link>
                ))}
              </nav>

              {canScrollRight && (
                <button
                  type="button"
                  className={`${styles.marketScrollChevron} ${styles.marketScrollChevronRight}`}
                  onClick={() => scrollMarketRail("right")}
                  aria-label={copy.nextDay}
                  tabIndex={-1}
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </div>

            <div ref={allMarketsRef} className={styles.allMarketsWrapper}>
              <button
                type="button"
                className={`${styles.allMarketsToggle} ${allMarketsOpen ? styles.allMarketsToggleOpen : ""}`}
                onClick={() => setAllMarketsOpen((prev) => !prev)}
                aria-expanded={allMarketsOpen}
                aria-haspopup="true"
                aria-label={allMarketsLabels[locale]}
              >
                <LayoutGrid size={15} />
                <span className={styles.allMarketsToggleText}>{allMarketsLabels[locale]}</span>
                <ChevronDown size={14} className={`${styles.allMarketsChevron} ${allMarketsOpen ? styles.allMarketsChevronOpen : ""}`} />
              </button>

              {allMarketsOpen && (
                <div className={styles.allMarketsPopover} role="menu" aria-label={allMarketsLabels[locale]}>
                  {marketCategories.map((category) => (
                    <div key={category.id} className={styles.allMarketsCategory}>
                      <span className={styles.allMarketsCategoryTitle}>
                        {marketCategoryTitles[locale][category.id]}
                      </span>
                      <div className={styles.allMarketsGrid}>
                        {category.items.map((value) => {
                          const isActive = marketLens === value;
                          return (
                            <Link
                              key={value}
                              prefetch={false}
                              scroll={false}
                              href={getMarketOptionHref(locale, scope, value, feed.dateIso)}
                              onClick={() => setAllMarketsOpen(false)}
                              className={`${styles.allMarketsItem} ${isActive ? styles.allMarketsItemActive : ""}`}
                              aria-current={isActive ? "page" : undefined}
                            >
                              {value === "best" && <Sparkles size={13} />}
                              {value === "top" && <Star size={13} />}
                              {value === "value" && <Sparkles size={13} />}
                              {value === "CORNERS" && <Flag size={13} />}
                              {value === "CARDS" && <span className={styles.cardsIconMini} aria-hidden="true" />}
                              <span>{getMarketOptionLabel(locale, value, copy)}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <div className={styles.feedMeta}>
            <strong>{dateFormatter.format(selectedDate)}</strong>
            <span aria-live="polite">{loadingView || searchLoading ? "…" : visibleCompetitions.reduce((total, competition) => total + competition.matches.length, 0)} {copy.shown}</span>
          </div>

          <div className={styles.feed}>
            {(loadingView || searchLoading) && (
              <div className={styles.liveSkeleton} aria-label={searchLoading ? copy.searchPlaceholder : copy.live} aria-busy="true">
                {Array.from({ length: 6 }, (_, index) => <span key={index} />)}
              </div>
            )}
            {(viewFailed || searchFailed) && (
              <div className={styles.liveRetry}>
                <button onClick={() => {
                  if (searchFailed) {
                    setSearchLoading(true);
                    setSearchFailed(false);
                    setSearchAttempt((current) => current + 1);
                  } else void selectFilter("live");
                }}>
                  {searchFailed ? <LoaderCircle size={17} /> : <Activity size={17} />} {systemLabels[locale].retry}
                </button>
              </div>
            )}
            {!loadingView && !searchLoading && !viewFailed && !searchFailed && visibleCompetitions.map((competition) => (
              <CompetitionBlock
                key={competition.id}
                competition={competition}
                marketLens={marketLens}
                followed={followed}
                added={added}
                selectedId={selectedMatch?.id ?? ""}
                collapsed={query.trim() ? false : collapsed.has(competition.id)}
                copy={copy}
                statuses={statuses}
                onToggle={() => toggleSet(setCollapsed, competition.id)}
                onFollow={(id) => {void toggleSaved(id)}}
                onAdd={(match) => toggleSet(setAdded, getPickKey(match, marketLens))}
                onSelect={(match) => {
                  if (match.slug) {
                    router.push(`/${locale}/match/${match.slug}`);
                  }
                }}
              />
            ))}
            {!loadingView && !searchLoading && !viewFailed && !searchFailed && filteredCompetitions.length === 0 && (Boolean(query.trim()) || !feed.pagination.hasMore) && (
              <div className={styles.emptyState}>
                <Search size={24} />
                <strong>{query.trim() || filter !== "all" ? copy.noMatches : marketEmptyLabels[locale][0]}</strong>
                <p>{query.trim() || filter !== "all" ? copy.noMatchesHelp : marketEmptyLabels[locale][1]}</p>
                {query.trim() || filter !== "all" ? <button onClick={() => { setQuery(""); setFilter("all"); setVisibleCompetitionCount(20); }}>{copy.clearFilters}</button> : <Link href={`/${locale}/${scope}`}>{copy.all}</Link>}
              </div>
            )}
            {hasMoreToDisplay && <div ref={infiniteSentinelRef} className={styles.infiniteSentinel} />}

            {loadingMore && (
              <div className={styles.infiniteLoadingIndicator} role="status">
                <LoaderCircle size={20} className={styles.infiniteSpinner} />
                <span>{systemLabels[locale].loading}…</span>
              </div>
            )}

            {loadMoreFailed && (
              <div className={styles.infiniteRetryContainer}>
                <button type="button" onClick={() => void loadMoreFixtures()} className={styles.infiniteRetryButton}>
                  {systemLabels[locale].retry}
                </button>
              </div>
            )}
            <PageEditorial
              locale={locale}
              scopeKey={
                initialMarket !== "best"
                  ? initialMarket === "top"
                    ? "top-picks"
                    : initialMarket === "value"
                      ? "value-picks"
                      : (marketPresentation[initialMarket]?.slug ?? initialMarket)
                  : scope
              }
            />
          </div>
        </main>

        {selectedMatch && selectedMarket && <aside className={styles.intelligenceRail}>
          <section className={styles.oraclePanel}>
            <div className={styles.oraclePanelHeader}>
              <span><Sparkles size={15} /> {copy.oraclePick}</span>
            </div>
            <div className={styles.selectedFixture}>
              <div className={styles.fixtureTeams}>
                <span><Crest team={selectedMatch.home} />{selectedMatch.home.name}</span>
                <strong>vs</strong>
                <span><Crest team={selectedMatch.away} />{selectedMatch.away.name}</span>
              </div>
              <div className={styles.fixtureTime}><Clock3 size={14} /> {selectedMatch.kickoff}</div>
            </div>
            <div className={styles.oracleDecision}>
              <div className={styles.oracleScoreMetric} title={interpolate(copy.oracleScore, { score: selectedMarket.confidence })}>
                <OracleGauge score={selectedMarket.confidence} />
              </div>
              <div>
                <h2>{selectedMarket.selection}</h2>
                <span>{selectedMarket.odds ?? "—"} {copy.odds}</span>
              </div>
            </div>
            {selectedMarket.outcome && (
              <div className={styles.settlementBanner}>
                <OutcomeBadge outcome={selectedMarket.outcome} labels={statuses} />
                <span>{copy.settledFullTime}</span>
              </div>
            )}
            {selectedMatch.insight && <p className={styles.insight}>{translateInsight(locale, selectedMatch.insight)}</p>}
            <div className={styles.panelActions}>
              <button className={styles.primaryButton} disabled={!selectedMatch.slug} onClick={() => selectedMatch.slug && router.push(`/${locale}/match/${selectedMatch.slug}`)}>{copy.fullIntelligence} <ChevronRight size={16} /></button>
              {SHOW_TODAY_ADD_TO_PICKS && (
                <button
                  className={styles.secondaryButton}
                  onClick={() => selectedMarket.available && !selectedMarket.outcome && toggleSet(setAdded, selectedPickKey)}
                  disabled={Boolean(selectedMarket.outcome) || !selectedMarket.available}
                >
                  {selectedMarket.outcome ? <CircleCheck size={16} /> : added.has(selectedPickKey) ? <Check size={16} /> : <Plus size={16} />}
                  {selectedMarket.outcome ? copy.settled : added.has(selectedPickKey) ? copy.added : copy.myPicks}
                </button>
              )}
            </div>
          </section>

          <section className={styles.builderPanel}>
            <div className={styles.panelTitle}>
              <span><WandSparkles size={17} /> {copy.myPicks}</span>
              <small>{selectedPicks.length} {copy.selections}</small>
            </div>
            {selectedPicks.length === 0 ? (
              <div className={styles.builderEmpty}>
                <p>{copy.addPicksHelp}</p>
              </div>
            ) : (
              <div className={styles.builderList}>
                {selectedPicks.map(({ key, match, market }) => (
                  <div key={key}>
                    <span>{match.home.shortName} vs {match.away.shortName}</span>
                    <strong>{market.selection}</strong>
                    <button onClick={() => toggleSet(setAdded, key)} aria-label={interpolate(copy.removePick, { pick: market.selection })}><X size={15} /></button>
                  </div>
                ))}
                <button className={styles.analyzeButton} onClick={() => navigate("multi-picks/builder")}>{copy.buildMyAcca} <ChevronRight size={16} /></button>
              </div>
            )}
          </section>

          <section className={styles.performancePanel}>
            <div className={styles.panelTitle}>
              <span><Trophy size={17} /> {copy.verifiedPerformance}</span>
              <button aria-label={copy.methodology} title={copy.methodology}><ShieldCheck size={16} /></button>
            </div>
            <div className={styles.performanceMetric}>
              <strong>{feed.performance.hitRate === null ? "—" : `${feed.performance.hitRate.toFixed(1)}%`}</strong>
              <span>{copy.hitRate}</span>
              <small>{feed.performance.period}</small>
            </div>
            <div className={styles.performanceDetails}>
              <span><strong>{feed.performance.settled ?? "—"}</strong> {copy.settledPicks}</span>
            </div>
            <button className={styles.performanceLink} onClick={() => router.push(`/${locale}/results`)}>{copy.viewHistory} <ChevronRight size={16} /></button>
          </section>
        </aside>}
      </div>

      {selectedPicks.length > 0 && (
        <button className={styles.mobileBuilderBar} onClick={() => navigate("multi-picks/builder")}>
          <span><WandSparkles size={17} /> {copy.myPicks} · {selectedPicks.length}</span>
          <strong>{copy.buildAcca} <ChevronRight size={16} /></strong>
        </button>
      )}

      <nav className={styles.mobileBottomNav} aria-label={common.mobileNavigation}>
        {navItems.slice(0, 5).map(({ label, icon: Icon, active, route }) => (
          <button key={label} className={active ? styles.mobileNavActive : ""} onClick={() => navigate(route)}>
            <Icon size={19} />
            <span>{common[label]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
