import { DEFAULT_LOCATION } from '../utils/constants';
import styles from './Header.module.css';

export default function Header({ lastUpdated, onRefresh }) {
  return (
    <div className={styles.header}>
      <p className={styles.location}>{DEFAULT_LOCATION.name}</p>
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
