import { useState, useEffect, useCallback } from 'react';
import { fetchWeatherData } from './utils/api';
import { getWalkForecast, getTodayHourly, getNowMinutely, getWeekExtremes, getWeekTemps } from './utils/dataHelpers';
import { codeToType, BG_GRADIENTS } from './utils/weatherCodes';
import styles from './App.module.css';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

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
      <div className={styles.container}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          Weather data loaded — {weatherType} conditions
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 8 }}>
          {walk && `Dog walk: ${walk.label} ${walk.time} — ${walk.temp}°C, ${walk.rainChance}% rain, ${walk.wind} km/h wind`}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>
          {nowMinutely.length} × 15-min slots · {todayHours.length} hourly slots · {weekTemps.length} days
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>
          {weekExtremes && `Peak wind: ${weekExtremes.peakWind.speed} km/h (${weekExtremes.peakWind.label})`}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 12 }}>
          Last updated: {lastUpdated?.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
