import Link from 'next/link';
import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import { buildPublicMatchPath } from '@/features/match/public-match-url';
import { entitySlug } from './public-id';
import { discoveryLabels } from './labels';
import { competitionLabels } from './competition-labels';
import { todayLabels } from '@/features/today/labels';
import type { CompetitionData, CompetitionFixture, CompetitionTab } from './competition-types';
import styles from './competition.module.css';

const localeTags = { en: 'en-GB', fr: 'fr-FR', es: 'es-ES', de: 'de-DE', it: 'it-IT', pt: 'pt-BR' };
// A dash-separated "{competition} — {section}" heading reads naturally in
// all six locales regardless of grammatical gender/article requirements
// (the same reasoning as the today/tomorrow market-scope heading pattern),
// without needing a bespoke possessive construction per language.
function sectionHeading(competitionName: string, label: string) {
  return `${competitionName} — ${label}`;
}
export function CompetitionContent({ locale, data }: { locale: Locale; data: CompetitionData }) {
  const copy = competitionLabels[locale]; const common = discoveryLabels[locale];
  const base = `/${locale}/competitions/${entitySlug(data.competition.displayName, data.competition.id)}`;
  const href = (tab: CompetitionTab, page = 1, season = data.season?.id) => {
    const params = new URLSearchParams({ tab, page: String(page) });
    if (season) params.set('seasonId', season);
    return `${base}?${params}`;
  };
  const tabs: Array<[CompetitionTab, string]> = [['overview', common.overview], ['fixtures', common.schedule], ['results', copy.results], ['standings', common.standings], ['predictions', common.predictions]];
  // Team count is only claimed when it comes from a real, currently-available
  // standings table -- never guessed from fixture participants, which could
  // undercount teams with no fixtures yet played this season.
  const teamCount = data.standings?.availability === 'available'
    ? new Set(data.standings.groups.flatMap((group) => group.items.map((item) => item.team.id))).size
    : null;
  const contextParts = [
    data.competition.country,
    data.season ? `${copy.season} ${data.season.year}` : null,
    teamCount ? `${teamCount} ${common.teams.toLowerCase()}` : null,
  ].filter((part): part is string => Boolean(part));
  return <div className={styles.content}>
    <nav className={styles.breadcrumb}><Link href={`/${locale}/competitions`}>{common.competitions}</Link><span> / {data.competition.displayName}</span></nav>
    <header className={styles.hero}>
      {data.competition.emblemUrl && <Image src={data.competition.emblemUrl} alt="" width={64} height={64} className={styles.emblem} />}
      <div>
        <h1>{data.competition.displayName}</h1>
        {contextParts.length > 0 && <p>{data.competition.countryFlagUrl && <Image src={data.competition.countryFlagUrl} alt="" width={20} height={14} />} {contextParts.join(' · ')}</p>}
      </div>
      <details className={styles.seasons}><summary>{copy.season} · {data.season?.year ?? '—'}</summary>
        <div>{data.seasons.map((season) => <Link key={season.id} prefetch={false} href={href(data.tab, 1, season.id)} aria-current={season.id === data.season?.id ? 'true' : undefined}>{season.year}</Link>)}</div>
      </details>
    </header>
    <nav className={styles.tabs} aria-label={common.entityCompetition}>{tabs.map(([tab, label]) => <Link key={tab} prefetch={false} href={href(tab)} aria-current={data.tab === tab ? 'page' : undefined}>{label}</Link>)}
      <Link prefetch={false} href={`/${locale}/streaks?competition=${data.competition.id}`}>{common.streaks}</Link>
    </nav>
    {/* predictedFixtures is a new field the deployed backend may not send yet
        (older/current API responses omit it entirely) -- guarded rather than
        assumed present, even though the type says it's always an array. */}
    {data.tab === 'overview' && data.predictedFixtures?.length > 0 && <section className={styles.section}>
      <h2>{sectionHeading(data.competition.displayName, common.predictions)} <small>{data.predictedFixtures.length}</small></h2>
      <FixtureList locale={locale} fixtures={data.predictedFixtures} predictions />
    </section>}
    {(data.tab === 'overview' || data.tab === 'fixtures' || data.tab === 'results' || data.tab === 'predictions') &&
      <section className={styles.section}><h2>{data.tab === 'overview' ? sectionHeading(data.competition.displayName, copy.fixturesHeading) : tabs.find(([tab]) => tab === data.tab)?.[1]} <small>{data.pagination.total}</small></h2>
        <FixtureList locale={locale} fixtures={data.fixtures} predictions={data.tab === 'predictions'} />
      </section>}
    {data.tab === 'overview' && <section className={styles.section}><h2>{sectionHeading(data.competition.displayName, copy.recent)}<Link href={href('results')}>{copy.results} →</Link></h2><FixtureList locale={locale} fixtures={data.recentResults} /></section>}
    {data.tab === 'overview' && data.statistics && <section className={styles.section}>
      <h2>{sectionHeading(data.competition.displayName, copy.statisticsHeading)}</h2>
      {data.statistics.availability === 'available' ? <dl className={styles.statsGrid}>
        <div><dt>{copy.matchesPlayed}</dt><dd>{data.statistics.matchesPlayed}</dd></div>
        {data.statistics.avgTotalGoals !== null && <div><dt>{copy.avgGoalsPerMatch}</dt><dd>{data.statistics.avgTotalGoals.toFixed(2)}</dd></div>}
        {data.statistics.avgHomeGoals !== null && <div><dt>{copy.avgHomeGoals}</dt><dd>{data.statistics.avgHomeGoals.toFixed(2)}</dd></div>}
        {data.statistics.avgAwayGoals !== null && <div><dt>{copy.avgAwayGoals}</dt><dd>{data.statistics.avgAwayGoals.toFixed(2)}</dd></div>}
        {data.statistics.homeWinPct !== null && <div><dt>{copy.homeWin}</dt><dd>{data.statistics.homeWinPct}%</dd></div>}
        {data.statistics.drawPct !== null && <div><dt>{copy.draw}</dt><dd>{data.statistics.drawPct}%</dd></div>}
        {data.statistics.awayWinPct !== null && <div><dt>{copy.awayWin}</dt><dd>{data.statistics.awayWinPct}%</dd></div>}
        {data.statistics.bttsPct !== null && <div><dt>{copy.btts}</dt><dd>{data.statistics.bttsPct}%</dd></div>}
        {data.statistics.over15Pct !== null && <div><dt>{copy.over15}</dt><dd>{data.statistics.over15Pct}%</dd></div>}
        {data.statistics.over25Pct !== null && <div><dt>{copy.over25}</dt><dd>{data.statistics.over25Pct}%</dd></div>}
        {data.statistics.over35Pct !== null && <div><dt>{copy.over35}</dt><dd>{data.statistics.over35Pct}%</dd></div>}
      </dl> : <p className={styles.empty}>{copy.statsUnavailable}</p>}
    </section>}
    {data.standings && <section className={styles.section}><h2>{data.tab === 'overview' ? sectionHeading(data.competition.displayName, common.standings) : common.standings}</h2>
      {data.standings.availability === 'available' ? data.standings.groups.map((group, index) => <div key={`${group.name}-${index}`}>
        {group.name && <h3 className={styles.group}>{group.name}</h3>}
        <div className={styles.tableScroll}><table><thead><tr><th>#</th><th>{copy.team}</th><th>{copy.played}</th><th>{copy.won}</th><th>{copy.drawn}</th><th>{copy.lost}</th><th>{copy.goals}</th><th>{copy.difference}</th><th>{copy.points}</th><th>{copy.form}</th></tr></thead>
          <tbody>{group.items.map((row) => <tr key={row.team.id}><td>{row.rank}</td><th scope="row"><Link href={`/${locale}/teams/${entitySlug(row.team.displayName, row.team.id)}`} prefetch={false}>{row.team.emblemUrl && <Image src={row.team.emblemUrl} alt="" width={20} height={20} />}{row.team.displayName}</Link></th><td>{row.played}</td><td>{row.won}</td><td>{row.drawn}</td><td>{row.lost}</td><td>{row.goalsFor}:{row.goalsAgainst}</td><td>{row.goalDifference > 0 ? '+' : ''}{row.goalDifference}</td><td><strong>{row.points}</strong></td><td><span className={styles.form}>{(row.form ?? '').slice(-5).split('').map((result, i) => <b key={i} data-result={result}>{result === 'W' ? copy.won : result === 'D' ? copy.drawn : result === 'L' ? copy.lost : result}</b>)}</span></td></tr>)}</tbody>
        </table></div>
      </div>) : <p className={styles.empty}>{data.standings.availability === 'unavailable' ? copy.failed : copy.noTable}{data.standings.availability === 'unavailable' && <Link href={href('standings')} prefetch={false}> {copy.retry}</Link>}</p>}
    </section>}
    {data.tab !== 'overview' && data.pagination.totalPages > 1 && <nav className={styles.pagination}>
      {data.pagination.page > 1 && <Link prefetch={false} href={href(data.tab, data.pagination.page - 1)}>← {copy.previous}</Link>}
      <span>{data.pagination.page} / {data.pagination.totalPages}</span>
      {data.pagination.page < data.pagination.totalPages && <Link prefetch={false} href={href(data.tab, data.pagination.page + 1)}>{copy.next} →</Link>}
    </nav>}
  </div>;
}

function FixtureList({ locale, fixtures, predictions = false }: { locale: Locale; fixtures: CompetitionFixture[]; predictions?: boolean }) {
  const copy = competitionLabels[locale];
  const names = discoveryLabels[locale].marketNames;
  const groupNames: Record<string, string> = {
    REGULAR: names['match-result'], MIXED: names.mixed, BTTS: names['both-teams-score'],
    TOTAL_2_5: names['total-2-5'], ORACLE_PICK: discoveryLabels[locale].oraclePick,
    CORRECT_SCORE: names['correct-score'],
  };
  if (!fixtures.length) return <p className={styles.empty}>{copy.empty}</p>;
  return <div>{fixtures.map((fixture) => {
    const finished = ['FT', 'AET', 'PEN'].includes(fixture.statusCode);
    const live = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'INT', 'LIVE'].includes(fixture.statusCode);
    const href = buildPublicMatchPath({ locale, fixtureId: fixture.id, homeName: fixture.homeTeam.displayName, awayName: fixture.awayTeam.displayName });
    return <div className={styles.fixture} key={fixture.id}>
      <Link href={href} prefetch={false} className={styles.match}>
        <div className={styles.time}><time dateTime={fixture.kickoffAt}>{new Intl.DateTimeFormat(localeTags[locale], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' }).format(new Date(fixture.kickoffAt))}</time><span data-live={live}>{finished ? copy.finished : live ? `${copy.live}${fixture.elapsedMinute != null ? ` · ${fixture.elapsedMinute}′` : ''}` : ['NS', 'TBD'].includes(fixture.statusCode) ? '' : fixture.statusCode}</span></div>
        <div className={styles.teams}>{[fixture.homeTeam, fixture.awayTeam].map((team, index) => <div key={team.id}>{team.emblemUrl && <Image src={team.emblemUrl} alt="" width={22} height={22} />}<span>{team.displayName}</span><strong>{(index === 0 ? fixture.score.home : fixture.score.away) ?? '—'}</strong></div>)}</div>
        <span className={styles.arrow} aria-hidden>›</span>
      </Link>
      {predictions && <div className={styles.picks}>{fixture.predictions.filter((pick) => pick.availability === 'AVAILABLE' && groupNames[pick.marketGroup]).map((pick) => <span key={pick.id} title={pick.selectionLabel ?? undefined}><small>{groupNames[pick.marketGroup]}</small><strong>{pick.selectionShortLabel ?? pick.selectionLabel}</strong>{pick.confidenceScore != null && <small>{todayLabels[locale].oracleScore.replace('{score}', String(pick.confidenceScore))}</small>}{pick.result !== 'PENDING' && <b>{pick.result === 'WON' ? '✓' : pick.result === 'LOST' ? '×' : '—'}</b>}</span>)}</div>}
    </div>;
  })}</div>;
}
