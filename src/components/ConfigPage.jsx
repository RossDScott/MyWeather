import { useState } from 'react';
import { saveConfig } from '../utils/config';
import styles from './ConfigPage.module.css';

const HOUR_OPTIONS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am–9pm

function formatHour12(h) {
  if (h === 0) return '12am';
  if (h === 12) return '12pm';
  if (h > 12) return `${h - 12}pm`;
  return `${h}am`;
}

export default function ConfigPage({ config, onConfigChange, onClose }) {
  const [walkStartHour, setWalkStartHour] = useState(config.walkStartHour);

  const handleWalkHourChange = (e) => {
    const hour = Number(e.target.value);
    setWalkStartHour(hour);
    const next = { ...config, walkStartHour: hour };
    saveConfig(next);
    onConfigChange(next);
  };

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Settings</span>
        <button className={styles.doneBtn} onClick={onClose}>Done</button>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Walk Forecast</p>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Start time</span>
          <select
            className={styles.select}
            value={walkStartHour}
            onChange={handleWalkHourChange}
          >
            {HOUR_OPTIONS.map((h) => (
              <option key={h} value={h}>{formatHour12(h)}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
