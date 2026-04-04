export default function RainBar({ pct }) {
  const barColor =
    pct > 60 ? '#5b9cf5'
      : pct > 30 ? 'rgba(91,156,245,0.6)'
      : 'rgba(91,156,245,0.3)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 44,
        height: 5,
        borderRadius: 3,
        background: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: 3,
          background: barColor,
        }} />
      </div>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', minWidth: 28 }}>
        {pct}%
      </span>
    </div>
  );
}
