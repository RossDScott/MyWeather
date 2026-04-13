import ForecastColumn from './ForecastColumn';
import { WIND_THRESHOLD } from '../utils/constants';
import styles from './TodayCard.module.css';

export default function TodayCard({ slots, daily }) {
  if (!slots.length) return null;

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Today</h2>
      <div className={styles.card}>
        {daily && (
          <>
            <div className={styles.header}>
              <div className={styles.headerTemps}>
                <span className={styles.headerMin}>{daily.min}°</span>
                <span className={styles.headerSep}> / </span>
                <span className={styles.headerMax}>{daily.max}°</span>
              </div>
              <div
                className={styles.headerWind}
                style={{ color: daily.windMax >= WIND_THRESHOLD ? '#f55b5b' : undefined }}
              >
                💨 {daily.windMax} km/h
              </div>
            </div>
            <div className={styles.divider} />
          </>
        )}
        <div className={`todayScroll ${styles.scroll} hideScrollbar`}>
          {slots.map((s, i) => (
            <ForecastColumn key={i} slot={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
