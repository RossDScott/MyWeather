import { WIND_THRESHOLD } from '../utils/constants';
import ForecastColumn from './ForecastColumn';
import styles from './DogWalkCard.module.css';

export default function DogWalkCard({ walk, walkMinutely }) {
  if (!walk) return null;

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>🐕 {walk.label} · {walk.time}</h2>
      <div className={styles.card}>
        <div className={styles.row}>
          <div className={styles.left}>
            <span className={styles.icon}>{walk.weather.icon}</span>
            <div>
              <div className={styles.tempRow}>
                <span className={styles.temp}>{walk.temp}°C</span>
                <span className={styles.condition}>{walk.weather.label}</span>
              </div>
            </div>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Rain</div>
              <div
                className={styles.statValue}
                style={{ color: walk.rainChance > 50 ? '#5b9cf5' : 'rgba(255,255,255,0.9)' }}
              >
                {walk.rainChance}%
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Wind</div>
              <div
                className={styles.statValue}
                style={{ color: walk.wind >= WIND_THRESHOLD ? '#f55b5b' : 'rgba(255,255,255,0.9)' }}
              >
                {walk.wind}<span className={styles.unit}> km/h</span>
              </div>
            </div>
          </div>
        </div>
        {walkMinutely && walkMinutely.length > 0 && (
          <>
            <hr className={styles.divider} />
            <div className={`todayScroll ${styles.scroll} hideScrollbar`}>
              {walkMinutely.map((s, i) => (
                <ForecastColumn key={i} slot={s} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
