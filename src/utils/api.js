const SHARED_PARAMS = [
  'hourly=temperature_2m,precipitation_probability,precipitation,wind_speed_10m,weather_code',
  'minutely_15=temperature_2m,precipitation_probability,precipitation,wind_speed_10m,weather_code',
  'daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,precipitation_sum,wind_speed_10m_max',
  'wind_speed_unit=kmh',
  'timezone=Europe/London',
  'forecast_days=7',
].join('&');

function buildApiUrl(lat, lon) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&${SHARED_PARAMS}`;
}

export async function fetchWeatherData(lat, lon) {
  try {
    const res = await fetch(buildApiUrl(lat, lon));
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`;
  const res = await fetch(url, { headers: { 'User-Agent': 'MyWeather/1.0' } });
  if (!res.ok) throw new Error('Reverse geocode failed');
  const json = await res.json();
  const a = json.address || {};
  return a.city || a.town || a.village || a.hamlet || 'Unknown';
}

export async function searchLocations(query) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Search unavailable');
  const json = await res.json();
  return (json.results || []).map((r) => ({
    id: `${r.latitude}_${r.longitude}`,
    name: r.admin1 ? `${r.name}, ${r.admin1}` : `${r.name}, ${r.country}`,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}
