import { getWeather } from './weatherCodes';
import { parseISO, formatDay, formatHour, formatMinute } from './formatters';

// Format a Date in local time to match API time strings (Europe/London)
const pad2 = (n) => String(n).padStart(2, '0');
function localDateStr(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function localDateHourStr(d) {
  return `${localDateStr(d)}T${pad2(d.getHours())}`;
}

export function getWalkForecast(data) {
  if (!data?.hourly) return null;
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setHours(12, 0, 0, 0);
  if (now.getHours() >= 14) {
    targetDate.setDate(targetDate.getDate() + 1);
  }
  const targetStr = localDateHourStr(targetDate);
  const idx = data.hourly.time.findIndex((t) => t.startsWith(targetStr));
  if (idx === -1) return null;
  const indices = [idx - 1, idx, idx + 1].filter(
    (i) => i >= 0 && i < data.hourly.time.length
  );
  const temps = indices.map((i) => data.hourly.temperature_2m[i]);
  const rainChances = indices.map((i) => data.hourly.precipitation_probability[i]);
  const winds = indices.map((i) => data.hourly.wind_speed_10m[i]);
  const weatherCode = data.hourly.weather_code[idx];
  const isToday = targetDate.toDateString() === now.toDateString();
  return {
    label: isToday ? 'Today' : 'Tomorrow',
    temp: Math.round(temps[1]),
    rainChance: Math.max(...rainChances),
    wind: Math.round(winds[1]),
    weather: getWeather(weatherCode),
    time: '11am\u20131pm',
  };
}

export function getWeekExtremes(data) {
  if (!data?.hourly || !data?.daily) return null;
  let peakWind = { speed: 0, time: '' };
  let minTemp = { temp: 999, time: '' };
  let maxTemp = { temp: -999, time: '' };

  for (let i = 0; i < data.hourly.time.length; i++) {
    const w = data.hourly.wind_speed_10m[i];
    const t = data.hourly.temperature_2m[i];
    if (w > peakWind.speed) {
      peakWind = { speed: Math.round(w), time: data.hourly.time[i] };
    }
    if (t < minTemp.temp) {
      minTemp = { temp: Math.round(t), time: data.hourly.time[i] };
    }
    if (t > maxTemp.temp) {
      maxTemp = { temp: Math.round(t), time: data.hourly.time[i] };
    }
  }

  const fmt = (timeStr) => {
    const d = parseISO(timeStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const h = d.getHours();
    const hFmt = h === 0 ? '12am' : h === 12 ? '12pm' : h > 12 ? `${h - 12}pm` : `${h}am`;
    return `${days[d.getDay()]} ${hFmt}`;
  };

  return {
    peakWind: { ...peakWind, label: fmt(peakWind.time) },
    minTemp: { ...minTemp, label: fmt(minTemp.time) },
    maxTemp: { ...maxTemp, label: fmt(maxTemp.time) },
  };
}

export function getWeekTemps(data) {
  if (!data?.daily) return [];
  return data.daily.time.map((t, i) => ({
    day: formatDay(t),
    min: Math.round(data.daily.temperature_2m_min[i]),
    max: Math.round(data.daily.temperature_2m_max[i]),
    weather: getWeather(data.daily.weather_code[i]),
    rainChance: data.daily.precipitation_probability_max[i],
    rainMm: data.daily.precipitation_sum?.[i] ?? 0,
    windMax: Math.round(data.daily.wind_speed_10m_max[i]),
  }));
}

export function getTodayHourly(data) {
  if (!data?.hourly) return [];
  const now = new Date();
  const nowStr = localDateHourStr(now);
  const startIdx = data.hourly.time.findIndex((t) => t.startsWith(nowStr));
  if (startIdx === -1) return [];
  const hours = [];
  for (let i = startIdx; i < Math.min(startIdx + 25, data.hourly.time.length); i++) {
    hours.push({
      time: formatHour(data.hourly.time[i]),
      hour: parseISO(data.hourly.time[i]).getHours(),
      temp: Math.round(data.hourly.temperature_2m[i]),
      rainChance: data.hourly.precipitation_probability[i],
      rainMm: data.hourly.precipitation?.[i] ?? 0,
      wind: Math.round(data.hourly.wind_speed_10m[i]),
      weather: getWeather(data.hourly.weather_code[i]),
      isNow: i === startIdx,
    });
  }
  return hours;
}

export function getNowMinutely(data) {
  if (!data?.minutely_15) return [];
  const now = new Date();
  const nowM = Math.floor(now.getMinutes() / 15) * 15;
  const nowStr = `${localDateStr(now)}T${pad2(now.getHours())}:${pad2(nowM)}`;

  const startIdx = data.minutely_15.time.findIndex((t) => t === nowStr);
  if (startIdx === -1) return [];

  const slots = [];
  for (let i = startIdx; i < Math.min(startIdx + 9, data.minutely_15.time.length); i++) {
    slots.push({
      time: formatMinute(data.minutely_15.time[i]),
      temp: Math.round(data.minutely_15.temperature_2m[i]),
      rainChance: data.minutely_15.precipitation_probability[i],
      rainMm: data.minutely_15.precipitation?.[i] ?? 0,
      wind: Math.round(data.minutely_15.wind_speed_10m[i]),
      weather: getWeather(data.minutely_15.weather_code[i]),
      isNow: i === startIdx,
    });
  }
  return slots;
}

export function getHourlyDetail(data, dayIndex) {
  if (!data?.hourly || dayIndex == null) return [];
  const dayStr = data.daily.time[dayIndex];
  const hours = [];
  for (let i = 0; i < data.hourly.time.length; i++) {
    if (data.hourly.time[i].startsWith(dayStr)) {
      hours.push({
        time: formatHour(data.hourly.time[i]),
        hour: parseISO(data.hourly.time[i]).getHours(),
        temp: Math.round(data.hourly.temperature_2m[i]),
        rain: data.hourly.precipitation_probability[i],
        rainMm: data.hourly.precipitation?.[i] ?? 0,
        wind: Math.round(data.hourly.wind_speed_10m[i]),
        weather: getWeather(data.hourly.weather_code[i]),
      });
    }
  }
  return hours;
}
