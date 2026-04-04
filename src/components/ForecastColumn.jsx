import { WIND_THRESHOLD } from '../utils/constants';
import styles from './ForecastColumn.module.css';

export default function ForecastColumn({ slot }) {
  const { time, weather, temp, rainChance, rainMm, wind, isNow } = slot;

  const droplets = rainMm >= 2 ? '💧💧💧' : rainMm >= 0.5 ? '💧💧' : rainMm > 0 ? '💧' : '—';

  return (
    <div className={styles.col} style={{ opacity: isNow ? 1 : 0.75 }}>
      <div
        className={styles.time}
        style={{
          color: isNow ? '#5b9cf5' : 'rgba(255,255,255,0.5)',
          fontWeight: isNow ? 700 : 500,
        }}
      >
        {isNow ? 'Now' : time}
      </div>
      <div className={styles.icon}>{weather.icon}</div>
      <div className={styles.temp}>{temp}°</div>
      <div className={styles.divider} />
      <div
        className={styles.meta}
        style={{ color: rainChance > 50 ? '#5b9cf5' : undefined }}
      >
        {rainChance}%
      </div>
      <div className={styles.droplets}>{droplets}</div>
      <div className={styles.divider} />
      <div
        className={styles.meta}
        style={{ color: wind >= WIND_THRESHOLD ? '#f55b5b' : undefined }}
      >
        {wind} 💨
      </div>
    </div>
  );
}
