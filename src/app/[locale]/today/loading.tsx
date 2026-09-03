import styles from "./loading.module.css";

function Bone({ className = "" }: { className?: string }) {
  return <span className={`${styles.bone} ${className}`} />;
}

function MatchRowSkeleton() {
  return (
    <div className={styles.matchRow}>
      <Bone className={styles.saveBone} />
      <div className={styles.matchIdentity}>
        <Bone className={styles.timeBone} />
        <div className={styles.teams}>
          <span><Bone className={styles.crestBone} /><Bone className={styles.teamBone} /></span>
          <span><Bone className={styles.crestBone} /><Bone className={styles.teamBoneShort} /></span>
        </div>
      </div>
      <Bone className={styles.pickBone} />
      <Bone className={styles.scoreBone} />
      <Bone className={styles.actionBone} />
    </div>
  );
}

function CompetitionSkeleton({ rows }: { rows: number }) {
  return (
    <section className={styles.competition}>
      <div className={styles.competitionHeader}>
        <div className={styles.competitionIdentity}>
          <Bone className={styles.flagBone} />
          <Bone className={styles.leagueCrestBone} />
          <Bone className={styles.leagueNameBone} />
        </div>
        <Bone className={styles.linkBone} />
      </div>
      {Array.from({ length: rows }, (_, index) => <MatchRowSkeleton key={index} />)}
    </section>
  );
}

export default function TodayLoading() {
  return (
    <div className={styles.app} aria-busy="true">
      <span className={styles.srOnly} role="status">Loading today&apos;s match intelligence</span>
      <header className={styles.topbar} aria-hidden="true">
        <div className={styles.topbarInner}>
          <div className={styles.brandSkeleton}><Bone className={styles.brandMark} /><Bone className={styles.brandName} /></div>
          <Bone className={styles.searchBone} />
          <div className={styles.topbarActions}><Bone className={styles.proBone} /><Bone className={styles.roundBone} /><Bone className={styles.roundBone} /></div>
        </div>
      </header>
      <div className={styles.shell} aria-hidden="true">
        <aside className={styles.sidebar}>
          <div className={styles.sidebarNav}>{Array.from({ length: 5 }, (_, index) => <div className={styles.sidebarRow} key={index}><Bone className={styles.navIconBone} /><Bone className={styles.navTextBone} /></div>)}</div>
          <div className={styles.sidebarSection}><Bone className={styles.sidebarTitleBone} />{Array.from({ length: 4 }, (_, index) => <div className={styles.leagueRow} key={index}><Bone className={styles.leagueIconBone} /><Bone className={styles.leagueTextBone} /><Bone className={styles.countBone} /></div>)}</div>
        </aside>
        <main className={styles.main}>
          <div className={styles.pageHeader}><div><Bone className={styles.titleBone} /><Bone className={styles.subtitleBone} /></div><Bone className={styles.calendarBone} /></div>
          <div className={styles.dateRail}><Bone className={styles.arrowBone} />{Array.from({ length: 3 }, (_, index) => <div className={styles.dateBone} key={index}><Bone className={styles.dayBone} /><Bone className={styles.numberBone} /></div>)}<Bone className={styles.arrowBone} /></div>
          <div className={styles.toolbar}><div className={styles.filters}>{Array.from({ length: 4 }, (_, index) => <Bone className={styles.filterBone} key={index} />)}</div><Bone className={styles.sortBone} /></div>
          <div className={styles.marketRail}>{Array.from({ length: 7 }, (_, index) => <Bone className={index === 0 ? styles.marketBoneActive : styles.marketBone} key={index} />)}</div>
          <div className={styles.feedMeta}><Bone className={styles.metaStrongBone} /><Bone className={styles.metaBone} /></div>
          <div className={styles.feed}><CompetitionSkeleton rows={3} /><CompetitionSkeleton rows={2} /></div>
        </main>
        <aside className={styles.inspector}>
          <Bone className={styles.panelEyebrowBone} /><Bone className={styles.panelTitleBone} /><Bone className={styles.panelSubtitleBone} />
          <div className={styles.scoreCard}><Bone className={styles.gaugeBone} /><div><Bone className={styles.scoreLabelBone} /><Bone className={styles.scoreValueBone} /></div></div>
          <div className={styles.panelRows}>{Array.from({ length: 4 }, (_, index) => <div key={index}><Bone className={styles.panelRowLabel} /><Bone className={styles.panelRowValue} /></div>)}</div>
          <Bone className={styles.panelButtonBone} />
        </aside>
      </div>
      <nav className={styles.mobileNav} aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <div key={index}><Bone className={styles.mobileIconBone} /><Bone className={styles.mobileLabelBone} /></div>)}</nav>
    </div>
  );
}
