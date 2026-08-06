import styles from "./brand-marks.module.css";

type MarkProps = {
  className?: string;
  title?: string;
};

type LockupProps = {
  inverse?: boolean;
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

export function MicroMark({ className, title = "MyBetOracle" }: MarkProps) {
  return (
    <svg
      aria-label={title}
      className={className}
      role="img"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="60" height="60" x="2" y="2" rx="10" fill="currentColor" />
      <path
        d="M7 46V18h6l7 13 7-13h6v28h-7V32l-6 11-6-11v14H7Zm28 0V18h12c7 0 10 3 10 8 0 3-1.5 5.2-4.5 6.5 3.7 1.1 5.5 3.4 5.5 6.7 0 4.5-3.6 6.8-10.7 6.8H35Zm7-22v6h4.4c2.4 0 3.6-1 3.6-3s-1.2-3-3.6-3H42Zm0 11.5V40h5c2.5 0 3.7-.8 3.7-2.3 0-1.5-1.2-2.2-3.7-2.2h-5Z"
        fill="white"
      />
    </svg>
  );
}

export function PrimaryLockup({ inverse = false }: LockupProps) {
  return (
    <div className={`${styles.primaryLockup} ${inverse ? styles.inverse : ""}`} aria-label="MyBetOracle">
      <HeritageMonogram inverse={inverse} />
      <span className={styles.wordmark} aria-hidden="true">
        <span className={styles.wordmarkLead}>MyBet</span>
        <span className={styles.wordmarkFocus}>Oracle</span>
      </span>
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
