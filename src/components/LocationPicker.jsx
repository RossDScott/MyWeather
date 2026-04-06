import styles from './LocationPicker.module.css';

function GpsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  );
}

export default function LocationPicker({ locations, activeId, currentGpsLocation, onSelect, onManage, onClose }) {
  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.sheet}>
        <div className={styles.handle} />
        <div className={styles.content}>
          {currentGpsLocation && (
            <div
              className={styles.row}
              onClick={() => onSelect(currentGpsLocation.id)}
            >
              <span className={styles.gpsName} style={{ fontWeight: currentGpsLocation.id === activeId ? 600 : 400 }}>
                <GpsIcon />
                {currentGpsLocation.name}
              </span>
              {currentGpsLocation.id === activeId && <div className={styles.dot} />}
            </div>
          )}
          {locations.map((loc) => (
            <div
              key={loc.id}
              className={styles.row}
              onClick={() => onSelect(loc.id)}
            >
              <span
                className={styles.name}
                style={{ fontWeight: loc.id === activeId ? 600 : 400 }}
              >
                {loc.name}
              </span>
              {loc.id === activeId && <div className={styles.dot} />}
            </div>
          ))}
          <button
            className={styles.manageBtn}
            onClick={(e) => { e.stopPropagation(); onManage(); }}
          >
            Manage locations
          </button>
        </div>
      </div>
    </>
  );
}
