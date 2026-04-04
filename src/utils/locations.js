import { DEFAULT_LOCATION } from './constants';

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
  return [DEFAULT_LOCATION];
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
