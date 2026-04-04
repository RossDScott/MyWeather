import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWeatherData } from './utils/api';
import { getWalkForecast, getTodayHourly, getNowMinutely, getWeekExtremes, getWeekTemps } from './utils/dataHelpers';
import { codeToType, BG_GRADIENTS } from './utils/weatherCodes';
import Header from './components/Header';
import DotIndicator from './components/DotIndicator';
import styles from './App.module.css';

const PAGES = 2;

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [page, setPage] = useState(0);
  const touchRef = useRef({ startX: 0, startY: 0, inScroller: false });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const json = await fetchWeatherData();
    setData(json);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTouchStart = useCallback((e) => {
    const el = e.target.closest('.todayScroll');
    touchRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      inScroller: !!el,
    };
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchRef.current.inScroller) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    const dy = e.changedTouches[0].clientY - touchRef.current.startY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0 && page < PAGES - 1) setPage((p) => p + 1);
      if (dx > 0 && page > 0) setPage((p) => p - 1);
    }
  }, [page]);

  const walk = data ? getWalkForecast(data) : null;
  const todayHours = data ? getTodayHourly(data) : [];
  const nowMinutely = data ? getNowMinutely(data) : [];
  const weekExtremes = data ? getWeekExtremes(data) : null;
  const weekTemps = data ? getWeekTemps(data) : [];

  const currentWeatherCode = data?.daily?.weather_code?.[0] ?? null;
  const weatherType = codeToType(currentWeatherCode);

  if (loading && !data) {
    return (
      <div className={styles.shell} style={{ background: BG_GRADIENTS.overcast }}>
        <div className={styles.loader}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Fetching forecast…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.shell}
      style={{ background: BG_GRADIENTS[weatherType] || BG_GRADIENTS.overcast }}
    >
      <div
        className={styles.container}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Header lastUpdated={lastUpdated} onRefresh={fetchData} />

        <div className={styles.pageContainer}>
          {page === 0 && (
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                Page 1: Now
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 8 }}>
                {walk && `🐕 ${walk.label} ${walk.time} — ${walk.temp}°C, ${walk.rainChance}% rain`}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>
                {nowMinutely.length} × 15-min slots · {todayHours.length} hourly slots
              </p>
            </div>
          )}

          {page === 1 && (
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                Page 2: Week
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 8 }}>
                {weekTemps.length} days · {weekExtremes && `Peak wind: ${weekExtremes.peakWind.speed} km/h`}
              </p>
            </div>
          )}
        </div>
      </div>

      <DotIndicator page={page} onPageChange={setPage} />
    </div>
  );
}
