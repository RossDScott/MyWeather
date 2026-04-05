import ForecastColumn from './ForecastColumn';
import styles from './TodayCard.module.css';

export default function TodayCard({ slots }) {
  if (!slots.length) return null;

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Today</h2>
      <div className={styles.card}>
        <div className={`todayScroll ${styles.scroll} hideScrollbar`}>
          {slots.map((s, i) => (
            <ForecastColumn key={i} slot={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
