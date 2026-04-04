const LOCATIONS_KEY = 'myweather-locations';
const ACTIVE_KEY = 'myweather-active-location';

export function loadLocations() {
  try {
    const raw = localStorage.getItem(LOCATIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return [];
}

export function saveLocations(locations) {
  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
}

export function loadActiveId() {
  return localStorage.getItem(ACTIVE_KEY) || null;
}

export function saveActiveId(id) {
  localStorage.setItem(ACTIVE_KEY, id);
}

const CACHE_PREFIX = 'myweather-weather-';

export function loadWeatherCache(locationId) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + locationId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.data && typeof parsed.timestamp === 'number') return parsed;
  } catch { /* corrupted */ }
  return null;
}

export function saveWeatherCache(locationId, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + locationId, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { /* storage full */ }
}

export function clearWeatherCache(locationId) {
  localStorage.removeItem(CACHE_PREFIX + locationId);
}
