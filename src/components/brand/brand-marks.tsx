import styles from "./brand-marks.module.css";

type MarkProps = {
  className?: string;
  title?: string;
};

type LockupProps = {
  inverse?: boolean;
  compact?: boolean;
};

export function OracleBallMark({ className, title = "MyBetOracle" }: MarkProps) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-label={title || undefined}
      className={className}
      role={title ? "img" : undefined}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <mask id="oracle-ball-cutout" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <rect width="64" height="64" fill="white" />
          <circle cx="32" cy="32" fill="none" r="22" stroke="black" strokeWidth="2" />
          <path d="M32 18.5 41 25l-3.45 10.55h-11.1L23 25l9-6.5Z" fill="black" />
          <path
            d="m23.35 25.35-11.2 1.7M40.65 25.35l11.2 1.7M27 35.3l-4.85 10.15M37 35.3l4.85 10.15M32 18.5V9.9"
            fill="none"
            stroke="black"
            strokeLinecap="round"
            strokeWidth="2.4"
          />
          <path
            d="M12.2 27.05a22 22 0 0 0 9.95 18.4M51.8 27.05a22 22 0 0 1-9.95 18.4"
            fill="none"
            stroke="black"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
        </mask>
      </defs>
      <circle cx="32" cy="32" fill="currentColor" mask="url(#oracle-ball-cutout)" r="30" />
    </svg>
  );
}

export function PrimaryLockup({ inverse = false, compact = false }: LockupProps) {
  return (
    <div className={`${styles.primaryLockup} ${inverse ? styles.inverse : ""}`}>
      <OracleBallMark className={styles.primarySymbol} title="" />
      {!compact && (
        <span className={styles.wordmark}>
          <span className={styles.wordmarkLead}>MyBet</span>
          <span className={styles.wordmarkFocus}>Oracle</span>
        </span>
      )}
    </div>
  );
}

export function HeritageMonogram({ inverse = false }: Pick<LockupProps, "inverse">) {
  return (
    <div className={`${styles.heritageMark} ${inverse ? styles.inverse : ""}`} aria-label="MBO">
      <span>MB</span>
      <OracleBallMark className={styles.heritageBall} title="" />
    </div>
  );
}
