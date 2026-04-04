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

export function generateMockData() {
  const now = new Date();
  const hourlyTime = [];
  const hourlyTemp = [];
  const hourlyRain = [];
  const hourlyPrecipMm = [];
  const hourlyWind = [];
  const hourlyCode = [];
  const dailyTime = [];
  const dailyMax = [];
  const dailyMin = [];
  const dailyCode = [];
  const dailyRainMax = [];
  const dailyPrecipSum = [];
  const dailyWindMax = [];

  const baseDays = [
    { min: 8, max: 15, code: 2, rain: 20, wind: 22, pattern: [3,2,1,0,0,1,2,2,3,3,2,1,0,0,1,2,3,3,2,2,1,1,2,3] },
    { min: 7, max: 13, code: 61, rain: 65, wind: 35, pattern: [3,3,3,3,3,61,61,63,63,61,61,3,3,61,63,63,61,61,3,3,3,3,3,3] },
    { min: 10, max: 17, code: 1, rain: 10, wind: 18, pattern: [0,0,0,0,1,1,1,0,0,0,1,1,2,2,1,1,0,0,0,0,0,0,0,0] },
    { min: 6, max: 12, code: 80, rain: 55, wind: 55, pattern: [3,3,3,80,80,81,80,3,3,2,2,80,81,82,80,3,3,2,2,3,3,3,3,3] },
    { min: 9, max: 16, code: 2, rain: 25, wind: 28, pattern: [1,1,0,0,0,1,2,2,3,3,2,2,1,1,2,2,3,3,2,2,1,1,0,0] },
    { min: 11, max: 18, code: 0, rain: 5, wind: 15, pattern: [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0] },
    { min: 8, max: 14, code: 3, rain: 40, wind: 32, pattern: [3,3,3,3,2,2,3,3,3,51,51,3,3,3,51,53,51,3,3,3,3,3,3,3] },
  ];

  for (let d = 0; d < 7; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    const dateStr = day.toISOString().slice(0, 10);
    dailyTime.push(dateStr);
    const bd = baseDays[d];
    dailyMax.push(bd.max);
    dailyMin.push(bd.min);
    dailyCode.push(bd.code);
    dailyRainMax.push(bd.rain);
    dailyPrecipSum.push(
      bd.rain > 40 ? Math.round(Math.random() * 8 * (bd.rain / 100) * 10) / 10
        : bd.rain > 15 ? Math.round(Math.random() * 2 * 10) / 10
        : 0
    );
    dailyWindMax.push(bd.wind);

    for (let h = 0; h < 24; h++) {
      hourlyTime.push(`${dateStr}T${String(h).padStart(2, '0')}:00`);
      const tempRange = bd.max - bd.min;
      const tempCurve = Math.sin(((h - 6) / 24) * Math.PI) * tempRange;
      hourlyTemp.push(Math.round((bd.min + Math.max(0, tempCurve)) * 10) / 10);
      const baseRain = bd.rain;
      hourlyRain.push(Math.min(100, Math.max(0, baseRain + Math.round((Math.random() - 0.5) * 20))));
      const rainChance = hourlyRain[hourlyRain.length - 1];
      hourlyPrecipMm.push(
        rainChance > 40 ? Math.round(Math.random() * 3 * (rainChance / 100) * 10) / 10
          : rainChance > 20 ? Math.round(Math.random() * 0.5 * 10) / 10
          : 0
      );
      const windBase = bd.wind;
      hourlyWind.push(Math.max(0, Math.round(windBase + (Math.random() - 0.5) * 16)));
      hourlyCode.push(bd.pattern[h]);
    }
  }

  const min15Time = [];
  const min15Temp = [];
  const min15Rain = [];
  const min15PrecipMm = [];
  const min15Wind = [];
  const min15Code = [];
  for (let d = 0; d < 2; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    const dateStr = day.toISOString().slice(0, 10);
    const bd = baseDays[d];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 4; m++) {
        min15Time.push(`${dateStr}T${String(h).padStart(2, '0')}:${String(m * 15).padStart(2, '0')}`);
        const tempRange = bd.max - bd.min;
        const tempCurve = Math.sin(((h + m / 4 - 6) / 24) * Math.PI) * tempRange;
        min15Temp.push(Math.round((bd.min + Math.max(0, tempCurve)) * 10) / 10);
        const rc = Math.min(100, Math.max(0, bd.rain + Math.round((Math.random() - 0.5) * 15)));
        min15Rain.push(rc);
        min15PrecipMm.push(rc > 40 ? Math.round(Math.random() * 2 * (rc / 100) * 10) / 10 : 0);
        min15Wind.push(Math.max(0, Math.round(bd.wind + (Math.random() - 0.5) * 12)));
        min15Code.push(bd.pattern[h]);
      }
    }
  }

  return {
    hourly: {
      time: hourlyTime,
      temperature_2m: hourlyTemp,
      precipitation_probability: hourlyRain,
      precipitation: hourlyPrecipMm,
      wind_speed_10m: hourlyWind,
      weather_code: hourlyCode,
    },
    minutely_15: {
      time: min15Time,
      temperature_2m: min15Temp,
      precipitation_probability: min15Rain,
      precipitation: min15PrecipMm,
      wind_speed_10m: min15Wind,
      weather_code: min15Code,
    },
    daily: {
      time: dailyTime,
      temperature_2m_max: dailyMax,
      temperature_2m_min: dailyMin,
      weather_code: dailyCode,
      precipitation_probability_max: dailyRainMax,
      precipitation_sum: dailyPrecipSum,
      wind_speed_10m_max: dailyWindMax,
    },
  };
}

export async function fetchWeatherData(lat, lon) {
  try {
    const res = await fetch(buildApiUrl(lat, lon));
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return await res.json();
  } catch {
    return generateMockData();
  }
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
