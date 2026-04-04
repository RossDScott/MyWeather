import { WIND_THRESHOLD } from '../utils/constants';
import styles from './ExtremesCard.module.css';

export default function ExtremesCard({ extremes }) {
  if (!extremes) return null;

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>7-Day Extremes</h2>
      <div className={styles.card}>
        <div className={styles.row}>
          <div className={styles.item}>
            <div className={styles.icon}>💨</div>
            <div
              className={styles.value}
              style={{ color: extremes.peakWind.speed >= WIND_THRESHOLD ? '#f55b5b' : 'rgba(255,255,255,0.9)' }}
            >
              {extremes.peakWind.speed} km/h
            </div>
            <div className={styles.label}>Peak wind</div>
            <div className={styles.when}>{extremes.peakWind.label}</div>
          </div>
          <div className={styles.divider} />
          <div className={styles.item}>
            <div className={styles.icon}>🔽</div>
            <div className={styles.value}>{extremes.minTemp.temp}°C</div>
            <div className={styles.label}>Coldest</div>
            <div className={styles.when}>{extremes.minTemp.label}</div>
          </div>
          <div className={styles.divider} />
          <div className={styles.item}>
            <div className={styles.icon}>🔼</div>
            <div className={styles.value}>{extremes.maxTemp.temp}°C</div>
            <div className={styles.label}>Warmest</div>
            <div className={styles.when}>{extremes.maxTemp.label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
