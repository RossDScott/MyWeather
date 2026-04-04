import ForecastColumn from './ForecastColumn';
import styles from './Next24Card.module.css';

export default function Next24Card({ hours }) {
  if (!hours.length) return null;

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Next 24 Hours</h2>
      <div className={styles.card}>
        <div className={`todayScroll ${styles.scroll} hideScrollbar`}>
          {hours.map((h, i) => (
            <ForecastColumn key={i} slot={h} />
          ))}
        </div>
      </div>
    </div>
  );
}
