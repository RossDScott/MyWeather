import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchWeatherData, reverseGeocode, getDistanceKm } from './utils/api';
import { getWalkForecast, getWalkMinutely, getTodayCombined, getWeekExtremes, getWeekTemps, getCurrentWeatherCode, isCurrentlyNight } from './utils/dataHelpers';
import { codeToType, BG_GRADIENTS, EFFECT_LAYERS, getCardTint } from './utils/weatherCodes';
import { loadLocations, saveLocations, loadActiveId, saveActiveId, loadWeatherCache, saveWeatherCache, clearWeatherCache } from './utils/locations';
import { loadConfig } from './utils/config';
import WeatherBackground from './components/WeatherBackground';
import Header from './components/Header';
import ConfigPage from './components/ConfigPage';
import DogWalkCard from './components/DogWalkCard';
import TodayCard from './components/TodayCard';
import ExtremesCard from './components/ExtremesCard';
import WeekForecast from './components/WeekForecast';
import DotIndicator from './components/DotIndicator';
import LocationPicker from './components/LocationPicker';
import ManageLocations from './components/ManageLocations';
import styles from './App.module.css';

const PAGES = 2;
const CACHE_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const CURRENT_LOCATION_ID = '__current__';
const PROXIMITY_THRESHOLD_KM = 25;

export default function App() {
  const [locations, setLocations] = useState(loadLocations);
  const [activeId, setActiveId] = useState(() => {
    const saved = loadActiveId();
    const locs = loadLocations();
    if (locs.length === 0) return null;
    return saved && locs.find((l) => l.id === saved) ? saved : locs[0].id;
  });
  const [currentGpsLocation, setCurrentGpsLocation] = useState(null);
  const [geoChecking, setGeoChecking] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState(loadConfig);

  const [data, setData] = useState(() => {
    if (!activeId) return null;
    return loadWeatherCache(activeId)?.data ?? null;
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(() => {
    if (!activeId) return null;
    const cached = loadWeatherCache(activeId);
    return cached ? new Date(cached.timestamp) : null;
  });
  const [page, setPage] = useState(0);
  const touchRef = useRef({ startX: 0, startY: 0, inScroller: false });

  const activeLocation = useMemo(() => {
    if (activeId === CURRENT_LOCATION_ID && currentGpsLocation) return currentGpsLocation;
    return locations.find((l) => l.id === activeId) || locations[0] || null;
  }, [activeId, locations, currentGpsLocation]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoChecking(false);
      if (loadLocations().length === 0) setShowManage(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lon = Math.round(pos.coords.longitude * 10000) / 10000;
        const locs = loadLocations();

        // Find the nearest saved location
        let nearest = null;
        let nearestDist = Infinity;
        for (const loc of locs) {
          const dist = getDistanceKm(lat, lon, loc.latitude, loc.longitude);
          if (dist < nearestDist) { nearestDist = dist; nearest = loc; }
        }

        if (nearest && nearestDist < PROXIMITY_THRESHOLD_KM) {
          setActiveId(nearest.id);
          saveActiveId(nearest.id);
        } else {
          try {
            const name = await reverseGeocode(lat, lon);
            setCurrentGpsLocation({ id: CURRENT_LOCATION_ID, name, latitude: lat, longitude: lon });
            setActiveId(CURRENT_LOCATION_ID);
            // Don't persist '__current__' to localStorage
          } catch {
            if (locs.length === 0) setShowManage(true);
          }
        }
        setGeoChecking(false);
      },
      () => {
        setGeoChecking(false);
        if (loadLocations().length === 0) setShowManage(true);
      },
      { timeout: 10000 }
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = useCallback(async () => {
    if (!activeLocation) return;
    setLoading(true);
    const json = await fetchWeatherData(activeLocation.latitude, activeLocation.longitude);
    setData(json);
    if (json) {
      setLastUpdated(new Date());
      if (activeLocation.id !== CURRENT_LOCATION_ID) {
        saveWeatherCache(activeLocation.id, json);
      }
    }
    setLoading(false);
  }, [activeLocation]);

  useEffect(() => {
    if (!activeLocation) return;

    const cached = loadWeatherCache(activeLocation.id);
    if (cached?.data) {
      setData(cached.data);
      setLastUpdated(new Date(cached.timestamp));
    } else {
      setData(null);
      setLastUpdated(null);
    }

    const isFresh = cached && (Date.now() - cached.timestamp < CACHE_MAX_AGE);
    if (isFresh) {
      setLoading(false);
    } else {
      fetchData();
    }
  }, [activeLocation, fetchData]);

  const handleUpdateLocations = useCallback((next) => {
    locations
      .filter((l) => !next.find((n) => n.id === l.id))
      .forEach((l) => clearWeatherCache(l.id));
    setLocations(next);
    saveLocations(next);
  }, [locations]);

  const handleSelectLocation = useCallback((id) => {
    setActiveId(id);
    if (id !== CURRENT_LOCATION_ID) saveActiveId(id);
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

  const walk = useMemo(() => data ? getWalkForecast(data, config.walkStartHour) : null, [data, config.walkStartHour]);
  const walkMinutely = useMemo(() => data ? getWalkMinutely(data, config.walkStartHour) : [], [data, config.walkStartHour]);
  const todaySlots = useMemo(() => data ? getTodayCombined(data) : [], [data]);
  const weekExtremes = useMemo(() => data ? getWeekExtremes(data) : null, [data]);
  const weekTemps = useMemo(() => data ? getWeekTemps(data) : [], [data]);
  const absMin = useMemo(() => weekTemps.length ? Math.min(...weekTemps.map((d) => d.min)) : 0, [weekTemps]);
  const absMax = useMemo(() => weekTemps.length ? Math.max(...weekTemps.map((d) => d.max)) : 20, [weekTemps]);

  const currentWeatherCode = useMemo(() => data ? getCurrentWeatherCode(data) : null, [data]);
  const night = useMemo(() => data ? isCurrentlyNight(data) : false, [data]);
  const baseWeatherType = codeToType(currentWeatherCode);
  const weatherType = night && EFFECT_LAYERS[`${baseWeatherType}-night`] ? `${baseWeatherType}-night` : baseWeatherType;
  const effectLayers = EFFECT_LAYERS[weatherType] || ['clouds'];

  const handleCloseManage = useCallback(() => {
    setShowManage(false);
    setShowPicker(false);
    // Auto-select first location if none active
    if (!activeId && locations.length > 0) {
      setActiveId(locations[0].id);
      saveActiveId(locations[0].id);
    }
  }, [activeId, locations]);

  // Still checking geolocation and no location available yet — show loading
  if (geoChecking && !activeLocation) {
    return (
      <div className={styles.shell} style={{ background: BG_GRADIENTS.overcast }}>
        <div className={styles.loader}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Detecting location…</p>
        </div>
      </div>
    );
  }

  // No location set — show manage screen
  if (!activeLocation) {
    return (
      <div className={styles.shell} style={{ background: BG_GRADIENTS.overcast }}>
        <ManageLocations
          locations={locations}
          activeId={activeId}
          onChange={handleUpdateLocations}
          onActiveChange={handleActiveChange}
          onClose={handleCloseManage}
        />
      </div>
    );
  }

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
      <WeatherBackground effectLayers={effectLayers} />
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
          onConfigTap={() => setShowConfig(true)}
        />

        <div className={styles.pageContainer}>
          {page === 0 && (
            <>
              <div style={getCardTint(weatherType, 0)}>
                <DogWalkCard walk={walk} walkMinutely={walkMinutely} />
              </div>
              <div style={getCardTint(weatherType, 1)}>
                <TodayCard slots={todaySlots} daily={weekTemps[0]} />
              </div>
              <div style={getCardTint(weatherType, 2)}>
                <WeekForecast weekTemps={weekTemps} absMin={absMin} absMax={absMax} data={data} days={3} skipToday />
              </div>
              <div style={getCardTint(weatherType, 3)}>
                <ExtremesCard extremes={weekExtremes} />
              </div>
            </>
          )}

          {page === 1 && (
            <>
              <div style={getCardTint(weatherType, 0)}>
                <WeekForecast weekTemps={weekTemps} absMin={absMin} absMax={absMax} data={data} days={10} />
              </div>
            </>
          )}
        </div>
      </div>

      <DotIndicator page={page} onPageChange={setPage} />

      {showPicker && !showManage && (
        <LocationPicker
          locations={locations}
          activeId={activeId}
          currentGpsLocation={currentGpsLocation}
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
          onClose={handleCloseManage}
        />
      )}

      {showConfig && (
        <ConfigPage
          config={config}
          onConfigChange={setConfig}
          onClose={() => setShowConfig(false)}
        />
      )}
    </div>
  );
}
