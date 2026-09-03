import { MboMark } from "@/components/brand/brand-marks";
import styles from "@/features/accumulators/multi-picks-loading.module.css";
import shellStyles from "@/features/today/today-experience.module.css";

export default function MultiPicksLoading() {
  return (
    <div className={shellStyles.app} aria-busy="true">
      <header className={shellStyles.topbar}><div className={shellStyles.topbarInner}><div className={shellStyles.brand}><MboMark className={shellStyles.brandMark} title="MyBetOracle" /><span className={shellStyles.brandName}>MyBetOracle</span></div></div></header>
      <div className={styles.shell}><aside /><main><div className={styles.title} /><div className={styles.period} /><div className={styles.bands} /><div className={styles.summary} /><div className={styles.legs}>{Array.from({ length: 4 }).map((_, index) => <span key={index} />)}</div></main><aside /></div>
    </div>
  );
}
