import styles from './TempRange.module.css';

export default function TempRange({ min, max, absMin, absMax }) {
  const range = absMax - absMin || 1;
  const leftPct = ((min - absMin) / range) * 100;
  const widthPct = ((max - min) / range) * 100;

  return (
    <div className={styles.wrap}>
      <span className={styles.min}>{min}°</span>
      <div className={styles.track}>
        <div
          className={styles.bar}
          style={{
            left: `${leftPct}%`,
            width: `${Math.max(widthPct, 4)}%`,
          }}
        />
      </div>
      <span className={styles.max}>{max}°</span>
    </div>
  );
}
