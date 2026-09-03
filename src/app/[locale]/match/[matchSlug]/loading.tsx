import { MboMark } from "@/components/brand/brand-marks";
import styles from "@/features/match/match-loading.module.css";
import shellStyles from "@/features/today/today-experience.module.css";

export default function MatchLoading() {
  return (
    <div className={shellStyles.app} aria-busy="true">
      <header className={shellStyles.topbar}><div className={shellStyles.topbarInner}><div className={shellStyles.brand}><MboMark className={shellStyles.brandMark} title="MyBetOracle" /><span className={shellStyles.brandName}>MyBetOracle</span></div></div></header>
      <div className={styles.shell}><aside /><main><div className={styles.crumb} /><div className={styles.score} /><div className={styles.tabs} /><div className={styles.panel} /><div className={styles.rows}>{Array.from({ length: 5 }).map((_, index) => <span key={index} />)}</div></main><aside /></div>
    </div>
  );
}
