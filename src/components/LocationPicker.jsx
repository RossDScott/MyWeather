import styles from './LocationPicker.module.css';

export default function LocationPicker({ locations, activeId, onSelect, onManage, onClose }) {
  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.sheet}>
        <div className={styles.handle} />
        <div className={styles.content}>
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
