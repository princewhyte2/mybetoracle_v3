"use client";

import {
  BarChart3,
  Bell,
  Bookmark,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Compass,
  Database,
  Globe2,
  Home,
  Languages,
  MapPin,
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
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MboMark } from "@/components/brand/brand-marks";
import { MobileProductMenu } from "@/components/navigation/mobile-product-menu";
import { locales, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import shellStyles from "@/features/today/today-experience.module.css";
import type { MatchDetail, MatchDetailTeam, MatchStreak } from "./types";
import { matchLabels, matchScopeLabel, matchStatLabel, type MatchLabels } from "./labels";
import styles from "./match-experience.module.css";

type MatchTab = "overview" | "oracle" | "h2h" | "lineups" | "stats";

function statusFromCode(code: string): MatchDetail["status"] { if (["FT", "AET", "PEN"].includes(code)) return "finished"; if (["NS", "TBD", "PST", "CANC", "ABD", "AWD", "WO"].includes(code)) return "scheduled"; return "live"; }

// Launch presentation only; retain the existing interaction for later review.
const SHOW_MATCH_ADD_TO_PICKS = false;

const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Espanol",
  fr: "Francais",
  de: "Deutsch",
  it: "Italiano",
  pt: "Portugues",
};

export const previewCopy: Record<Locale, { title: string; description: string }> = {
  en: { title: "Match preview", description: "Sample data demonstrates the complete Match Details experience. It is not verified live match intelligence." },
  es: { title: "Vista previa del partido", description: "Los datos de ejemplo muestran la experiencia completa. No es información de partido verificada en directo." },
  fr: { title: "Aperçu du match", description: "Les données d’exemple présentent l’expérience complète. Il ne s’agit pas de données de match vérifiées en direct." },
  de: { title: "Spielvorschau", description: "Beispieldaten zeigen das vollständige Spielerlebnis. Es handelt sich nicht um verifizierte Live-Spieldaten." },
  it: { title: "Anteprima partita", description: "I dati di esempio mostrano l’esperienza completa. Non sono informazioni live verificate." },
  pt: { title: "Prévia da partida", description: "Os dados de exemplo demonstram a experiência completa. Não são informações ao vivo verificadas." },
};

const tabIds: MatchTab[] = ["overview", "oracle", "h2h", "lineups", "stats"];
const navItems = [{key:"today",icon:Home,route:"today"},{key:"explore",icon:Compass,route:"explore"},{key:"accas",icon:WandSparkles,route:"multi-picks"},{key:"results",icon:BarChart3,route:"results"},{key:"saved",icon:Bookmark,route:"saved"},{key:"betslip",icon:ReceiptText,route:"betslip"}] as const;

function Crest({ team, large = false }: { team: MatchDetailTeam; large?: boolean }) {
  if (team.emblemUrl) {
    return <span className={`${styles.crest} ${large ? styles.crestLarge : ""}`}><Image src={team.emblemUrl} alt="" width={large ? 72 : 32} height={large ? 72 : 32} /></span>;
  }
  return (
    <span
      className={`${styles.crest} ${large ? styles.crestLarge : ""}`}
      style={{ "--crest-primary": team.colors[0], "--crest-secondary": team.colors[1] } as React.CSSProperties}
      aria-hidden="true"
    >
      {team.shortName.slice(0, 2)}
    </span>
  );
}

function FormStrip({ team, copy }: { team: MatchDetailTeam; copy: MatchLabels }) {
  if (!team.form.length) return null;
  return (
    <div className={styles.formStrip} aria-label={`${team.name} ${copy.recentForm}`}>
      {team.form.map((result, index) => <span className={styles[`form${result}`]} key={`${result}-${index}`}>{result}</span>)}
    </div>
  );
}

function StreakColumn({ team, streaks, locale, copy }: { team: MatchDetailTeam; streaks: MatchStreak[]; locale: Locale; copy: MatchLabels }) {
  return (
    <div className={styles.streakColumn}>
      <header><Crest team={team} /><div><strong>{team.name}</strong><span>{copy.relevantPatterns}</span></div></header>
      <div>
        {streaks.map((streak) => (
          <button key={streak.id} title={`${streak.sampleSize} ${copy.eligibleFixtures}`}>
            <span><strong>{streak.shortLabel}</strong><small>{matchScopeLabel(locale, streak.scope)} / {streak.sampleSize} {copy.eligible}</small></span>
            <b>{streak.currentLength}</b>
          </button>
        ))}
      </div>
    </div>
  );
}

function OraclePanel({ match, copy }: { match: MatchDetail; copy: MatchLabels }) {
  return (
    <section className={styles.oraclePanel}>
      <header><span><Sparkles size={15} /> {copy.oracleDecision}</span><small>{copy.preMatch}</small></header>
      <div className={styles.oracleDecision}>
        <div className={styles.oracleScore} title="Oracle Score"><strong>{match.oracleScore}</strong><span>/100</span></div>
        <div className={styles.oraclePick}><span>{match.oracleMarket.market}</span><h2>{match.oracleMarket.selection}</h2></div>
        <div className={styles.oracleAction}><span>{copy.referenceOdds}</span><strong>{match.oracleMarket.odds}</strong>{SHOW_MATCH_ADD_TO_PICKS && <button><Plus size={16} /> {copy.myPicks}</button>}</div>
      </div>
      <div className={styles.predictionGrid}>{match.predictions.map((prediction) => <div key={prediction.market}><span>{prediction.market}</span><strong>{prediction.selection}</strong><small>{prediction.confidence}/100{prediction.odds ? ` · ${prediction.odds}` : ""}</small></div>)}</div>
      <div className={styles.evidenceStrip}>{match.evidence.map((item) => <span key={item}><Database size={13} /> {item}</span>)}</div>
    </section>
  );
}

function StreakSection({ match, onOpen, locale, copy }: { match: MatchDetail; onOpen: () => void; locale: Locale; copy: MatchLabels }) {
  const homeStreaks = match.streaks.filter((item) => item.teamId === match.home.id);
  const awayStreaks = match.streaks.filter((item) => item.teamId === match.away.id);
  return (
    <section className={styles.contentSection}>
      <div className={styles.sectionHeading}><div><span>{copy.historicalEvidence}</span><h2>{copy.matchStreaks}</h2></div><button onClick={onOpen}>{copy.compareExplorer} <ChevronRight size={15} /></button></div>
      <div className={styles.streakCompare}><StreakColumn team={match.home} streaks={homeStreaks} locale={locale} copy={copy} /><div className={styles.compareDivider}>vs</div><StreakColumn team={match.away} streaks={awayStreaks} locale={locale} copy={copy} /></div>
      <p className={styles.evidenceNote}>{copy.evidenceHistory}</p>
    </section>
  );
}

function H2HSection({ match, locale, copy }: { match: MatchDetail; locale: Locale; copy: MatchLabels }) {
  if (match.availability.h2h !== "available" || !match.h2h.length) return <UnavailableSection title={copy.headToHead} message={copy.notConfirmed} />;
  const formatter = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" });
  const summary = match.h2h.reduce((result, item) => {
    if (item.score[0] === item.score[1]) result.draws += 1;
    else {
      const winner = item.score[0] > item.score[1] ? item.home : item.away;
      if (winner === match.home.name) result.home += 1;
      if (winner === match.away.name) result.away += 1;
    }
    return result;
  }, { home: 0, draws: 0, away: 0 });
  return (
    <section className={styles.contentSection}>
      <div className={styles.sectionHeading}><div><span>{copy.previousMeetings}</span><h2>{copy.headToHead}</h2></div><small>{copy.lastFive}</small></div>
      <div className={styles.h2hSummary}><span><strong>{summary.home}</strong> {match.home.name}</span><span><strong>{summary.draws}</strong> {copy.draw}</span><span><strong>{summary.away}</strong> {match.away.name}</span></div>
      <div className={styles.h2hList}>
        {match.h2h.map((item) => <div key={item.id}><time>{formatter.format(new Date(item.date))}</time><span>{item.home}</span><strong>{item.score[0]} - {item.score[1]}</strong><span>{item.away}</span><small>{item.competition}</small></div>)}
      </div>
    </section>
  );
}

function StatsSection({ match, locale, copy }: { match: MatchDetail; locale: Locale; copy: MatchLabels }) {
  if (match.availability.statistics !== "available" || !match.comparison.length) return <UnavailableSection title={copy.statistics} message={copy.notConfirmed} />;
  return (
    <section className={styles.contentSection}>
      <div className={styles.sectionHeading}><div><span>{copy.seasonBaseline}</span><h2>{copy.teamComparison}</h2></div><small>{copy.leagueMatches}</small></div>
      <div className={styles.statsHeader}><span>{match.home.shortName}</span><span>{match.away.shortName}</span></div>
      <div className={styles.statRows}>
        {match.comparison.map((item) => {
          const total = Math.max(item.home + item.away, 1);
          const format = (value: number) => item.format === "percent" ? `${value}%` : item.format === "decimal" ? value.toFixed(item.label === "Expected goals" ? 2 : 1) : value;
          return <div key={item.label}><div><strong>{format(item.home)}</strong><span>{matchStatLabel(locale,item.label)}</span><strong>{format(item.away)}</strong></div><div className={styles.statTrack}><i style={{ width: `${(item.home / total) * 100}%` }} /><b style={{ width: `${(item.away / total) * 100}%` }} /></div></div>;
        })}
      </div>
    </section>
  );
}

function LineupsSection({ match, copy }: { match: MatchDetail; copy: MatchLabels }) {
  if (match.availability.lineups !== "available" || !match.lineup.home.length || !match.lineup.away.length) return <UnavailableSection title={copy.lineups} message={copy.notConfirmed} />;
  return (
    <section className={styles.contentSection}>
      <div className={styles.sectionHeading}><div><span>{copy.expectedXi}</span><h2>{copy.probableLineups}</h2></div><small>{copy.notConfirmed}</small></div>
      <div className={styles.lineupHeader}><span><Crest team={match.home} /> {match.home.name} <b>{match.lineup.formationHome}</b></span><span><b>{match.lineup.formationAway}</b> {match.away.name} <Crest team={match.away} /></span></div>
      <div className={styles.lineupGrid}>
        <ol>{match.lineup.home.map((player, index) => <li key={player}><span>{index + 1}</span>{player}</li>)}</ol>
        <ol>{match.lineup.away.map((player, index) => <li key={player}>{player}<span>{index + 1}</span></li>)}</ol>
      </div>
    </section>
  );
}

function UnavailableSection({ title, message }: { title: string; message: string }) {
  return <section className={`${styles.contentSection} ${styles.unavailableSection}`}><h2>{title}</h2><p>{message}</p></section>;
}

const eventTypeLabels: Record<Locale, Record<string, string>> = {
  en: { GOAL: "Goal", CARD: "Card", SUBSTITUTION: "Substitution", VAR: "VAR", OTHER: "Match event" },
  fr: { GOAL: "But", CARD: "Carton", SUBSTITUTION: "Remplacement", VAR: "VAR", OTHER: "Événement" },
  es: { GOAL: "Gol", CARD: "Tarjeta", SUBSTITUTION: "Sustitución", VAR: "VAR", OTHER: "Evento" },
  de: { GOAL: "Tor", CARD: "Karte", SUBSTITUTION: "Wechsel", VAR: "VAR", OTHER: "Spielereignis" },
  it: { GOAL: "Gol", CARD: "Cartellino", SUBSTITUTION: "Sostituzione", VAR: "VAR", OTHER: "Evento" },
  pt: { GOAL: "Golo", CARD: "Cartão", SUBSTITUTION: "Substituição", VAR: "VAR", OTHER: "Evento" },
};

function TimelineSection({ match, locale, copy }: { match: MatchDetail; locale: Locale; copy: MatchLabels }) {
  if (!match.events.length) return null;
  return <section className={styles.contentSection}><div className={styles.sectionHeading}><div><span>{copy.overview}</span><h2>{copy.match}</h2></div></div><ol className={styles.timeline}>{match.events.map((event) => <li key={event.id}><time>{event.minute ?? "—"}{event.extra ? `+${event.extra}` : ""}&apos;</time><strong>{eventTypeLabels[locale][event.type] ?? eventTypeLabels[locale].OTHER}</strong><span>{event.player ?? (event.teamId === match.home.id ? match.home.name : event.teamId === match.away.id ? match.away.name : "")}{event.assist ? ` · ${event.assist}` : ""}</span></li>)}</ol></section>;
}

export function MatchExperience({ match: initialMatch, locale }: { match: MatchDetail; locale: Locale }) {
  const router = useRouter();
  const [match, setMatch] = useState(initialMatch);
  const [activeTab, setActiveTab] = useState<MatchTab>("overview");
  const [saved, setSaved] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const copy = matchLabels[locale];
  const common = getMessages(locale).common;
  const tabs = tabIds.map((id) => ({ id, label: copy[id] }));
  const sidebarSections: Array<{ label: string; tab: MatchTab }> = [
    { label: copy.overview, tab: "overview" },
    { label: copy.oracleAnalysis, tab: "oracle" },
    { label: copy.teamStreaks, tab: "overview" },
    { label: copy.headToHead, tab: "h2h" },
    { label: copy.lineups, tab: "lineups" },
    { label: copy.statistics, tab: "stats" },
  ];
  const kickoff = useMemo(() => new Date(match.kickoffAt), [match.kickoffAt]);
  const dateFormatter = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const timeFormatter = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    const publicId = initialMatch.slug.split("--").at(-1); if (!publicId) return;
    const source = new EventSource(`/api/live?fixtures=${encodeURIComponent(publicId)}`);
    const update = (event: MessageEvent<string>) => { try { const payload = JSON.parse(event.data) as { fixtureId?: string; statusCode?: string; homeScore?: number | null; awayScore?: number | null; elapsedMinute?: number | null; observedAt?: string }; if (payload.fixtureId !== initialMatch.id) return; setMatch((current) => ({ ...current, statusCode: payload.statusCode ?? current.statusCode, status: payload.statusCode ? statusFromCode(payload.statusCode) : current.status, score: payload.homeScore !== undefined || payload.awayScore !== undefined ? [payload.homeScore ?? null, payload.awayScore ?? null] : current.score, elapsedMinute: payload.elapsedMinute ?? current.elapsedMinute, sourceUpdatedAt: payload.observedAt ?? current.sourceUpdatedAt })); } catch {} };
    source.addEventListener("fixture_update", update as EventListener); return () => source.close();
  }, [initialMatch]);

  function navigate(route?: string) { if (route) router.push(`/${locale}/${route}`); }
  function switchLocale(nextLocale: string) { if (locales.includes(nextLocale as Locale)) router.push(`/${nextLocale}/match/${match.slug}`); }

  return (
    <div className={`${shellStyles.app} ${styles.app}`}>
      <header className={shellStyles.topbar}>
        <div className={shellStyles.topbarInner}>
          <button className={`${shellStyles.brand} ${styles.brandButton}`} onClick={() => navigate("today")} aria-label={`MyBetOracle ${common.today}`}><MboMark className={shellStyles.brandMark} title="MyBetOracle" /><span className={shellStyles.brandName}>MyBetOracle</span></button>
          <label className={shellStyles.globalSearch}><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} aria-label={copy.searchFootball} /><span>Ctrl K</span></label>
          <div className={shellStyles.topbarActions}>
            <button className={shellStyles.topIconButton} title={common.notifications} aria-label={common.notifications} onClick={() => navigate("saved")}><Bell size={19} /></button>
            <label className={shellStyles.localeSelect}><Languages size={18} /><select value={locale} onChange={(event) => switchLocale(event.target.value)} aria-label={common.language}>{locales.map((item) => <option value={item} key={item}>{localeNames[item]}</option>)}</select></label>
            <button className={shellStyles.avatarButton} title={common.profile} aria-label={common.profile} onClick={() => navigate("profile")}><UserCircle size={24} /></button>
            <button className={shellStyles.mobileMenuButton} onClick={() => setMobileMenuOpen((current) => !current)} aria-label={common.openNavigation}>{mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}</button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && <MobileProductMenu locale={locale} activeRoute="today" onNavigate={() => setMobileMenuOpen(false)} />}

      <div className={shellStyles.shell}>
        <aside className={shellStyles.sidebar}>
          <nav className={shellStyles.primaryNav} aria-label={common.primaryNavigation}>{navItems.map(({ key, icon: Icon, route }) => <button key={key} className={key === "today" ? shellStyles.navActive : ""} onClick={() => navigate(route)}><Icon size={19} /><span>{common[key]}</span></button>)}</nav>
          <div className={shellStyles.sidebarSection}><div className={shellStyles.sidebarHeading}><span>{copy.match}</span></div>{sidebarSections.map((item) => <button className={styles.matchLink} aria-current={activeTab === item.tab ? "page" : undefined} onClick={() => setActiveTab(item.tab)} key={item.label}>{item.label}<ChevronRight size={14} /></button>)}</div>
          <div className={shellStyles.sidebarFooter}><button onClick={() => navigate("competitions")}><Globe2 size={17} /> {copy.allCompetitions}</button><button onClick={() => navigate("responsible-play")}><ShieldCheck size={17} /> {copy.responsiblePlay}</button></div>
        </aside>

        <main className={`${shellStyles.main} ${styles.main}`}>
          <nav className={styles.breadcrumb} aria-label={copy.breadcrumb}><button onClick={() => navigate("today")}><ChevronLeft size={15} /> {common.today}</button><span>/</span><button onClick={() => navigate("competitions")}>{match.competition.name}</button></nav>

          <section className={styles.scoreboard}>
            <h1 className={styles.srOnly}>{match.home.name} vs {match.away.name}</h1>
            <div className={styles.competitionLine}><span>{match.competition.countryCode}</span><strong>{match.competition.name}</strong>{match.competition.round && <small>{match.competition.round}</small>}<button className={saved ? styles.saved : ""} onClick={() => setSaved((current) => !current)} aria-label={saved ? copy.removeSaved : copy.saveMatch}><Star size={17} fill={saved ? "currentColor" : "none"} /></button></div>
            <div className={styles.scoreMain}>
              <button className={`${styles.scoreTeam} ${styles.scoreTeamButton}`} onClick={() => router.push(`/${locale}/teams/${match.home.id}`)}><Crest team={match.home} large /><h2>{match.home.name}</h2><FormStrip team={match.home} copy={copy} /></button>
              <div className={styles.kickoffBlock}>{match.score && match.status !== "scheduled" ? <time>{match.score[0] ?? "—"} - {match.score[1] ?? "—"}</time> : <time>{timeFormatter.format(kickoff)}</time>}<span>{dateFormatter.format(kickoff)}</span><small>{match.status === "scheduled" ? copy.scheduled : `${match.statusCode}${match.elapsedMinute !== null ? ` · ${match.elapsedMinute}'` : ""}`}</small></div>
              <button className={`${styles.scoreTeam} ${styles.scoreTeamButton}`} onClick={() => router.push(`/${locale}/teams/${match.away.id}`)}><Crest team={match.away} large /><h2>{match.away.name}</h2><FormStrip team={match.away} copy={copy} /></button>
            </div>
            {(match.venue || match.referee) && <div className={styles.venueLine}>{match.venue && <span><MapPin size={13} /> {match.venue}{match.city ? `, ${match.city}` : ""}</span>}{match.referee && <span><CircleDot size={13} /> {copy.referee}: {match.referee}</span>}</div>}
          </section>

          <nav className={styles.matchTabs} aria-label={copy.matchSections}>{tabs.map((tab) => <button className={activeTab === tab.id ? styles.tabActive : ""} key={tab.id} onClick={() => setActiveTab(tab.id)}>{tab.label}{tab.id === "oracle" && <span>{match.oracleScore}</span>}</button>)}</nav>

          <div className={styles.contentStack}>
            {activeTab === "overview" && <TimelineSection match={match} locale={locale} copy={copy} />}
            {(activeTab === "overview" || activeTab === "oracle") && <OraclePanel match={match} copy={copy} />}
            {activeTab === "overview" && (match.availability.streaks === "available" && match.streaks.length ? <StreakSection match={match} locale={locale} copy={copy} onOpen={() => navigate(`streaks?teamId=${encodeURIComponent(match.home.id)}`)} /> : <UnavailableSection title={copy.matchStreaks} message={copy.notConfirmed} />)}
            {(activeTab === "overview" || activeTab === "stats") && <StatsSection match={match} locale={locale} copy={copy} />}
            {(activeTab === "overview" || activeTab === "h2h") && <H2HSection match={match} locale={locale} copy={copy} />}
            {(activeTab === "overview" || activeTab === "lineups") && <LineupsSection match={match} copy={copy} />}
          </div>
        </main>

        <aside className={`${shellStyles.intelligenceRail} ${styles.intelligenceRail}`}>
          <section className={styles.railPanel}><header><span>{copy.matchInformation}</span><CalendarDays size={15} /></header><dl><div><dt>{copy.kickoff}</dt><dd>{dateFormatter.format(kickoff)}, {timeFormatter.format(kickoff)}</dd></div>{match.venue && <div><dt>{copy.venue}</dt><dd>{match.venue}</dd></div>}{match.competition.round && <div><dt>{copy.round}</dt><dd>{match.competition.round}</dd></div>}{match.referee && <div><dt>{copy.referee}</dt><dd>{match.referee}</dd></div>}</dl></section>
          {match.availability.standings === "available" && match.standings.length > 0 && <section className={styles.railPanel}><header><span>{copy.standings}</span><Trophy size={15} /></header><div className={styles.standingsHeader}><span>#</span><span>{copy.team}</span><span>{copy.played}</span><span>{copy.points}</span></div>{match.standings.map((row) => <div className={`${styles.standingRow} ${row.highlighted ? styles.standingHighlighted : ""}`} key={row.team}><span>{row.position}</span><strong>{row.team}</strong><span>{row.played}</span><b>{row.points}</b></div>)}</section>}
          <section className={`${styles.railPanel} ${styles.railEvidence}`}><header><span>{copy.evidenceNote}</span><Database size={15} /></header><p>{copy.evidenceSignals}</p></section>
        </aside>
      </div>

      <nav className={shellStyles.mobileBottomNav} aria-label={copy.mobileNavigation}>{navItems.slice(0, 5).map(({ key, icon: Icon, route }) => <button key={key} className={key === "today" ? shellStyles.mobileNavActive : ""} onClick={() => navigate(route)}><Icon size={19} /><span>{common[key]}</span></button>)}</nav>
    </div>
  );
}
