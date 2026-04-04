import styles from './Header.module.css';

export default function Header({ locationName, lastUpdated, onRefresh, onLocationTap }) {
  return (
    <div className={styles.header}>
      <p className={styles.location} onClick={onLocationTap} style={{ cursor: 'pointer' }}>
        {locationName} ▾
      </p>
      <div className={styles.right}>
        {lastUpdated && (
          <span className={styles.time}>
            {lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <button onClick={onRefresh} className={styles.refreshBtn} title="Refresh">
          ↻
        </button>
      </div>
    </div>
  );
}
