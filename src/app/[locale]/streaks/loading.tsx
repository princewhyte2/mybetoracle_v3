import { MboMark } from "@/components/brand/brand-marks";
import styles from "@/features/streaks/streak-loading.module.css";
import shellStyles from "@/features/today/today-experience.module.css";

export default function StreaksLoading() {
  return (
    <div className={shellStyles.app} aria-busy="true">
      <header className={shellStyles.topbar}>
        <div className={shellStyles.topbarInner}>
          <div className={shellStyles.brand}><MboMark className={shellStyles.brandMark} title="MyBetOracle" /><span className={shellStyles.brandName}>MyBetOracle</span></div>
        </div>
      </header>
      <div className={styles.loadingShell}>
        <aside className={styles.loadingSide} />
        <main className={styles.loadingMain}>
          <div className={styles.loadingTitle} />
          <div className={styles.loadingFilters} />
          <div className={styles.loadingTabs} />
          <div className={styles.loadingTable}>{Array.from({ length: 8 }).map((_, index) => <span key={index} />)}</div>
        </main>
        <aside className={styles.loadingRail} />
      </div>
    </div>
  );
}
