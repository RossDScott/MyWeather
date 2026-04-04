import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchWeatherData } from './utils/api';
import { getWalkForecast, getTodayHourly, getNowMinutely, getWeekExtremes, getWeekTemps } from './utils/dataHelpers';
import { codeToType, BG_GRADIENTS } from './utils/weatherCodes';
import { loadLocations, saveLocations, loadActiveId, saveActiveId } from './utils/locations';
import WeatherBackground from './components/WeatherBackground';
import Header from './components/Header';
import DogWalkCard from './components/DogWalkCard';
import NowCard from './components/NowCard';
import Next24Card from './components/Next24Card';
import ExtremesCard from './components/ExtremesCard';
import WeekForecast from './components/WeekForecast';
import DotIndicator from './components/DotIndicator';
import LocationPicker from './components/LocationPicker';
import ManageLocations from './components/ManageLocations';
import styles from './App.module.css';

const PAGES = 2;

export default function App() {
  const [locations, setLocations] = useState(loadLocations);
  const [activeId, setActiveId] = useState(() => {
    const saved = loadActiveId();
    const locs = loadLocations();
    return saved && locs.find((l) => l.id === saved) ? saved : locs[0].id;
  });
  const [showPicker, setShowPicker] = useState(false);
  const [showManage, setShowManage] = useState(false);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [page, setPage] = useState(0);
  const touchRef = useRef({ startX: 0, startY: 0, inScroller: false });

  const activeLocation = locations.find((l) => l.id === activeId) || locations[0];

  const fetchData = useCallback(async () => {
    setLoading(true);
    const json = await fetchWeatherData(activeLocation.latitude, activeLocation.longitude);
    setData(json);
    setLastUpdated(new Date());
    setLoading(false);
  }, [activeLocation.latitude, activeLocation.longitude]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateLocations = useCallback((next) => {
    setLocations(next);
    saveLocations(next);
  }, []);

  const handleSelectLocation = useCallback((id) => {
    setActiveId(id);
    saveActiveId(id);
    setShowPicker(false);
  }, []);

  const handleActiveChange = useCallback((id) => {
    setActiveId(id);
    saveActiveId(id);
  }, []);

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

  const walk = useMemo(() => data ? getWalkForecast(data) : null, [data]);
  const nowMinutely = useMemo(() => data ? getNowMinutely(data) : [], [data]);
  const todayHours = useMemo(() => data ? getTodayHourly(data) : [], [data]);
  const weekExtremes = useMemo(() => data ? getWeekExtremes(data) : null, [data]);
  const weekTemps = useMemo(() => data ? getWeekTemps(data) : [], [data]);
  const absMin = useMemo(() => weekTemps.length ? Math.min(...weekTemps.map((d) => d.min)) : 0, [weekTemps]);
  const absMax = useMemo(() => weekTemps.length ? Math.max(...weekTemps.map((d) => d.max)) : 20, [weekTemps]);

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
      <WeatherBackground weatherType={weatherType} />
      <div
        className={styles.container}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Header
          locationName={activeLocation.name}
          lastUpdated={lastUpdated}
          onRefresh={fetchData}
          onLocationTap={() => setShowPicker(true)}
        />

        <div className={styles.pageContainer}>
          {page === 0 && (
            <>
              <DogWalkCard walk={walk} />
              <NowCard slots={nowMinutely} />
              <Next24Card hours={todayHours} />
            </>
          )}

          {page === 1 && (
            <>
              <ExtremesCard extremes={weekExtremes} />
              <WeekForecast weekTemps={weekTemps} absMin={absMin} absMax={absMax} data={data} />
            </>
          )}
        </div>
      </div>

      <DotIndicator page={page} onPageChange={setPage} />

      {showPicker && !showManage && (
        <LocationPicker
          locations={locations}
          activeId={activeId}
          onSelect={handleSelectLocation}
          onManage={() => setShowManage(true)}
          onClose={() => setShowPicker(false)}
        />
      )}

      {showManage && (
        <ManageLocations
          locations={locations}
          activeId={activeId}
          onChange={handleUpdateLocations}
          onActiveChange={handleActiveChange}
          onClose={() => { setShowManage(false); setShowPicker(false); }}
        />
      )}
    </div>
  );
}
