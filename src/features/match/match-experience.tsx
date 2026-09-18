"use client";

import { predictionMarketLabel } from "@/i18n/prediction-markets";

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
import { AdSlot } from "@/components/ads/ad-slot";
import { MboMark } from "@/components/brand/brand-marks";
import { MobileProductMenu } from "@/components/navigation/mobile-product-menu";
import { locales, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import shellStyles from "@/features/today/today-experience.module.css";
import type { MatchDetail, MatchDetailTeam, MatchStreak } from "./types";
import { matchLabels, matchScopeLabel, matchStatLabel, type MatchLabels } from "./labels";
import { buildTrendSentence } from "./trend-sentences";
import styles from "./match-experience.module.css";
import { PlayerStatistics } from "./player-statistics";
import { LineupPitch } from "./lineup-pitch";
import { statisticLabel } from "./statistics-labels";
import { matchSectionVisibility } from "./section-visibility";

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

function StreakColumn({ team, streaks, scope, locale, copy }: { team: MatchDetailTeam; streaks: MatchStreak[]; scope: "HOME" | "AWAY"; locale: Locale; copy: MatchLabels }) {
  const trendSentence = buildTrendSentence(team, streaks, scope, locale);
  return (
    <div className={styles.streakColumn}>
      <header><Crest team={team} /><div><strong>{team.name}</strong><span>{copy.relevantPatterns}</span></div></header>
      {trendSentence && <p>{trendSentence}</p>}
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

function OraclePanel({ match, copy, outcomes, locale }: { match: MatchDetail; copy: MatchLabels; locale: Locale; outcomes: { won: string; lost: string; void: string } }) {
  return (
    <section className={styles.oraclePanel}>
      <header><span><Sparkles size={15} /> {copy.oracleDecision}</span><small>{copy.preMatch}</small></header>
      {match.oracleMarket.available && <div className={styles.oracleDecision}>
        {match.oracleMarket.available && <><div className={styles.oracleScore} title="Oracle Score"><strong>{match.oracleScore}</strong></div>
        <div className={styles.oraclePick}><span>{predictionMarketLabel(locale, match.oracleMarket.market)}</span><h2>{match.oracleMarket.selection}</h2></div></>}
        {match.oracleMarket.available && match.oracleMarket.odds !== null && <div className={styles.oracleAction}><span>{copy.referenceOdds}</span><strong>{match.oracleMarket.odds}</strong>{SHOW_MATCH_ADD_TO_PICKS && <button><Plus size={16} /> {copy.myPicks}</button>}</div>}
      </div>}
      <div className={styles.predictionGrid}>{match.predictions.filter(prediction => prediction.available).map((prediction) => <div key={prediction.market} data-outcome={prediction.outcome}><span>{predictionMarketLabel(locale, prediction.market)}</span><strong>{prediction.selection}</strong><small>{prediction.outcome ? outcomes[prediction.outcome] : `${prediction.confidence}/100${prediction.odds ? ` · ${prediction.odds}` : ""}`}</small></div>)}</div>
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
      <div className={styles.streakCompare}>{homeStreaks.length > 0 && <StreakColumn team={match.home} streaks={homeStreaks} scope="HOME" locale={locale} copy={copy} />}{homeStreaks.length > 0 && awayStreaks.length > 0 && <div className={styles.compareDivider}>vs</div>}{awayStreaks.length > 0 && <StreakColumn team={match.away} streaks={awayStreaks} scope="AWAY" locale={locale} copy={copy} />}</div>
      <p className={styles.evidenceNote}>{copy.evidenceHistory}</p>
    </section>
  );
}

function H2HSection({ match, locale, copy }: { match: MatchDetail; locale: Locale; copy: MatchLabels }) {
  const [venueFilter, setVenueFilter] = useState<"overall" | "home" | "away">("overall");
  const formatter = useMemo(() => new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }), [locale]);
  
  const { filteredMeetings, summary, total, homePct, drawPct, awayPct } = useMemo(() => {
    const filtered = match.h2h.filter((item) => {
      if (venueFilter === "home") return item.home === match.home.name;
      if (venueFilter === "away") return item.away === match.away.name || item.home === match.away.name;
      return true;
    });

    const sum = filtered.reduce((result, item) => {
      if (item.score[0] === item.score[1]) result.draws += 1;
      else {
        const winner = item.score[0] > item.score[1] ? item.home : item.away;
        if (winner === match.home.name) result.home += 1;
        if (winner === match.away.name) result.away += 1;
      }
      return result;
    }, { home: 0, draws: 0, away: 0 });

    const tot = Math.max(filtered.length, 1);
    const hp = Math.round((sum.home / tot) * 100);
    const dp = Math.round((sum.draws / tot) * 100);
    const ap = Math.max(0, 100 - hp - dp);

    return { filteredMeetings: filtered, summary: sum, total: tot, homePct: hp, drawPct: dp, awayPct: ap };
  }, [match.h2h, match.home.name, match.away.name, venueFilter]);

  if (match.availability.h2h !== "available" || !match.h2h.length) return null;

  return (
    <section className={styles.contentSection}>
      <div className={styles.sectionHeading}>
        <div><span>{copy.previousMeetings}</span><h2>{copy.headToHead}</h2></div>
        <small>{copy.lastFive}</small>
      </div>
      <div className={styles.venueToggleBar} role="group" aria-label={copy.headToHead}>
        <button
          type="button"
          className={`${styles.venueToggleButton} ${venueFilter === "overall" ? styles.venueToggleButtonActive : ""}`}
          onClick={() => setVenueFilter("overall")}
        >
          {copy.overall}
        </button>
        <button
          type="button"
          className={`${styles.venueToggleButton} ${venueFilter === "home" ? styles.venueToggleButtonActive : ""}`}
          onClick={() => setVenueFilter("home")}
        >
          {match.home.shortName} ({copy.home})
        </button>
        <button
          type="button"
          className={`${styles.venueToggleButton} ${venueFilter === "away" ? styles.venueToggleButtonActive : ""}`}
          onClick={() => setVenueFilter("away")}
        >
          {match.away.shortName} ({copy.away})
        </button>
      </div>

      <div className={styles.h2hDistributionWrap}>
        <div className={styles.h2hBar}>
          {summary.home > 0 && <div className={styles.h2hBarHome} style={{ width: `${(summary.home / total) * 100}%` }} title={`${match.home.name}: ${summary.home}`} />}
          {summary.draws > 0 && <div className={styles.h2hBarDraw} style={{ width: `${(summary.draws / total) * 100}%` }} title={`${copy.draw}: ${summary.draws}`} />}
          {summary.away > 0 && <div className={styles.h2hBarAway} style={{ width: `${(summary.away / total) * 100}%` }} title={`${match.away.name}: ${summary.away}`} />}
        </div>
        <div className={styles.h2hBarStats}>
          <span className={styles.h2hStatHome}><strong>{summary.home}</strong> {match.home.shortName} ({homePct}%)</span>
          <span className={styles.h2hStatDraw}><strong>{summary.draws}</strong> {copy.draw} ({drawPct}%)</span>
          <span className={styles.h2hStatAway}><strong>{summary.away}</strong> {match.away.shortName} ({awayPct}%)</span>
        </div>
      </div>

      <div className={styles.h2hList}>
        {filteredMeetings.map((item) => {
          const isHomeWinner = item.score[0] > item.score[1];
          const isAwayWinner = item.score[1] > item.score[0];
          return (
            <div key={item.id} className={styles.h2hRow}>
              <time>{formatter.format(new Date(item.date))}</time>
              <span className={isHomeWinner ? styles.h2hTeamWinner : ""}>{item.home}</span>
              <strong className={`${styles.h2hScore} ${isHomeWinner ? styles.h2hScoreHomeWin : isAwayWinner ? styles.h2hScoreAwayWin : styles.h2hScoreDraw}`}>{item.score[0]} - {item.score[1]}</strong>
              <span className={isAwayWinner ? styles.h2hTeamWinner : ""}>{item.away}</span>
              <small>{item.competition}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatsSection({ match, locale, copy }: { match: MatchDetail; locale: Locale; copy: MatchLabels }) {
  const [period, setPeriod] = useState("MATCH");
  const periods = useMemo(() => [...new Set(match.comparison.map(item => item.period ?? "MATCH"))], [match.comparison]);
  const selected = periods.includes(period) ? period : (periods[0] ?? "MATCH");
  const filteredComparison = useMemo(() => match.comparison.filter(item => (item.period ?? "MATCH") === selected), [match.comparison, selected]);

  if (match.availability.statistics !== "available" || !match.comparison.length) return null;
  return (
    <section className={styles.contentSection}>
      <div className={styles.sectionHeading}><h2>{copy.statistics}</h2>{periods.length > 1 && <select value={selected} onChange={event => setPeriod(event.target.value)} aria-label={copy.statistics}>{periods.map(value => <option key={value} value={value}>{value === "MATCH" ? copy.match : value}</option>)}</select>}</div>
      <div className={styles.statsHeader}><span>{match.home.shortName}</span><span>{match.away.shortName}</span></div>
      <div className={styles.statRows}>
        {filteredComparison.map((item) => {
          const total = Math.max(item.home + item.away, 1);
          const format = (value: number) => item.format === "percent" ? `${value}%` : item.format === "decimal" ? value.toFixed(item.label === "Expected goals" ? 2 : 1) : value;
          const isHomeDominant = item.home > item.away;
          const isAwayDominant = item.away > item.home;
          return (
            <div key={item.label} className={styles.statRow}>
              <div className={styles.statRowValues}>
                <strong className={isHomeDominant ? styles.statLeader : ""}>{format(item.home)}</strong>
                <span>{statisticLabel(locale, matchStatLabel(locale, item.label))}</span>
                <strong className={isAwayDominant ? styles.statLeader : ""}>{format(item.away)}</strong>
              </div>
              <div className={styles.statTrack}>
                <i style={{ width: `${(item.home / total) * 100}%` }} className={isHomeDominant ? styles.statTrackLeader : ""} />
                <b style={{ width: `${(item.away / total) * 100}%` }} className={isAwayDominant ? styles.statTrackLeader : ""} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LineupsSection({ match, copy, locale }: { match: MatchDetail; copy: MatchLabels; locale: Locale }) {
  if (!matchSectionVisibility(match).lineups) return null;
  return (
    <section className={styles.contentSection}>
      <div className={styles.sectionHeading}><h2>{copy.lineups}</h2></div>
      <LineupPitch match={match} locale={locale} />
    </section>
  );
}

function RecentResults({match,locale,copy}:{match:MatchDetail;locale:Locale;copy:MatchLabels}) {
  const formatter = useMemo(() => new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" }), [locale]);
  if(!match.recentResults?.home.length && !match.recentResults?.away.length) return null;
  return <section className={styles.contentSection}><div className={styles.sectionHeading}><h2>{copy.recentForm}</h2><small>{copy.allCompetitions}</small></div>{(["home","away"] as const).filter(side=>match.recentResults?.[side].length).map(side=><div key={side}><h3>{match[side].name}</h3><div className={styles.h2hList}>{match.recentResults?.[side].map(row=><div key={row.id} className={styles.h2hRow}><time>{formatter.format(new Date(row.date))}</time><span>{row.home}</span><strong>{row.score[0]} - {row.score[1]}</strong><span>{row.away}</span><small className={styles[`form${row.result}`]}>{row.result}</small></div>)}</div></div>)}</section>;
}

function EventBadge({ type, detail }: { type: string; detail: string | null }) {
  const d = detail?.toLowerCase() ?? "";
  if (type === "GOAL") {
    const isPen = d.includes("penalty");
    const isOwn = d.includes("own");
    return (
      <span className={`${styles.eventBadge} ${styles.eventBadgeGoal}`} title={detail ?? "Goal"}>
        ⚽{isPen ? <small>P</small> : isOwn ? <small>OG</small> : null}
      </span>
    );
  }
  if (type === "CARD") {
    const isRed = d.includes("red") || d.includes("second yellow");
    return (
      <span className={`${styles.eventBadge} ${isRed ? styles.eventBadgeRedCard : styles.eventBadgeYellowCard}`} title={detail ?? "Card"} />
    );
  }
  if (type === "SUBSTITUTION") {
    return <span className={`${styles.eventBadge} ${styles.eventBadgeSub}`} title={detail ?? "Substitution"}>🔁</span>;
  }
  if (type === "VAR") {
    return <span className={`${styles.eventBadge} ${styles.eventBadgeVar}`} title={detail ?? "VAR"}>🖥️</span>;
  }
  return <span className={`${styles.eventBadge} ${styles.eventBadgeOther}`}>•</span>;
}

function TimelineSection({ match, locale, copy }: { match: MatchDetail; locale: Locale; copy: MatchLabels }) {
  if (!match.events.length) return null;

  const { firstHalf, secondHalf, extraTime } = useMemo(() => {
    const sorted = [...match.events].sort((a, b) => {
      const minA = (a.minute ?? 0) * 100 + (a.extra ?? 0);
      const minB = (b.minute ?? 0) * 100 + (b.extra ?? 0);
      return minA - minB;
    });
    const fh: typeof sorted = [];
    const sh: typeof sorted = [];
    const et: typeof sorted = [];
    for (const ev of sorted) {
      const m = ev.minute ?? 0;
      if (m <= 45) fh.push(ev);
      else if (m <= 90) sh.push(ev);
      else et.push(ev);
    }
    return { firstHalf: fh, secondHalf: sh, extraTime: et };
  }, [match.events]);

  const renderEvent = (event: MatchDetail["events"][number]) => {
    let isHome = event.teamId === match.home.id;
    let isAway = event.teamId === match.away.id;
    if (!isHome && !isAway && event.player) {
      const norm = event.player.toLowerCase().trim();
      if (match.lineup.home.some(name => name.toLowerCase().trim().includes(norm) || norm.includes(name.toLowerCase().trim()))) {
        isHome = true;
      } else if (match.lineup.away.some(name => name.toLowerCase().trim().includes(norm) || norm.includes(name.toLowerCase().trim()))) {
        isAway = true;
      } else {
        isHome = true;
      }
    }
    const minuteStr = `${event.minute ?? "—"}${event.extra ? `+${event.extra}` : ""}'`;

    return (
      <div key={event.id} className={styles.timelineRow}>
        <div className={`${styles.timelineSide} ${styles.timelineSideHome}`}>
          {isHome && (
            <div className={styles.timelineCard}>
              <div className={styles.timelineCardBody}>
                <strong>{event.player ?? match.home.name}</strong>
                {event.assist && <small className={styles.timelineSubText}>({event.assist})</small>}
                {event.detail && !event.assist && <small className={styles.timelineSubText}>{event.detail}</small>}
              </div>
              <EventBadge type={event.type} detail={event.detail} />
            </div>
          )}
        </div>
        <div className={styles.timelineSpine}>
          <span className={styles.timelineMinuteBadge}>{minuteStr}</span>
        </div>
        <div className={`${styles.timelineSide} ${styles.timelineSideAway}`}>
          {isAway && (
            <div className={styles.timelineCard}>
              <EventBadge type={event.type} detail={event.detail} />
              <div className={styles.timelineCardBody}>
                <strong>{event.player ?? match.away.name}</strong>
                {event.assist && <small className={styles.timelineSubText}>({event.assist})</small>}
                {event.detail && !event.assist && <small className={styles.timelineSubText}>{event.detail}</small>}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className={styles.contentSection}>
      <div className={styles.sectionHeading}>
        <div><span>{copy.overview}</span><h2>{copy.match}</h2></div>
      </div>
      <div className={styles.timelineContainer}>
        {firstHalf.length > 0 && (
          <div className={styles.timelinePeriod}>
            <div className={styles.timelinePeriodDivider}><span>{copy.firstHalf}</span></div>
            {firstHalf.map(renderEvent)}
          </div>
        )}
        {secondHalf.length > 0 && (
          <div className={styles.timelinePeriod}>
            <div className={styles.timelinePeriodDivider}><span>{copy.secondHalf}</span></div>
            {secondHalf.map(renderEvent)}
          </div>
        )}
        {extraTime.length > 0 && (
          <div className={styles.timelinePeriod}>
            <div className={styles.timelinePeriodDivider}><span>Extra Time</span></div>
            {extraTime.map(renderEvent)}
          </div>
        )}
      </div>
    </section>
  );
}

export function MatchExperience({ match: initialMatch, locale }: { match: MatchDetail; locale: Locale }) {
  const router = useRouter();
  const [match, setMatch] = useState(initialMatch);
  const [requestedTab, setActiveTab] = useState<MatchTab>("overview");
  const visibleSections = matchSectionVisibility(match);
  const activeTab = visibleSections[requestedTab] ? requestedTab : "overview";
  const [saved, setSaved] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const copy = matchLabels[locale];
  const common = getMessages(locale).common;
  const outcomes = { won: common.won, lost: common.lost, void: common.void };
  const tabs = tabIds.filter(id => visibleSections[id]).map((id) => ({ id, label: copy[id] }));
  const sidebarSections = ([
    { label: copy.overview, tab: "overview" },
    { label: copy.oracleAnalysis, tab: "oracle" },
    { label: copy.headToHead, tab: "h2h" },
    { label: copy.lineups, tab: "lineups" },
    { label: copy.statistics, tab: "stats" },
  ] satisfies Array<{ label: string; tab: MatchTab }>).filter(item => visibleSections[item.tab]);
  const kickoff = useMemo(() => new Date(match.kickoffAt), [match.kickoffAt]);
  const dateFormatter = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const timeFormatter = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    const publicId = initialMatch.slug.split("--").at(-1); if (!publicId) return;
    const controller=new AbortController();
    let refreshTimer:ReturnType<typeof setTimeout>|undefined;
    let refreshing=false,refreshAgain=false,disposed=false;
    const refresh=async()=>{
      if(disposed)return;
      if(refreshing){refreshAgain=true;return;}
      refreshing=true;
      try {
        const response=await fetch(`/api/matches/${encodeURIComponent(initialMatch.slug)}?locale=${locale}`,{cache:"no-store",signal:controller.signal});
        if(response.ok){
          const fresh=await response.json() as MatchDetail;
          if(!disposed)setMatch(current=>Date.parse(fresh.sourceUpdatedAt ?? "")>=Date.parse(current.sourceUpdatedAt ?? "")?fresh:{...fresh,score:current.score,status:current.status,statusCode:current.statusCode,elapsedMinute:current.elapsedMinute,predictions:current.predictions,oracleMarket:current.oracleMarket,sourceUpdatedAt:current.sourceUpdatedAt});
        }
      } catch {}
      finally {refreshing=false;if(refreshAgain&&!disposed){refreshAgain=false;refreshTimer=setTimeout(()=>{refreshTimer=undefined;void refresh();},1000);}}
    };
    const source = new EventSource(`/api/live?fixtures=${encodeURIComponent(publicId)}`);
    const update = (event: MessageEvent<string>) => { try { const payload = JSON.parse(event.data) as { fixtureId?: string; statusCode?: string; homeScore?: number | null; awayScore?: number | null; elapsedMinute?: number | null; observedAt?: string; predictionResults?: Array<{ predictionId: string; result: "PENDING" | "WON" | "LOST" | "VOID" }> }; if (payload.fixtureId !== initialMatch.id) return; setMatch((current) => {
      const results = new Map((payload.predictionResults ?? []).map((result) => [result.predictionId, result.result]));
      const predictions = current.predictions.map((prediction) => {
        const result = prediction.predictionId ? results.get(prediction.predictionId) : undefined;
        const outcome = result === "WON" ? "won" : result === "LOST" ? "lost" : result === "VOID" ? "void" : prediction.outcome;
        return { ...prediction, outcome };
      });
      const oracleMarket = predictions.find((prediction) => prediction.market === "ORACLE_PICK") ?? current.oracleMarket;
      return { ...current, predictions, oracleMarket, statusCode: payload.statusCode ?? current.statusCode, status: payload.statusCode ? statusFromCode(payload.statusCode) : current.status, score: payload.homeScore !== undefined || payload.awayScore !== undefined ? [payload.homeScore ?? null, payload.awayScore ?? null] : current.score, elapsedMinute: payload.elapsedMinute ?? current.elapsedMinute, sourceUpdatedAt: payload.observedAt ?? current.sourceUpdatedAt };
    });
      if(!refreshTimer)refreshTimer=setTimeout(()=>{refreshTimer=undefined;void refresh();},1000);
    } catch {} };
    source.addEventListener("fixture_update", update as EventListener); return () => {disposed=true;source.close();controller.abort();if(refreshTimer)clearTimeout(refreshTimer);};
  }, [initialMatch, locale]);

  function navigate(route?: string) { if (route) router.push(`/${locale}/${route}`); }
  function switchLocale(nextLocale: string) { if (locales.includes(nextLocale as Locale)) router.push(`/${nextLocale}/match/${match.slug}`); }

  return (
    <div className={`${shellStyles.app} ${styles.app}`}>
      <header className={shellStyles.topbar}>
        <div className={shellStyles.topbarInner}>
          <button className={`${shellStyles.brand} ${styles.brandButton}`} onClick={() => navigate("today")} aria-label={`MyBetOracle ${common.today}`}><MboMark className={shellStyles.brandMark} title="MyBetOracle" /><span className={shellStyles.brandName}>MyBetOracle</span></button>
          <label className={shellStyles.globalSearch}><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} aria-label={copy.searchFootball} /></label>
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

        <main className={`${shellStyles.main} ${styles.main} ${SHOW_MATCH_ADD_TO_PICKS && match.oracleMarket.available ? styles.mainWithStickyPill : ""}`}>
          <nav className={styles.breadcrumb} aria-label={copy.breadcrumb}><button onClick={() => navigate("today")}><ChevronLeft size={15} /> {common.today}</button><span>/</span><button onClick={() => navigate("competitions")}>{match.competition.name}</button></nav>

          <section className={styles.scoreboard}>
            <h1 className={styles.srOnly}>{match.home.name} vs {match.away.name}</h1>
            <div className={styles.competitionLine}><span>{match.competition.countryCode}</span><strong>{match.competition.name}</strong>{match.competition.round && <small>{match.competition.round}</small>}<button className={saved ? styles.saved : ""} onClick={() => setSaved((current) => !current)} aria-label={saved ? copy.removeSaved : copy.saveMatch}><Star size={17} fill={saved ? "currentColor" : "none"} /></button></div>
            <div className={styles.scoreMain}>
              <button className={`${styles.scoreTeam} ${styles.scoreTeamButton}`} onClick={() => router.push(`/${locale}/teams/${match.home.id}`)}><Crest team={match.home} large /><h2>{match.home.name}</h2><FormStrip team={match.home} copy={copy} /></button>
              <div className={styles.kickoffBlock}>
                {match.score && match.status !== "scheduled" ? (
                  <>
                    <time>{match.score[0] ?? "—"} - {match.score[1] ?? "—"}</time>
                    {match.halfTimeScore && (match.halfTimeScore[0] !== null || match.halfTimeScore[1] !== null) && (
                      <span className={styles.halfTimeScore}>({copy.halfTime} {match.halfTimeScore[0] ?? 0} - {match.halfTimeScore[1] ?? 0})</span>
                    )}
                  </>
                ) : (
                  <time>{timeFormatter.format(kickoff)}</time>
                )}
                <span>{dateFormatter.format(kickoff)}</span>
                <small data-state={match.status}>{match.status === "scheduled" ? copy.scheduled : `${match.statusCode}${match.elapsedMinute !== null ? ` · ${match.elapsedMinute}'` : ""}`}</small>
              </div>
              <button className={`${styles.scoreTeam} ${styles.scoreTeamButton}`} onClick={() => router.push(`/${locale}/teams/${match.away.id}`)}><Crest team={match.away} large /><h2>{match.away.name}</h2><FormStrip team={match.away} copy={copy} /></button>
            </div>
            {(match.venue || match.referee) && <div className={styles.venueLine}>{match.venue && <span><MapPin size={13} /> {match.venue}{match.city ? `, ${match.city}` : ""}</span>}{match.referee && <span><CircleDot size={13} /> {copy.referee}: {match.referee}</span>}</div>}
          </section>

          <AdSlot format="leaderboard" label={copy.advertisement} />

          <nav className={styles.matchTabs} aria-label={copy.matchSections}>{tabs.map((tab) => <button className={activeTab === tab.id ? styles.tabActive : ""} key={tab.id} onClick={() => setActiveTab(tab.id)}>{tab.label}{tab.id === "oracle" && <span>{match.oracleScore}</span>}</button>)}</nav>

          <div className={styles.contentStack}>
            {activeTab === "overview" && (
              <>
                <TimelineSection match={match} locale={locale} copy={copy} />
                {visibleSections.oracle && (
                  <OraclePanel match={match} copy={copy} outcomes={outcomes} locale={locale} />
                )}
                {visibleSections.streaks && (
                  <StreakSection
                    match={match}
                    locale={locale}
                    copy={copy}
                    onOpen={() => navigate(`streaks?teamId=${encodeURIComponent(match.home.id)}`)}
                  />
                )}
                <AdSlot format="in-feed" label={copy.advertisement} />
                <div className={styles.overviewTeaserGrid}>
                  {visibleSections.h2h && (
                    <button
                      type="button"
                      className={styles.overviewTeaserCard}
                      onClick={() => setActiveTab("h2h")}
                    >
                      <div className={styles.overviewTeaserCardLeft}>
                        <div className={styles.overviewTeaserIcon}>
                          <CalendarDays size={18} />
                        </div>
                        <div className={styles.overviewTeaserText}>
                          <strong>{copy.headToHead}</strong>
                          <span>{copy.viewH2hForm}</span>
                        </div>
                      </div>
                      <ChevronRight size={18} />
                    </button>
                  )}
                  {visibleSections.lineups && (
                    <button
                      type="button"
                      className={styles.overviewTeaserCard}
                      onClick={() => setActiveTab("lineups")}
                    >
                      <div className={styles.overviewTeaserCardLeft}>
                        <div className={styles.overviewTeaserIcon}>
                          <UserCircle size={18} />
                        </div>
                        <div className={styles.overviewTeaserText}>
                          <strong>{copy.lineups}</strong>
                          <span>{copy.viewLineupsPitch}</span>
                        </div>
                      </div>
                      <ChevronRight size={18} />
                    </button>
                  )}
                  {visibleSections.stats && (
                    <button
                      type="button"
                      className={styles.overviewTeaserCard}
                      onClick={() => setActiveTab("stats")}
                    >
                      <div className={styles.overviewTeaserCardLeft}>
                        <div className={styles.overviewTeaserIcon}>
                          <BarChart3 size={18} />
                        </div>
                        <div className={styles.overviewTeaserText}>
                          <strong>{copy.statistics}</strong>
                          <span>{copy.viewFullStats}</span>
                        </div>
                      </div>
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </>
            )}
            {activeTab === "oracle" && visibleSections.oracle && (
              <>
                <OraclePanel match={match} copy={copy} outcomes={outcomes} locale={locale} />
                {visibleSections.streaks && (
                  <StreakSection
                    match={match}
                    locale={locale}
                    copy={copy}
                    onOpen={() => navigate(`streaks?teamId=${encodeURIComponent(match.home.id)}`)}
                  />
                )}
              </>
            )}
            {activeTab === "h2h" && (
              <>
                <H2HSection match={match} locale={locale} copy={copy} />
                <AdSlot format="in-feed" label={copy.advertisement} />
                <RecentResults match={match} locale={locale} copy={copy} />
              </>
            )}
            {activeTab === "stats" && (
              <>
                <StatsSection match={match} locale={locale} copy={copy} />
                <PlayerStatistics match={match} locale={locale} />
              </>
            )}
            {activeTab === "lineups" && (
              <LineupsSection match={match} copy={copy} locale={locale} />
            )}
          </div>
        </main>

        <aside className={`${shellStyles.intelligenceRail} ${styles.intelligenceRail}`}>
          <AdSlot format="rectangle" label={copy.advertisement} />
          <section className={styles.railPanel}><header><span>{copy.matchInformation}</span><CalendarDays size={15} /></header><dl><div><dt>{copy.kickoff}</dt><dd>{dateFormatter.format(kickoff)}, {timeFormatter.format(kickoff)}</dd></div>{match.venue && <div><dt>{copy.venue}</dt><dd>{match.venue}</dd></div>}{match.competition.round && <div><dt>{copy.round}</dt><dd>{match.competition.round}</dd></div>}{match.referee && <div><dt>{copy.referee}</dt><dd>{match.referee}</dd></div>}</dl></section>
          {match.availability.standings === "available" && match.standings.length > 0 && <section className={styles.railPanel}><header><span>{copy.standings}</span><Trophy size={15} /></header><div className={styles.standingsHeader}><span>#</span><span>{copy.team}</span><span>{copy.played}</span><span>{copy.points}</span></div>{match.standings.map((row) => <div className={`${styles.standingRow} ${row.highlighted ? styles.standingHighlighted : ""}`} key={row.team}><span>{row.position}</span><strong>{row.team}</strong><span>{row.played}</span><b>{row.points}</b></div>)}</section>}
          <section className={`${styles.railPanel} ${styles.railEvidence}`}><header><span>{copy.evidenceNote}</span><Database size={15} /></header><p>{copy.evidenceSignals}</p></section>
          <AdSlot format="half-page" label={copy.advertisement} />
        </aside>
      </div>

      {SHOW_MATCH_ADD_TO_PICKS && match.oracleMarket.available && (
        <div className={styles.mobileStickyActionPill}>
          <div className={styles.mobileStickyActionPillLeft}>
            <span>Oracle</span>
            <strong>{match.oracleMarket.selection}</strong>
            {match.oracleMarket.odds && <small>({match.oracleMarket.odds})</small>}
          </div>
          <button
            type="button"
            className={styles.mobileStickyActionPillButton}
            onClick={() => navigate("multi-picks")}
          >
            <Sparkles size={13} /> {copy.addToMultiPicks}
          </button>
        </div>
      )}

      <nav className={shellStyles.mobileBottomNav} aria-label={copy.mobileNavigation}>{navItems.slice(0, 5).map(({ key, icon: Icon, route }) => <button key={key} className={key === "today" ? shellStyles.mobileNavActive : ""} onClick={() => navigate(route)}><Icon size={19} /><span>{common[key]}</span></button>)}</nav>
    </div>
  );
}
