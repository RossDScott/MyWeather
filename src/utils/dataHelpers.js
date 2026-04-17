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

function isNightTime(timeStr, data) {
  if (!data?.daily?.sunrise || !data?.daily?.sunset) return false;
  const dateStr = timeStr.slice(0, 10);
  const dayIdx = data.daily.time.indexOf(dateStr);
  if (dayIdx === -1) return false;
  const t = timeStr.replace('T', ' ');
  const rise = data.daily.sunrise[dayIdx].replace('T', ' ');
  const set = data.daily.sunset[dayIdx].replace('T', ' ');
  return t < rise || t >= set;
}

export function isCurrentlyNight(data) {
  const now = new Date();
  const nowStr = `${localDateStr(now)}T${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  return isNightTime(nowStr, data);
}

function formatHour12(h) {
  if (h === 0) return '12am';
  if (h === 12) return '12pm';
  if (h > 12) return `${h - 12}pm`;
  return `${h}am`;
}

export function getWalkForecast(data, walkStartHour = 12) {
  if (!data?.hourly) return null;
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setHours(walkStartHour, 0, 0, 0);
  if (now.getHours() >= walkStartHour) return null;
  const targetStr = localDateHourStr(targetDate);
  const idx = data.hourly.time.findIndex((t) => t.startsWith(targetStr));
  if (idx === -1) return null;
  const weatherCode = data.hourly.weather_code[idx];
  return {
    label: 'Today',
    temp: Math.round(data.hourly.temperature_2m[idx]),
    rainChance: data.hourly.precipitation_probability[idx],
    wind: Math.round(data.hourly.wind_speed_10m[idx]),
    weather: getWeather(weatherCode, isNightTime(data.hourly.time[idx], data)),
    time: `${formatHour12(walkStartHour)}\u2013${formatHour12(walkStartHour + 1)}`,
  };
}

export function getWalkMinutely(data, walkStartHour = 12) {
  if (!data?.minutely_15) return [];
  const now = new Date();
  if (now.getHours() >= walkStartHour) return [];
  const dateStr = localDateStr(now);
  const slots = [];
  for (let m = 0; m < 5; m++) {
    const minutes = m * 15;
    const hour = walkStartHour + Math.floor(minutes / 60);
    const min = minutes % 60;
    const timeStr = `${dateStr}T${pad2(hour)}:${pad2(min)}`;
    const idx = data.minutely_15.time.findIndex((t) => t === timeStr);
    if (idx === -1) continue;
    slots.push({
      time: formatMinute(data.minutely_15.time[idx]),
      temp: Math.round(data.minutely_15.temperature_2m[idx]),
      rainChance: data.minutely_15.precipitation_probability[idx],
      rainMm: data.minutely_15.precipitation?.[idx] ?? 0,
      wind: Math.round(data.minutely_15.wind_speed_10m[idx]),
      weather: getWeather(data.minutely_15.weather_code[idx], isNightTime(data.minutely_15.time[idx], data)),
      isNow: false,
    });
  }
  return slots;
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
    weather: getWeather(data.daily.weather_code[i], false),
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
      weather: getWeather(data.hourly.weather_code[i], isNightTime(data.hourly.time[i], data)),
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
      weather: getWeather(data.minutely_15.weather_code[i], isNightTime(data.minutely_15.time[i], data)),
      isNow: i === startIdx,
    });
  }
  return slots;
}

export function getTodayCombined(data) {
  if (!data?.minutely_15 || !data?.hourly) return [];
  const now = new Date();
  const nowM = Math.floor(now.getMinutes() / 15) * 15;
  const nowStr = `${localDateStr(now)}T${pad2(now.getHours())}:${pad2(nowM)}`;

  const startIdx15 = data.minutely_15.time.findIndex((t) => t === nowStr);
  if (startIdx15 === -1) return [];

  const slots = [];

  // 4 fifteen-minute slots (next hour)
  for (let i = startIdx15; i < Math.min(startIdx15 + 4, data.minutely_15.time.length); i++) {
    slots.push({
      time: formatMinute(data.minutely_15.time[i]),
      temp: Math.round(data.minutely_15.temperature_2m[i]),
      rainChance: data.minutely_15.precipitation_probability[i],
      rainMm: data.minutely_15.precipitation?.[i] ?? 0,
      wind: Math.round(data.minutely_15.wind_speed_10m[i]),
      weather: getWeather(data.minutely_15.weather_code[i], isNightTime(data.minutely_15.time[i], data)),
      isNow: i === startIdx15,
    });
  }

  // Hourly from the next full hour after the last 15-min slot
  const last15Str = data.minutely_15.time[Math.min(startIdx15 + 3, data.minutely_15.time.length - 1)];
  const nextHour = new Date(parseISO(last15Str));
  nextHour.setMinutes(0, 0, 0);
  nextHour.setHours(nextHour.getHours() + 1);
  const hourlyStartStr = localDateHourStr(nextHour);

  const startIdxH = data.hourly.time.findIndex((t) => t.startsWith(hourlyStartStr));
  if (startIdxH !== -1) {
    for (let i = startIdxH; i < Math.min(startIdxH + 23, data.hourly.time.length); i++) {
      slots.push({
        time: formatHour(data.hourly.time[i]),
        temp: Math.round(data.hourly.temperature_2m[i]),
        rainChance: data.hourly.precipitation_probability[i],
        rainMm: data.hourly.precipitation?.[i] ?? 0,
        wind: Math.round(data.hourly.wind_speed_10m[i]),
        weather: getWeather(data.hourly.weather_code[i], isNightTime(data.hourly.time[i], data)),
        isNow: false,
      });
    }
  }

  return slots;
}

export function getCurrentWeatherCode(data) {
  if (data?.minutely_15) {
    const now = new Date();
    const nowM = Math.floor(now.getMinutes() / 15) * 15;
    const nowStr = `${localDateStr(now)}T${pad2(now.getHours())}:${pad2(nowM)}`;
    const idx = data.minutely_15.time.findIndex((t) => t === nowStr);
    if (idx !== -1) return data.minutely_15.weather_code[idx];
  }
  return data?.daily?.weather_code?.[0] ?? null;
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
        weather: getWeather(data.hourly.weather_code[i], isNightTime(data.hourly.time[i], data)),
      });
    }
  }
  return hours;
}
