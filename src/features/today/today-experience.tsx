"use client";

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
  Globe2,
  Home,
  Languages,
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
import { useEffect, useMemo, useRef, useState } from "react";
import { MboMark } from "@/components/brand/brand-marks";
import { MobileProductMenu } from "@/components/navigation/mobile-product-menu";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { getMessages, localeTags } from "@/i18n/messages";
import { withMultiPickTerminology } from "@/i18n/multi-pick-terminology";
import { systemLabels } from "@/i18n/system-labels";
import { interpolate, todayLabels, type TodayLabels } from "./labels";
import { translateInsight } from "./insights";
import type { Competition, Match, OracleMarket, PredictionMarket, Team, TipOutcome, TodayData } from "./types";
import styles from "./today-experience.module.css";

type Filter = "all" | "live" | "oracle" | "following";
type PredictionLens = "best" | Exclude<PredictionMarket, "ORACLE_PICK">;
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
  { value: "MIXED", text: "Mixed" }, { value: "REGULAR", text: "Regular" },
  { value: "BTTS", text: "GG/NG" },
  { value: "TOTAL_2_5", text: "O/U 2.5" },
  { value: "CORRECT_SCORE", text: "Correct Score" },
] as const;

const showMoreLabels: Record<Locale, string> = {
  en: "Show more competitions",
  es: "Mostrar más competiciones",
  fr: "Afficher plus de compétitions",
  de: "Weitere Wettbewerbe anzeigen",
  it: "Mostra altre competizioni",
  pt: "Mostrar mais competições",
};

const navItems = [
  { label: "today", icon: Home, active: true, route: "today" },
  { label: "explore", icon: Compass, active: false, route: "explore" },
  { label: "accas", icon: WandSparkles, active: false, route: "multi-picks" },
  { label: "results", icon: BarChart3, active: false, route: "results" },
  { label: "saved", icon: Bookmark, active: false, route: "saved" },
  { label: "betslip", icon: ReceiptText, active: false, route: "betslip" },
] as const;

// Prototype surface retained until MyBetOracle Saved/preferences is integrated.
// These values are visual placeholders and must not be sourced from DoubleEngine.
const pinnedCompetitions = [
  ["ENG", "Premier League", "12"],
  ["EUR", "Champions League", "8"],
  ["ESP", "LaLiga", "6"],
  ["ITA", "Serie A", "5"],
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
  return lens === "best" ? "ORACLE_PICK" : lens;
}

function getMarket(match: Match, lens: PredictionLens): OracleMarket {
  return match.markets[resolveMarketKey(match, lens)];
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
        <span className={styles.mobilePick} title={market.selection}>{market.shortSelection}</span>
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
    </article>
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
        <button className={styles.competitionIdentity} onClick={onToggle} aria-expanded={!collapsed}>
          <span className={styles.countryCode}>{competition.countryFlagUrl ? <Image src={competition.countryFlagUrl} alt="" width={22} height={16} /> : competition.countryCode}</span>
          {competition.emblemUrl && <Image className={styles.competitionEmblem} src={competition.emblemUrl} alt="" width={24} height={24} />}
          <strong>{competition.name}</strong>
          <ChevronDown className={collapsed ? styles.chevronCollapsed : ""} size={17} />
        </button>
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

export function TodayExperience({ data, locale }: { data: TodayData; locale: Locale }) {
  const router = useRouter();
  const [feed, setFeed] = useState(data);
  const [allFeed, setAllFeed] = useState(data);
  const copy = withMultiPickTerminology(todayLabels[locale], locale, "today");
  const common = getMessages(locale).common;
  const statuses = { won: common.won, lost: common.lost, void: common.void };
  const allMatches = useMemo(() => feed.competitions.flatMap((competition) => competition.matches), [feed.competitions]);
  const [filter, setFilter] = useState<Filter>("all");
  const [marketLens, setMarketLens] = useState<PredictionLens>("best");
  const [query, setQuery] = useState("");
  const [followed, setFollowed] = useState(new Set<string>());
  const [added, setAdded] = useState(new Set<string>());
  const [collapsed, setCollapsed] = useState(new Set<string>());
  const [selectedMatch, setSelectedMatch] = useState<Match>(() => data.oraclePick ?? allMatches.find((match) => match.id === data.oraclePickId) ?? allMatches[0]!);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visibleCompetitionCount, setVisibleCompetitionCount] = useState(20);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);
  const [loadingView, setLoadingView] = useState(false);
  const [viewFailed, setViewFailed] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const [searchAttempt, setSearchAttempt] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const loadMoreTriggerRef = useRef<HTMLButtonElement>(null);

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
    if (search.length < 2) return;

    const controller = new AbortController();
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          date: allFeed.dateIso.slice(0, 10),
          locale,
          view: "all",
          page: "1",
          search,
        });
        const response = await fetch(`/api/today?${params}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("TODAY_SEARCH_UNAVAILABLE");
        const next = await response.json() as TodayData;
        if (active) {
          setFeed({
            ...next,
            oraclePickId: allFeed.oraclePickId,
            oraclePick: allFeed.oraclePick,
            performance: allFeed.performance,
          });
          setVisibleCompetitionCount(20);
        }
      } catch (error) {
        if (active && !(error instanceof DOMException && error.name === "AbortError")) setSearchFailed(true);
      } finally {
        if (active) setSearchLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [allFeed, locale, query, searchAttempt]);

  useEffect(() => {
    let active=true;
    fetch(`/api/saved?locale=${locale}`,{cache:"no-store"}).then(async response=>response.ok?response.json():null).then(data=>{if(active&&Array.isArray(data?.matches))setFollowed(new Set(data.matches.map((item:{fixtureId?:string})=>item.fixtureId).filter(Boolean)))}).catch(()=>{});
    return()=>{active=false};
  }, [locale]);

  useEffect(() => {
    const source = new EventSource(`/api/live?date=${encodeURIComponent(feed.dateIso.slice(0, 10))}`);
    const update = (event: MessageEvent<string>) => { try {
      const payload = JSON.parse(event.data) as { fixtureId?: string; statusCode?: string; homeScore?: number | null; awayScore?: number | null; elapsedMinute?: number | null; predictionResults?: Array<{ predictionId: string; marketGroup: PredictionMarket; result: "PENDING" | "WON" | "LOST" | "VOID" }> };
      if (!payload.fixtureId) return;
      const apply = (match: Match): Match => {
        if (match.id !== payload.fixtureId) return match;
        const results = new Map((payload.predictionResults ?? []).map((result) => [result.predictionId, result.result]));
        const markets = Object.fromEntries(Object.entries(match.markets).map(([group, market]) => {
          const result = market.predictionId ? results.get(market.predictionId) : undefined;
          const outcome: TipOutcome | undefined = result === "WON" ? "won" : result === "LOST" ? "lost" : result === "VOID" ? "void" : market.outcome;
          return [group, { ...market, outcome }];
        })) as Match["markets"];
        return { ...match, markets, statusCode: payload.statusCode ?? match.statusCode, state: payload.statusCode ? stateForLiveCode(payload.statusCode) : match.state, kickoff: payload.statusCode ? `${payload.statusCode}${payload.elapsedMinute !== null && payload.elapsedMinute !== undefined ? ` ${payload.elapsedMinute}'` : ""}` : match.kickoff, elapsedMinute: payload.elapsedMinute ?? match.elapsedMinute, score: payload.homeScore !== undefined || payload.awayScore !== undefined ? [payload.homeScore ?? null, payload.awayScore ?? null] : match.score };
      };
      setFeed((current) => ({ ...current, competitions: current.competitions.map((competition) => ({ ...competition, matches: competition.matches.map(apply) })) }));
      setSelectedMatch((current) => apply(current));
    } catch {} };
    source.addEventListener("fixture_update", update as EventListener); return () => source.close();
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
          return matchesFilter;
        }),
      }))
      .filter((competition) => competition.matches.length > 0);
  }, [feed.competitions, filter, followed]);

  const visibleCompetitions = filteredCompetitions.slice(0, visibleCompetitionCount);

  useEffect(() => {
    const trigger = loadMoreTriggerRef.current;
    if (!trigger || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loadingMore) trigger.click();
    }, { rootMargin: "500px 0px" });
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [feed.pagination.hasMore, filteredCompetitions.length, loadingMore, visibleCompetitionCount]);

  async function loadMoreFixtures() {
    if (loadingMore || !feed.pagination.hasMore || !feed.pagination.nextCursor) return;
    setLoadingMore(true);
    setLoadMoreFailed(false);
    try {
      const view = filter === "live" ? "live" : "all";
      const search = query.trim().length >= 2 ? query.trim() : undefined;
      const params = new URLSearchParams({ date: feed.dateIso.slice(0, 10), locale, view, page: String(feed.pagination.page + 1), cursor: feed.pagination.nextCursor });
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
      setLoadingMore(false);
    }
  }

  async function selectFilter(value: Filter) {
    if (query) {
      setQuery("");
      setSearchLoading(false);
      setSearchFailed(false);
    }
    setFilter(value);
    setVisibleCompetitionCount(20);
    setLoadMoreFailed(false);
    setViewFailed(false);
    if (value !== "live") {
      setFeed(allFeed);
      return;
    }
    setLoadingView(true);
    try {
      const response = await fetch(`/api/today?date=${data.dateIso.slice(0, 10)}&locale=${locale}&view=live&page=1`, { cache: "no-store" });
      if (!response.ok) throw new Error("LIVE_VIEW_UNAVAILABLE");
      const next = await response.json() as TodayData;
      setFeed(next);
    } catch {
      setViewFailed(true);
    } finally {
      setLoadingView(false);
    }
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
      router.push(`/${nextLocale}/today?date=${feed.dateIso.slice(0, 10)}`);
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
  const selectedMarket = getMarket(selectedMatch, marketLens);
  const selectedPickKey = getPickKey(selectedMatch, marketLens);
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
            {pinnedCompetitions.map(([code, name, count]) => (
              <button className={styles.pinnedLeague} key={name} onClick={() => router.push(`/${locale}/competitions/${name === "Premier League" ? "premier-league" : name === "LaLiga" ? "laliga" : name === "Serie A" ? "serie-a" : "premier-league"}`)}>
                <span>{code}</span>
                <strong>{name}</strong>
                <small>{count}</small>
              </button>
            ))}
          </div>}

          <div className={styles.sidebarFooter}>
            <button onClick={() => navigate("competitions")}><Globe2 size={17} /> {common.allCompetitions}</button>
            <button onClick={() => navigate("responsible-play")}><ShieldCheck size={17} /> {common.responsiblePlay}</button>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>{copy.todayMatches}</h1>
              <p>{feed.analyzedMatches === null ? feed.totalMatches : `${feed.analyzedMatches} ${copy.analyzed} · ${feed.totalMatches}`} {common.fixtures}</p>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.calendarButton} onClick={() => navigate("multi-picks")} title={copy.openAccas}><WandSparkles size={18} /> {common.accas}</button>
              <button className={styles.calendarButton} onClick={() => navigate("streaks")} title={copy.openStreaks}><Activity size={18} /> {common.streaks}</button>
              <button className={styles.calendarButton} onClick={() => navigate("calendar")} title={copy.openCalendar}><CalendarDays size={18} /> {copy.calendar}</button>
            </div>
          </div>

          <label className={styles.mobileSearch}>
            <Search size={18} />
            <input
              type="search"
              value={query}
              onChange={(event) => updateSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape" && query) {
                  event.preventDefault();
                  clearSearch(false);
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
          </label>

          <section className={styles.dateRail} aria-label={copy.matchDate}>
            <button className={styles.dateArrow} onClick={() => changeDate(-1)} aria-label={copy.previousDay}><ChevronLeft size={20} /></button>
            {[-1, 0, 1].map((relative) => {
              const date = new Date(feed.dateIso);
              date.setUTCDate(date.getUTCDate() + relative);
              return (
                <button key={relative} onClick={() => changeDate(relative)} className={relative === 0 ? styles.dateActive : ""}>
                  <span>{relative === 0 ? common.today : shortDateFormatter.format(date)}</span>
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
            <div className={styles.marketSegments} role="tablist" aria-label={copy.marketFamilies}>
              {marketOptions.map((option) => (
                <button
                  key={option.value}
                  className={marketLens === option.value ? styles.marketSegmentActive : ""}
                  onClick={() => setMarketLens(option.value)}
                  role="tab"
                  aria-selected={marketLens === option.value}
                  title={"title" in option ? copy[option.title] : option.text}
                >
                  {option.value === "best" && <Sparkles size={14} />}
                  <span>{"label" in option ? copy[option.label] : option.text}</span>
                </button>
              ))}
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
                selectedId={selectedMatch.id}
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
                <strong>{copy.noMatches}</strong>
                <p>{copy.noMatchesHelp}</p>
                <button onClick={() => { setQuery(""); setFilter("all"); setVisibleCompetitionCount(20); }}>{copy.clearFilters}</button>
              </div>
            )}
            {!loadingView && !searchLoading && !viewFailed && !searchFailed && visibleCompetitionCount < filteredCompetitions.length && (
              <button
                ref={loadMoreTriggerRef}
                className={styles.showMoreButton}
                onClick={() => setVisibleCompetitionCount((current) => current + 20)}
              >
                {showMoreLabels[locale]}
                <span>{visibleCompetitionCount} / {filteredCompetitions.length}</span>
              </button>
            )}
            {!loadingView && !searchLoading && !viewFailed && !searchFailed && visibleCompetitionCount >= filteredCompetitions.length && feed.pagination.hasMore && (
              <button ref={loadMoreTriggerRef} className={styles.showMoreButton} onClick={() => void loadMoreFixtures()} disabled={loadingMore}>
                {loadingMore ? `${showMoreLabels[locale]}…` : loadMoreFailed ? systemLabels[locale].retry : showMoreLabels[locale]}
                <span>{allMatches.length} / {feed.pagination.total}</span>
              </button>
            )}
          </div>
        </main>

        <aside className={styles.intelligenceRail}>
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
        </aside>
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
