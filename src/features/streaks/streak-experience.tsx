"use client";

import {
  BarChart3,
  Bell,
  Bookmark,
  ChevronRight,
  Clock3,
  Compass,
  Database,
  Globe2,
  Home,
  Info,
  Languages,
  Menu,
  ReceiptText,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserCircle,
  WandSparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MboMark } from "@/components/brand/brand-marks";
import { AdSlot } from "@/components/ads/ad-slot";
import { RoutePendingIndicator, useRoutePendingTransition } from "@/components/navigation/route-pending-indicator";
import { MobileProductMenu } from "@/components/navigation/mobile-product-menu";
import { locales, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import shellStyles from "@/features/today/today-experience.module.css";
import { isLaunchVisibleStreakMetric, metricByKey, metricLabel, metricShortLabel } from "./metric-catalog";
import { streakLabels, type StreakLabels } from "./labels";
import type {
  FixtureStreakComparison,
  StreakCategory,
  StreakExplorerData,
  StreakMetric,
  StreakRecord,
  StreakScope,
  StreakTeam,
} from "./types";
import styles from "./streak-experience.module.css";

const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Espanol",
  fr: "Francais",
  de: "Deutsch",
  it: "Italiano",
  pt: "Portugues",
};

const navItems = [{key:"today",icon:Home,route:"today"},{key:"explore",icon:Compass,route:"explore"},{key:"accas",icon:WandSparkles,route:"multi-picks"},{key:"results",icon:BarChart3,route:"results"},{key:"saved",icon:Bookmark,route:"saved"},{key:"betslip",icon:ReceiptText,route:"betslip"}] as const;

function TeamCrest({ team, compact = false }: { team: StreakTeam; compact?: boolean }) {
  if (team.emblemUrl) {
    return (
      <span className={`${styles.crest} ${styles.crestImage} ${compact ? styles.crestCompact : ""}`} aria-hidden="true">
        <Image src={team.emblemUrl} alt="" width={compact ? 28 : 36} height={compact ? 28 : 36} sizes={compact ? "28px" : "36px"} />
      </span>
    );
  }
  return (
    <span className={`${styles.crest} ${compact ? styles.crestCompact : ""}`} aria-hidden="true">
      {team.shortName.slice(0, 2)}
    </span>
  );
}

function scopeLabel(scope: StreakScope, copy: StreakLabels) {
  return scope === "OVERALL" ? copy.overall : scope === "HOME" ? copy.home : copy.away;
}

function strengthLabel(length: number, copy: StreakLabels) {
  if (length >= 11) return copy.exceptional;
  if (length >= 8) return copy.veryStrong;
  if (length >= 5) return copy.strong;
  if (length >= 3) return copy.developing;
  return copy.neutral;
}

function recordState(record: StreakRecord, copy: StreakLabels) {
  if (record.zeroHistory && record.sampleSize === 0) return copy.buildingHistory;
  if (!record.evidenceAvailable) return copy.dataUnavailable;
  if (record.currentLength === 0) return copy.notActive;
  return null;
}

function StreakValue({ record, copy, compact = false }: { record: StreakRecord; copy: StreakLabels; compact?: boolean }) {
  const state = recordState(record, copy);
  if (state) return <span className={styles.inactiveValue}>{state}</span>;

  return (
    <div className={`${styles.streakValue} ${compact ? styles.streakValueCompact : ""}`}>
      <strong>{record.currentLength}</strong>
      {!compact && <span>{strengthLabel(record.currentLength, copy)}</span>}
    </div>
  );
}

function ComparisonTeam({
  team,
  streaks, copy, locale,
}: {
  team: StreakTeam;
  streaks: FixtureStreakComparison["homeStreaks"]; copy: StreakLabels; locale: Locale;
}) {
  return (
    <div className={styles.comparisonTeam}>
      <div className={styles.comparisonTeamName}>
        <TeamCrest team={team} compact />
        <strong>{team.name}</strong>
      </div>
      <div className={styles.comparisonMetrics}>
        {streaks.filter((streak) => isLaunchVisibleStreakMetric(streak.metric)).map((streak) => (
          <div key={`${streak.metric}-${streak.scope}`}>
            <span>{metricShortLabel(streak.metric,locale)}</span>
            <small>{scopeLabel(streak.scope, copy)}</small>
            <strong>{streak.currentLength}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StreakExperience({ data, locale }: { data: StreakExplorerData; locale: Locale }) {
  const router = useRouter();
  const { isPending: filterPending, pushTransition: pushFilterChange } = useRoutePendingTransition();
  const copy = streakLabels[locale];
  const common = getMessages(locale).common;
  type MetricView = { category?: undefined; metric: StreakMetric; label: string };
  type StreakView = MetricView | { category: StreakCategory; metric?: undefined; label: string };
  const primaryViews: MetricView[] = [
    { metric: "WIN", label: metricShortLabel("WIN", locale) },
    { metric: "LOSS", label: metricShortLabel("LOSS", locale) },
    { metric: "OVER_2_5", label: metricShortLabel("OVER_2_5", locale) },
    { metric: "BTTS_YES", label: metricShortLabel("BTTS_YES", locale) },
    { metric: "BTTS_NO", label: metricShortLabel("BTTS_NO", locale) },
  ];
  const secondaryViews: StreakView[] = [
    { metric: "OVER_1_5", label: metricShortLabel("OVER_1_5", locale) },
    { category: "firstHalf", label: copy.firstHalf },
  ];
  const exploreItems = [{label:copy.overview,route:"explore"},{label:copy.calendar,route:"calendar"},{label:copy.competitions,route:"competitions"},{label:copy.teams,route:"teams"},{label:copy.markets,route:"markets"},{label:copy.streaks,route:"streaks"}] as const;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(data.query.search ?? "");
  const [selectedRecord, setSelectedRecord] = useState<StreakRecord | null>(null);
  const [methodOpen, setMethodOpen] = useState(false);
  const category = data.query.category;
  const metric = data.query.metric ?? (!data.query.category ? "WIN" : undefined);
  const activeViewLabel = [...primaryViews, ...secondaryViews].find((item) => item.metric === metric || (item.category && item.category === category))?.label ?? copy.streaks;
  const scope = data.query.scope ?? "OVERALL";
  const minimumLength = data.query.minimumLength ?? 3;
  const sort = data.query.sort;
  const country = data.query.country ?? "all";
  const competition = data.query.competition ?? "all";
  const selectedTeamId = data.query.teamId ?? "";

  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const timeFormatter = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
  const asOfDate = new Date(data.asOf);

  const selectedTeam = data.teams.find((team) => team.id === selectedTeamId);
  const filteredRecords = data.topStreaks;

  const activeFilters = useMemo(() => {
    const values: string[] = [];
    if (country !== "all") values.push(data.countries.find((item) => item.code === country)?.name ?? country);
    if (competition !== "all") values.push(data.competitions.find((item) => item.id === competition)?.name ?? copy.competition);
    if (selectedTeam) values.push(selectedTeam.name);
    if (data.query.search) values.push(`“${data.query.search}”`);
    if (minimumLength !== 3) values.push(minimumLength === 0 ? copy.any : `${minimumLength}+`);
    if (sort !== "length") values.push(sort === "team" ? copy.team : copy.sample);
    return values;
  }, [competition, copy, country, data.competitions, data.countries, data.query.search, minimumLength, selectedTeam, sort]);

  const profileRecords = useMemo(() => {
    if (!selectedTeam) return [];
    const records = (data.teamProfiles[selectedTeam.id] ?? []).filter((record) => record.scope === scope && isLaunchVisibleStreakMetric(record.metric));
    if (metric) return records.filter((record) => record.metric === metric);
    if (category) return records.filter((record) => metricByKey.get(record.metric)?.category === category);
    return [...records].sort((left, right) => right.currentLength - left.currentLength).slice(0, 14);
  }, [category, data.teamProfiles, metric, scope, selectedTeam]);

  const selectedTeamHighlights = useMemo(() => {
    if (!selectedTeam) return [];
    return (data.teamProfiles[selectedTeam.id] ?? [])
      .filter((record) => record.scope === scope && record.currentLength > 0 && record.evidenceAvailable && isLaunchVisibleStreakMetric(record.metric))
      .sort((left, right) => right.currentLength - left.currentLength)
      .slice(0, 5);
  }, [data.teamProfiles, scope, selectedTeam]);

  function navigate(route?: string) {
    if (route) router.push(`/${locale}/${route}`);
  }

  function switchLocale(nextLocale: string) {
    if (!locales.includes(nextLocale as Locale)) return;
    const params = buildQuery();
    router.push(`/${nextLocale}/streaks${params.size ? `?${params}` : ""}`);
  }

  function buildQuery(patch: Record<string, string | number | undefined> = {}) {
    const values: Record<string, string | number | undefined> = {
      country: data.query.country,
      competition: data.query.competition,
      teamId: data.query.teamId,
      scope: data.query.scope,
      category: data.query.category,
      metric: data.query.metric,
      minimumLength: data.query.minimumLength,
      search: data.query.search,
      sort: data.query.sort,
      page: data.query.page,
      ...patch,
    };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined && value !== "" && value !== "all") params.set(key, String(value));
    }
    return params;
  }

  function updateQuery(patch: Record<string, string | number | undefined>) {
    const params = buildQuery({ page: 1, ...patch });
    pushFilterChange(`/${locale}/streaks${params.size ? `?${params}` : ""}`);
  }

  function clearFilters() {
    setSearchDraft("");
    pushFilterChange(`/${locale}/streaks`);
  }

  return (
    <div className={`${shellStyles.app} ${styles.app}`}>
      <RoutePendingIndicator active={filterPending} />
      <header className={shellStyles.topbar}>
        <div className={shellStyles.topbarInner}>
          <button className={`${shellStyles.brand} ${styles.brandButton}`} onClick={() => navigate("today")} aria-label={`MyBetOracle ${common.today}`}>
            <MboMark className={shellStyles.brandMark} title="MyBetOracle" />
            <span className={shellStyles.brandName}>MyBetOracle</span>
          </button>

          <label className={shellStyles.globalSearch}>
            <Search size={18} />
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                updateQuery({ search: searchDraft.trim() || undefined });
              }}
              placeholder={copy.search}
              aria-label={copy.search}
            />
            <span>Enter</span>
          </label>

          <div className={shellStyles.topbarActions}>
            <button className={shellStyles.topIconButton} title={common.notifications} aria-label={common.notifications} onClick={() => navigate("saved")}><Bell size={19} /></button>
            <label className={shellStyles.localeSelect} title={common.language}>
              <Languages size={18} />
              <select value={locale} onChange={(event) => switchLocale(event.target.value)} aria-label={common.language}>
                {locales.map((item) => <option value={item} key={item}>{localeNames[item]}</option>)}
              </select>
            </label>
            <button className={shellStyles.avatarButton} title={common.profile} aria-label={common.profile} onClick={() => navigate("profile")}><UserCircle size={24} /></button>
            <button className={shellStyles.mobileMenuButton} onClick={() => setMobileMenuOpen((current) => !current)} aria-label={common.openNavigation}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && <MobileProductMenu locale={locale} activeRoute="streaks" onNavigate={() => setMobileMenuOpen(false)} />}

      <div className={shellStyles.shell}>
        <aside className={shellStyles.sidebar}>
          <nav className={shellStyles.primaryNav} aria-label={common.primaryNavigation}>
            {navItems.map(({ key, icon: Icon, route }) => (
              <button key={key} className={key === "explore" ? shellStyles.navActive : ""} onClick={() => navigate(route)}>
                <Icon size={19} /><span>{common[key]}</span>
              </button>
            ))}
          </nav>

          <div className={shellStyles.sidebarSection}>
            <div className={shellStyles.sidebarHeading}><span>{common.explore}</span></div>
            {exploreItems.map((item) => (
              <button key={item.route} onClick={() => navigate(item.route)} className={`${styles.exploreLink} ${item.route === "streaks" ? styles.exploreLinkActive : ""}`}>
                <span>{item.label}</span>{item.route === "streaks" && <ChevronRight size={15} />}
              </button>
            ))}
          </div>

          <div className={shellStyles.sidebarFooter}>
            <button><Globe2 size={17} /> {copy.allCompetitions}</button>
            <button><ShieldCheck size={17} /> {common.responsiblePlay}</button>
          </div>
        </aside>

        <main className={`${shellStyles.main} ${styles.main}`}>
          <div className={styles.pageHeader}>
            <div>
              <span className={styles.eyebrow}>{copy.teamIntelligence}</span>
              <h1>{copy.title}</h1>
              <p>{copy.subtitle}</p>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.howButton} onClick={() => setMethodOpen(true)}><Info size={16} /> {copy.how}</button>
            </div>
          </div>

          <AdSlot format="leaderboard" label={copy.advertisement} />

          <nav className={styles.categoryNav} aria-label={copy.categories}>
            {primaryViews.map((item) => <button key={item.metric} className={metric === item.metric ? styles.categoryActive : ""} onClick={() => updateQuery({ metric: item.metric, category: undefined })}>{item.label}</button>)}
          </nav>

          <nav className={styles.secondaryStreakNav} aria-label={copy.categories}>
            {secondaryViews.map((item) => <button key={item.metric ?? item.category} className={((item.metric && item.metric === metric) || (item.category && item.category === category)) ? styles.secondaryStreakActive : ""} onClick={() => updateQuery({ metric: item.metric, category: item.category })}>{item.label}</button>)}
          </nav>

          <div className={styles.controlRail}>
            <div className={styles.scopeControl} aria-label={copy.venueScope}>
              {(["OVERALL", "HOME", "AWAY"] as StreakScope[]).map((item) => <button key={item} className={scope === item ? styles.scopeActive : ""} onClick={() => updateQuery({ scope: item, teamId: selectedTeamId || undefined })}>{scopeLabel(item,copy)}</button>)}
            </div>
            <details className={styles.filterMenu}>
              <summary><SlidersHorizontal size={14} />{copy.filters}{activeFilters.length > 0 && <span>{activeFilters.length}</span>}</summary>
              <div className={styles.filterPanel}>
                <label><span>{copy.country}</span><select value={country} onChange={(event) => updateQuery({ country: event.target.value === "all" ? undefined : event.target.value, competition: undefined, teamId: undefined })}><option value="all">{copy.allCountries}</option>{data.countries.map((item) => <option value={item.code} key={item.code}>{item.name}</option>)}</select></label>
                <label className={!data.query.country && competition === "all" ? styles.filterDisabled : undefined}><span>{copy.competition}</span><select value={competition} disabled={!data.query.country && competition === "all"} onChange={(event) => updateQuery({ competition: event.target.value === "all" ? undefined : event.target.value, teamId: undefined })}><option value="all">{data.query.country ? copy.allCompetitions : copy.country}</option>{data.competitions.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
                <label><span>{copy.length}</span><select value={minimumLength} onChange={(event) => updateQuery({ minimumLength: Number(event.target.value) })}><option value={0}>{copy.any}</option><option value={3}>3+</option><option value={5}>5+</option><option value={7}>7+</option><option value={10}>10+</option></select></label>
                <label><span>{copy.sort}</span><select value={sort} onChange={(event) => updateQuery({ sort: event.target.value })}><option value="length">{copy.longest}</option><option value="team">{copy.team}</option><option value="sample">{copy.sample}</option></select></label>
                {activeFilters.length > 0 && <button onClick={clearFilters}><X size={13} />{copy.clearFilters}</button>}
              </div>
            </details>
          </div>

          {activeFilters.length > 0 && <div className={styles.activeFilters}><div>{activeFilters.map((filter) => <span key={filter}>{filter}</span>)}</div></div>}

          <section className={styles.streakSection}>
            <div className={styles.sectionHeading}>
              <div><h2>{activeViewLabel} {copy.streaks.toLowerCase()}</h2><span>{data.pagination.total} {copy.patterns}</span></div>
              <small>{scopeLabel(scope,copy)}</small>
            </div>
            <div className={styles.streakTable}>
              <div className={styles.tableHeader}><span>{copy.team}</span><span>{copy.pattern}</span><span>{copy.evidence}</span><span>{copy.run}</span></div>
              {filteredRecords.map((record) => (
                <button className={styles.streakRow} key={record.id} onClick={() => setSelectedRecord(record)}>
                  <span className={styles.teamCell}><TeamCrest team={record.team} compact /><span><strong>{record.team.name}</strong><small>{record.team.competition}</small></span></span>
                  <span className={styles.metricCell}><strong>{metricLabel(record.metric,locale)}</strong><small>{scopeLabel(record.scope,copy)}</small></span>
                  <span className={styles.evidenceCell} title={`${record.sampleSize} ${copy.eligibleFixtures}`}><Database size={14} /><strong>{record.sampleSize}</strong></span>
                  <StreakValue record={record} copy={copy} />
                  <ChevronRight className={styles.rowChevron} size={16} />
                </button>
              ))}
              {filteredRecords.length === 0 && (
                <div className={styles.emptyState}><Search size={22} /><strong>{copy.noMatches}</strong><span>{copy.adjustFilters}</span><button onClick={clearFilters}>{copy.clearFilters}</button></div>
              )}
            </div>
            {data.pagination.totalPages > 1 && (
              <div className={styles.pagination}>
                <button disabled={data.pagination.page <= 1} onClick={() => updateQuery({ page: data.pagination.page - 1 })} aria-label={`${copy.patterns} ${data.pagination.page - 1}`}>‹</button>
                <span>{data.pagination.page} / {data.pagination.totalPages}</span>
                <button disabled={data.pagination.page >= data.pagination.totalPages} onClick={() => updateQuery({ page: data.pagination.page + 1 })} aria-label={`${copy.patterns} ${data.pagination.page + 1}`}>›</button>
              </div>
            )}
          </section>

          {data.upcomingFixtures.length > 0 && <section className={styles.fixtureSection}>
            <div className={styles.sectionHeading}><div><h2>{copy.upcomingComparison}</h2><span>{copy.strongestBeside}</span></div></div>
            <div className={styles.fixtureGrid}>
              {data.upcomingFixtures.map((fixture) => (
                <article className={styles.fixtureCard} key={fixture.id}>
                  <header><span>{fixture.competition}</span><time><Clock3 size={13} /> {timeFormatter.format(new Date(fixture.kickoffAt))}</time></header>
                  <div className={styles.fixtureTeams}><ComparisonTeam team={fixture.home} streaks={fixture.homeStreaks} copy={copy} locale={locale} /><span className={styles.versus}>vs</span><ComparisonTeam team={fixture.away} streaks={fixture.awayStreaks} copy={copy} locale={locale} /></div>
                </article>
              ))}
            </div>
          </section>}

          {selectedTeam && (
            <section className={styles.profileSection}>
              <div className={styles.profileHeading}>
                <div className={styles.profileIdentity}><TeamCrest team={selectedTeam} /><div><span>{copy.teamProfile}</span><h2>{selectedTeam.name}</h2><small>{selectedTeam.competition} / {scopeLabel(scope,copy)}</small></div></div>
                <button className={styles.changeTeamButton} onClick={() => updateQuery({ teamId: undefined })}><X size={13} />{copy.changeTeam}</button>
              </div>
              <div className={styles.profileGrid}>
                {profileRecords.map((record) => (
                  <button key={record.id} onClick={() => setSelectedRecord(record)}>
                    <span><strong>{metricShortLabel(record.metric,locale)}</strong><small>{record.sampleSize} {copy.eligibleFixtures}</small></span>
                    <StreakValue record={record} copy={copy} compact />
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className={`${shellStyles.intelligenceRail} ${styles.intelligenceRail}`}>
          {selectedTeam && (
            <section className={styles.railPanel}>
              <header><span>{copy.teamLens}</span><small>{scopeLabel(scope,copy)}</small></header>
              <div className={styles.railTeam}><TeamCrest team={selectedTeam} /><div><strong>{selectedTeam.name}</strong><span>{selectedTeam.competition}</span></div></div>
              <div className={styles.railHighlights}>
                {selectedTeamHighlights.map((record) => <button key={record.id} onClick={() => setSelectedRecord(record)}><span>{metricShortLabel(record.metric,locale)}</span><strong>{record.currentLength}</strong></button>)}
              </div>
            </section>
          )}
          <section className={`${styles.railPanel} ${styles.methodPanel}`}>
            <header><span>{copy.evidenceStandard}</span><Database size={15} /></header>
            <dl><div><dt>{copy.asOf}</dt><dd>{dateFormatter.format(asOfDate)}</dd></div><div><dt>{copy.historyCap}</dt><dd>80 {copy.fixtures}</dd></div><div><dt>{copy.engine}</dt><dd>{data.engineVersion}</dd></div></dl>
            <button onClick={() => setMethodOpen(true)}>{copy.viewMethod} <ChevronRight size={15} /></button>
          </section>
        </aside>
      </div>

      <nav className={shellStyles.mobileBottomNav} aria-label={copy.mobileNavigation}>
        {navItems.slice(0, 5).map(({ key, icon: Icon, route }) => <button key={key} className={key === "explore" ? shellStyles.mobileNavActive : ""} onClick={() => navigate(route)}><Icon size={19} /><span>{common[key]}</span></button>)}
      </nav>

      {(selectedRecord || methodOpen) && <button className={styles.drawerScrim} aria-label={copy.closePanel} onClick={() => { setSelectedRecord(null); setMethodOpen(false); }} />}

      {selectedRecord && (
        <aside className={styles.drawer} aria-label={copy.details}>
          <header><div><span>{copy.streakEvidence}</span><h2>{selectedRecord.team.name}</h2></div><button onClick={() => setSelectedRecord(null)} aria-label={copy.closeDetails}><X size={19} /></button></header>
          <div className={styles.drawerHero}><TeamCrest team={selectedRecord.team} /><div><span>{metricLabel(selectedRecord.metric,locale)}</span><strong>{selectedRecord.currentLength}</strong><small>{scopeLabel(selectedRecord.scope,copy)} / {strengthLabel(selectedRecord.currentLength,copy)}</small></div></div>
          <dl className={styles.detailList}>
            <div><dt>{copy.eligibleSample}</dt><dd>{selectedRecord.sampleSize} {copy.fixtures}</dd></div>
            <div><dt>{copy.evidenceState}</dt><dd>{recordState(selectedRecord,copy) ?? copy.available}</dd></div>
            <div><dt>{copy.measuredThrough}</dt><dd>{dateFormatter.format(new Date(selectedRecord.asOfAt))}</dd></div>
            <div><dt>{copy.engine}</dt><dd>{selectedRecord.engineVersion}</dd></div>
          </dl>
          {selectedRecord.sourceFixture && <div className={styles.sourceFixture}><span>{copy.latestSource}</span><strong>{selectedRecord.team.name} {selectedRecord.sourceFixture.score} {selectedRecord.sourceFixture.opponent}</strong><small>{dateFormatter.format(new Date(selectedRecord.sourceFixture.kickoffAt))}</small></div>}
          <p className={styles.disclaimer}>{copy.historicalDisclaimer}</p>
        </aside>
      )}

      {methodOpen && (
        <aside className={styles.drawer} aria-label={copy.methodology}>
          <header><div><span>{copy.methodology}</span><h2>{copy.how}</h2></div><button onClick={() => setMethodOpen(false)} aria-label={copy.closeMethod}><X size={19} /></button></header>
          <div className={styles.methodSteps}>
            <div><strong>1</strong><span><b>{copy.strictlyHistorical}</b><small>{copy.strictlyHistoricalText}</small></span></div>
            <div><strong>2</strong><span><b>{copy.scopeSeparate}</b><small>{copy.scopeSeparateText}</small></span></div>
            <div><strong>3</strong><span><b>{copy.evidenceFirst}</b><small>{copy.evidenceFirstText}</small></span></div>
          </div>
          <div className={styles.methodNote}><Info size={17} /><p>{copy.strengthNote}</p></div>
        </aside>
      )}
    </div>
  );
}
