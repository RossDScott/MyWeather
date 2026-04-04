import styles from './DotIndicator.module.css';

const PAGES = 2;

export default function DotIndicator({ page, onPageChange }) {
  return (
    <div className={styles.dots}>
      {Array.from({ length: PAGES }).map((_, i) => (
        <div
          key={i}
          onClick={() => onPageChange(i)}
          className={`${styles.dot} ${i === page ? styles.active : ''}`}
        />
      ))}
    </div>
  );
}
