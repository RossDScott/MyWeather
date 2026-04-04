import { BG_GRADIENTS } from './utils/weatherCodes';
import styles from './App.module.css';

export default function App() {
  return (
    <div
      className={styles.shell}
      style={{ background: BG_GRADIENTS.overcast }}
    >
      <div className={styles.container}>
        <div className={styles.loader}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Fetching forecast…</p>
        </div>
      </div>
    </div>
  );
}
