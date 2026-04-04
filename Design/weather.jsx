import { useState, useEffect, useCallback, useRef } from "react";

const WI = {
  0: { icon: "☀️", label: "Clear" },
  1: { icon: "🌤", label: "Mostly clear" },
  2: { icon: "⛅", label: "Partly cloudy" },
  3: { icon: "☁️", label: "Overcast" },
  45: { icon: "🌫", label: "Fog" },
  48: { icon: "🌫", label: "Rime fog" },
  51: { icon: "🌦", label: "Light drizzle" },
  53: { icon: "🌦", label: "Drizzle" },
  55: { icon: "🌧", label: "Heavy drizzle" },
  56: { icon: "🌨", label: "Freezing drizzle" },
  57: { icon: "🌨", label: "Heavy freezing drizzle" },
  61: { icon: "🌧", label: "Light rain" },
  63: { icon: "🌧", label: "Rain" },
  65: { icon: "🌧", label: "Heavy rain" },
  66: { icon: "🌨", label: "Freezing rain" },
  67: { icon: "🌨", label: "Heavy freezing rain" },
  71: { icon: "❄️", label: "Light snow" },
  73: { icon: "❄️", label: "Snow" },
  75: { icon: "❄️", label: "Heavy snow" },
  77: { icon: "❄️", label: "Snow grains" },
  80: { icon: "🌦", label: "Light showers" },
  81: { icon: "🌧", label: "Showers" },
  82: { icon: "🌧", label: "Heavy showers" },
  85: { icon: "🌨", label: "Snow showers" },
  86: { icon: "🌨", label: "Heavy snow showers" },
  95: { icon: "⛈", label: "Thunderstorm" },
  96: { icon: "⛈", label: "Thunderstorm + hail" },
  99: { icon: "⛈", label: "Thunderstorm + heavy hail" },
};

const getWeather = (code) => WI[code] || { icon: "❓", label: "Unknown" };

// Map WMO weather codes to background types
function codeToType(code) {
  if (code == null) return "overcast";
  if ([0, 1].includes(code)) return "sunny";
  if ([2, 3, 45, 48].includes(code)) return "overcast";
  if ([71, 73, 75, 77, 85, 86, 56, 57, 66, 67].includes(code)) return "snowy";
  if ([95, 96, 99].includes(code)) return "stormy";
  return "rainy"; // drizzle, rain, showers
}

const BG_GRADIENTS = {
  sunny: "linear-gradient(180deg, #1a3a5c 0%, #2d6a9f 30%, #f4a942 90%, #e8792e 100%)",
  rainy: "linear-gradient(180deg, #1a1f2e 0%, #2c3547 40%, #3d4a5c 80%, #4a5568 100%)",
  snowy: "linear-gradient(180deg, #2a3040 0%, #4a5568 40%, #8b9bb5 80%, #c4cfe0 100%)",
  overcast: "linear-gradient(180deg, #1e2433 0%, #374151 50%, #4b5563 100%)",
  stormy: "linear-gradient(180deg, #0d1117 0%, #1a1f2e 30%, #2d1f3d 70%, #3d2a4a 100%)",
};

function WeatherBackground({ weatherType }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const initParticles = useCallback((w, h, type) => {
    const particles = [];
    if (type === "rainy" || type === "stormy") {
      for (let i = 0; i < 150; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          speed: 8 + Math.random() * 8,
          len: 12 + Math.random() * 18,
          opacity: 0.15 + Math.random() * 0.25,
          drift: type === "stormy" ? 2 + Math.random() * 2 : 0,
        });
      }
    } else if (type === "snowy") {
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          r: 1.5 + Math.random() * 3,
          speed: 0.3 + Math.random() * 0.8,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.01 + Math.random() * 0.02,
          opacity: 0.4 + Math.random() * 0.4,
        });
      }
    } else if (type === "sunny") {
      for (let i = 0; i < 25; i++) {
        particles.push({
          x: w * 0.7 + (Math.random() - 0.5) * w * 0.5,
          y: h * 0.2 + (Math.random() - 0.5) * h * 0.3,
          r: 1 + Math.random() * 2,
          speed: 0.2 + Math.random() * 0.3,
          angle: Math.random() * Math.PI * 2,
          opacity: 0.2 + Math.random() * 0.3,
        });
      }
    } else if (type === "overcast") {
      for (let i = 0; i < 12; i++) {
        const cx = Math.random() * w * 1.6 - w * 0.3;
        const cy = h * 0.05 + Math.random() * h * 0.55;
        const scale = 0.5 + Math.random() * 1.0;
        const blobs = [];
        for (let j = 0; j < 28; j++) {
          const spreadX = (Math.random() - 0.5) * 180 * scale;
          const spreadY = (Math.random() - 0.5) * 40 * scale;
          const distFromCentre = Math.abs(spreadX) / (90 * scale);
          const baseR = (30 + Math.random() * 35) * scale * (1 - distFromCentre * 0.4);
          blobs.push({ ox: spreadX, oy: spreadY, r: Math.max(8, baseR) });
        }
        particles.push({
          x: cx, y: cy, blobs,
          speed: 0.08 + Math.random() * 0.12,
          opacity: 0.018 + Math.random() * 0.015,
          depth: Math.random(),
        });
      }
      particles.sort((a, b) => a.depth - b.depth);
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width = rect.width * dpr;
    const h = canvas.height = rect.height * dpr;

    const particles = initParticles(w, h, weatherType);
    let flash = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      if (weatherType === "rainy" || weatherType === "stormy") {
        particles.forEach(d => {
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.drift, d.y + d.len);
          ctx.strokeStyle = `rgba(174,194,224,${d.opacity})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          d.y += d.speed;
          d.x += d.drift;
          if (d.y > h) { d.y = -d.len; d.x = Math.random() * w; }
          if (d.x > w) d.x = 0;
        });
        if (weatherType === "stormy") {
          if (flash > 0) {
            ctx.fillStyle = `rgba(200,180,255,${flash * 0.12})`;
            ctx.fillRect(0, 0, w, h);
            flash -= 0.05;
          } else if (Math.random() < 0.005) {
            flash = 1;
          }
        }
      } else if (weatherType === "snowy") {
        particles.forEach(d => {
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${d.opacity})`;
          ctx.fill();
          d.y += d.speed;
          d.wobble += d.wobbleSpeed;
          d.x += Math.sin(d.wobble) * 0.5;
          if (d.y > h + d.r) { d.y = -d.r; d.x = Math.random() * w; }
        });
      } else if (weatherType === "sunny") {
        const grd = ctx.createRadialGradient(w * 0.72, h * 0.08, 10, w * 0.72, h * 0.08, 150);
        grd.addColorStop(0, "rgba(255,220,100,0.25)");
        grd.addColorStop(0.5, "rgba(255,180,50,0.08)");
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
        particles.forEach(d => {
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,230,150,${d.opacity})`;
          ctx.fill();
          d.angle += 0.008;
          d.x += Math.cos(d.angle) * d.speed;
          d.y += Math.sin(d.angle) * d.speed * 0.5;
        });
      } else if (weatherType === "overcast") {
        const offscreen = document.createElement("canvas");
        offscreen.width = w;
        offscreen.height = h;
        const oc = offscreen.getContext("2d");
        particles.forEach(d => {
          d.blobs.forEach(b => {
            oc.beginPath();
            oc.arc(d.x + b.ox, d.y + b.oy, b.r, 0, Math.PI * 2);
            oc.fillStyle = `rgba(190,200,220,${d.opacity})`;
            oc.fill();
          });
          d.x += d.speed;
          const maxR = Math.max(...d.blobs.map(b => Math.abs(b.ox) + b.r));
          if (d.x - maxR > w) d.x = -maxR;
        });
        ctx.save();
        ctx.filter = "blur(16px)";
        ctx.drawImage(offscreen, 0, 0);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.filter = "blur(30px)";
        ctx.drawImage(offscreen, 0, 0);
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [weatherType, initParticles]);

  return (
    <canvas ref={canvasRef} style={{
      position: "absolute", inset: 0,
      width: "100%", height: "100%",
      pointerEvents: "none",
    }} />
  );
}

const WIND_THRESHOLD = 50;

const API_PARAMS = [
  "latitude=51.0&longitude=-2.63",
  "hourly=temperature_2m,precipitation_probability,precipitation,wind_speed_10m,weather_code",
  "minutely_15=temperature_2m,precipitation_probability,precipitation,wind_speed_10m,weather_code",
  "daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,precipitation_sum,wind_speed_10m_max",
  "wind_speed_unit=kmh",
  "timezone=Europe/London",
  "forecast_days=7",
].join("&");

const API_URL = `https://api.open-meteo.com/v1/forecast?${API_PARAMS}`;

function generateMockData() {
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
    dailyPrecipSum.push(bd.rain > 40 ? Math.round(Math.random() * 8 * (bd.rain / 100) * 10) / 10 : bd.rain > 15 ? Math.round(Math.random() * 2 * 10) / 10 : 0);
    dailyWindMax.push(bd.wind);

    for (let h = 0; h < 24; h++) {
      hourlyTime.push(`${dateStr}T${String(h).padStart(2, "0")}:00`);
      const tempRange = bd.max - bd.min;
      const tempCurve = Math.sin(((h - 6) / 24) * Math.PI) * tempRange;
      hourlyTemp.push(Math.round((bd.min + Math.max(0, tempCurve)) * 10) / 10);
      const baseRain = bd.rain;
      hourlyRain.push(Math.min(100, Math.max(0, baseRain + Math.round((Math.random() - 0.5) * 20))));
      // Generate precipitation amount based on rain chance
      const rainChance = hourlyRain[hourlyRain.length - 1];
      hourlyPrecipMm.push(rainChance > 40 ? Math.round(Math.random() * 3 * (rainChance / 100) * 10) / 10 : rainChance > 20 ? Math.round(Math.random() * 0.5 * 10) / 10 : 0);
      const windBase = bd.wind;
      hourlyWind.push(Math.max(0, Math.round(windBase + (Math.random() - 0.5) * 16)));
      hourlyCode.push(bd.pattern[h]);
    }
  }

  // Generate 15-minute mock data for today and tomorrow
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
        min15Time.push(`${dateStr}T${String(h).padStart(2, "0")}:${String(m * 15).padStart(2, "0")}`);
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

function parseISO(str) {
  return new Date(str + (str.includes("T") ? "" : "T00:00:00"));
}

function formatDay(dateStr) {
  const d = parseISO(dateStr);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}

function formatHour(dateStr) {
  const d = parseISO(dateStr);
  const h = d.getHours();
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h > 12 ? `${h - 12}pm` : `${h}am`;
}

function getWalkForecast(data) {
  if (!data?.hourly) return null;
  const now = new Date();
  let targetDate = new Date(now);
  targetDate.setHours(12, 0, 0, 0);
  if (now.getHours() >= 14) {
    targetDate.setDate(targetDate.getDate() + 1);
  }
  const targetStr = targetDate.toISOString().slice(0, 13);
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
    label: isToday ? "Today" : "Tomorrow",
    temp: Math.round(temps[1]),
    rainChance: Math.max(...rainChances),
    wind: Math.round(winds[1]),
    weather: getWeather(weatherCode),
    time: "11am–1pm",
  };
}

function getWeekExtremes(data) {
  if (!data?.hourly || !data?.daily) return null;
  let peakWind = { speed: 0, time: "" };
  let minTemp = { temp: 999, time: "" };
  let maxTemp = { temp: -999, time: "" };

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
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const h = d.getHours();
    const hFmt = h === 0 ? "12am" : h === 12 ? "12pm" : h > 12 ? `${h - 12}pm` : `${h}am`;
    return `${days[d.getDay()]} ${hFmt}`;
  };

  return {
    peakWind: { ...peakWind, label: fmt(peakWind.time) },
    minTemp: { ...minTemp, label: fmt(minTemp.time) },
    maxTemp: { ...maxTemp, label: fmt(maxTemp.time) },
  };
}

function getWeekTemps(data) {
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

function getTodayHourly(data) {
  if (!data?.hourly) return [];
  const now = new Date();
  const nowStr = now.toISOString().slice(0, 13);
  const startIdx = data.hourly.time.findIndex(t => t.startsWith(nowStr));
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

function formatMinute(timeStr) {
  const parts = timeStr.split("T")[1];
  const [h, m] = parts.split(":").map(Number);
  const hFmt = h === 0 ? "12" : h > 12 ? `${h - 12}` : `${h}`;
  const suffix = h >= 12 ? "pm" : "am";
  return `${hFmt}:${String(m).padStart(2, "0")}${suffix}`;
}

function getNowMinutely(data) {
  if (!data?.minutely_15) return [];
  const now = new Date();
  const nowH = now.getHours();
  const nowM = Math.floor(now.getMinutes() / 15) * 15;
  const dateStr = now.toISOString().slice(0, 10);
  const nowStr = `${dateStr}T${String(nowH).padStart(2, "0")}:${String(nowM).padStart(2, "0")}`;

  const startIdx = data.minutely_15.time.findIndex(t => t === nowStr);
  if (startIdx === -1) return [];

  const slots = [];
  // 2 hours = 8 x 15-min slots + current = 9
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

function getHourlyDetail(data, dayIndex) {
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

const RainBar = ({ pct }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <div
      style={{
        width: 44,
        height: 5,
        borderRadius: 3,
        background: "rgba(255,255,255,0.1)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          borderRadius: 3,
          background:
            pct > 60
              ? "#5b9cf5"
              : pct > 30
              ? "rgba(91,156,245,0.6)"
              : "rgba(91,156,245,0.3)",
        }}
      />
    </div>
    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", minWidth: 28 }}>
      {pct}%
    </span>
  </div>
);

const TempRange = ({ min, max, absMin, absMax }) => {
  const range = absMax - absMin || 1;
  const leftPct = ((min - absMin) / range) * 100;
  const widthPct = ((max - min) / range) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
      <span
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.5)",
          minWidth: 24,
          textAlign: "right",
        }}
      >
        {min}°
      </span>
      <div
        style={{
          flex: 1,
          height: 5,
          borderRadius: 3,
          background: "rgba(255,255,255,0.08)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${leftPct}%`,
            width: `${Math.max(widthPct, 4)}%`,
            height: "100%",
            borderRadius: 3,
            background: "linear-gradient(90deg, #5b9cf5, #f5a623)",
          }}
        />
      </div>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", minWidth: 24 }}>
        {max}°
      </span>
    </div>
  );
};

export default function WeatherApp() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [page, setPage] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState([
    { id: "yeovil", name: "Yeovil, Somerset", latitude: 51.0, longitude: -2.63 },
    { id: "london", name: "London", latitude: 51.51, longitude: -0.13 },
    { id: "bath", name: "Bath, Somerset", latitude: 51.38, longitude: -2.36 },
  ]);
  const [activeLocationId, setActiveLocationId] = useState("yeovil");
  const [dragIdx, setDragIdx] = useState(null);
  const activeLocation = locations.find(l => l.id === activeLocationId) || locations[0];

  const fakeSearchResults = searchQuery.length >= 2 ? [
    { id: "bris", name: "Bristol", admin1: "England", latitude: 51.45, longitude: -2.58 },
    { id: "card", name: "Cardiff", admin1: "Wales", latitude: 51.48, longitude: -3.18 },
    { id: "exe", name: "Exeter", admin1: "Devon", latitude: 50.72, longitude: -3.53 },
  ].filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery.length >= 3) : [];

  const touchRef = useRef({ startX: 0, startY: 0 });
  const PAGES = 2;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (e) {
      // Fallback to mock data for preview / sandboxed environments
      const mock = generateMockData();
      setData(mock);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const walk = data ? getWalkForecast(data) : null;
  const todayHours = data ? getTodayHourly(data) : [];
  const nowMinutely = data ? getNowMinutely(data) : [];
  const weekExtremes = data ? getWeekExtremes(data) : null;
  const weekTemps = data ? getWeekTemps(data) : [];
  const hourly = data ? getHourlyDetail(data, expandedDay) : [];
  const absMin = weekTemps.length ? Math.min(...weekTemps.map((d) => d.min)) : 0;
  const absMax = weekTemps.length ? Math.max(...weekTemps.map((d) => d.max)) : 20;

  // Determine current weather type for background
  const currentWeatherCode = data?.daily?.weather_code?.[0] ?? null;
  const weatherType = codeToType(currentWeatherCode);

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
    // Only swipe if horizontal movement is dominant and significant
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0 && page < PAGES - 1) setPage(p => p + 1);
      if (dx > 0 && page > 0) setPage(p => p - 1);
    }
  }, [page]);

  if (loading && !data) {
    return (
      <div style={styles.shell}>
        <div style={styles.loader}>
          <div style={styles.spinner} />
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 16, fontSize: 14 }}>
            Fetching forecast…
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={styles.shell}>
        <div style={styles.loader}>
          <p style={{ color: "#f55b5b", fontSize: 14 }}>Failed to load: {error}</p>
          <button onClick={fetchData} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      ...styles.shell,
      background: BG_GRADIENTS[weatherType] || BG_GRADIENTS.overcast,
      transition: "background 1.5s ease",
      position: "relative",
      overflow: "hidden",
    }}>
      <WeatherBackground weatherType={weatherType} />
      <div
        style={{ ...styles.container, position: "relative", zIndex: 1 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header — shared across pages */}
        <div style={styles.header}>
          <p style={{ ...styles.subtitle, cursor: "pointer" }} onClick={() => setShowPicker(true)}>
            {activeLocation.name} ▾
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {lastUpdated && (
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button onClick={fetchData} style={styles.refreshBtn} title="Refresh">
              ↻
            </button>
          </div>
        </div>

        {/* Page container */}
        <div style={{ minHeight: "70vh" }}>

        {/* Page 0: Now */}
        {page === 0 && (
          <>
            {/* Walk Card */}
            {walk && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>🐕 {walk.label} · {walk.time}</h2>
                <div style={styles.walkCard}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 32 }}>{walk.weather.icon}</span>
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>{walk.temp}°C</span>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{walk.weather.label}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Rain</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: walk.rainChance > 50 ? "#5b9cf5" : "rgba(255,255,255,0.9)", marginTop: 1 }}>{walk.rainChance}%</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Wind</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: walk.wind >= WIND_THRESHOLD ? "#f55b5b" : "rgba(255,255,255,0.9)", marginTop: 1 }}>{walk.wind}<span style={{ fontSize: 11, fontWeight: 500 }}> km/h</span></div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            )}

            {/* Now — 15 minute intervals for 2 hours */}
            {nowMinutely.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Now</h2>
                <div style={styles.todayCard}>
                  <div className="todayScroll" style={styles.todayScroll}>
                    {nowMinutely.map((s, i) => (
                      <div key={i} style={{
                        ...styles.todayCol,
                        opacity: s.isNow ? 1 : 0.75,
                      }}>
                        <div style={{
                          ...styles.todayTime,
                          color: s.isNow ? "#5b9cf5" : "rgba(255,255,255,0.5)",
                          fontWeight: s.isNow ? 700 : 500,
                        }}>
                          {s.isNow ? "Now" : s.time}
                        </div>
                        <div style={{ fontSize: 22 }}>{s.weather.icon}</div>
                        <div style={styles.todayTemp}>{s.temp}°</div>
                        <div style={styles.todayDivider} />
                        <div style={{ ...styles.todayMeta, color: s.rainChance > 50 ? "#5b9cf5" : "rgba(255,255,255,0.45)" }}>
                          {s.rainChance}%
                        </div>
                        <div style={{ ...styles.todayMeta, fontSize: 13, letterSpacing: 1 }}>
                          {s.rainMm >= 2 ? "💧💧💧" : s.rainMm >= 0.5 ? "💧💧" : s.rainMm > 0 ? "💧" : "—"}
                        </div>
                        <div style={styles.todayDivider} />
                        <div style={{
                          ...styles.todayMeta,
                          color: s.wind >= WIND_THRESHOLD ? "#f55b5b" : "rgba(255,255,255,0.45)",
                        }}>
                          {s.wind} 💨
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Next 24 Hours */}
            {todayHours.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Next 24 Hours</h2>
                <div style={styles.todayCard}>
                  <div className="todayScroll" style={styles.todayScroll}>
                    {todayHours.map((h, i) => (
                      <div key={i} style={{
                        ...styles.todayCol,
                        opacity: h.isNow ? 1 : 0.75,
                      }}>
                        <div style={{
                          ...styles.todayTime,
                          color: h.isNow ? "#5b9cf5" : "rgba(255,255,255,0.5)",
                          fontWeight: h.isNow ? 700 : 500,
                        }}>
                          {h.isNow ? "Now" : h.time}
                        </div>
                        <div style={{ fontSize: 22 }}>{h.weather.icon}</div>
                        <div style={styles.todayTemp}>{h.temp}°</div>
                        <div style={styles.todayDivider} />
                        <div style={{ ...styles.todayMeta, color: h.rainChance > 50 ? "#5b9cf5" : "rgba(255,255,255,0.45)" }}>
                          {h.rainChance}%
                        </div>
                        <div style={{ ...styles.todayMeta, fontSize: 13, letterSpacing: 1 }}>
                          {h.rainMm >= 2 ? "💧💧💧" : h.rainMm >= 0.5 ? "💧💧" : h.rainMm > 0 ? "💧" : "—"}
                        </div>
                        <div style={styles.todayDivider} />
                        <div style={{
                          ...styles.todayMeta,
                          color: h.wind >= WIND_THRESHOLD ? "#f55b5b" : "rgba(255,255,255,0.45)",
                        }}>
                          {h.wind} 💨
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Page 1: Week */}
        {page === 1 && (
          <>
            {/* 7-Day Extremes */}
            {weekExtremes && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>7-Day Extremes</h2>
                <div style={styles.extremesCard}>
                <div style={{ display: "flex", gap: 0 }}>
                  <div style={styles.extremeItem}>
                    <div style={styles.extremeIcon}>💨</div>
                    <div style={styles.extremeValue}>
                      <span style={{ color: weekExtremes.peakWind.speed >= WIND_THRESHOLD ? "#f55b5b" : "rgba(255,255,255,0.9)" }}>
                        {weekExtremes.peakWind.speed} km/h
                      </span>
                    </div>
                    <div style={styles.extremeLabel}>Peak wind</div>
                    <div style={styles.extremeWhen}>{weekExtremes.peakWind.label}</div>
                  </div>
                  <div style={styles.extremeDivider} />
                  <div style={styles.extremeItem}>
                    <div style={styles.extremeIcon}>🔽</div>
                    <div style={styles.extremeValue}>{weekExtremes.minTemp.temp}°C</div>
                    <div style={styles.extremeLabel}>Coldest</div>
                    <div style={styles.extremeWhen}>{weekExtremes.minTemp.label}</div>
                  </div>
                  <div style={styles.extremeDivider} />
                  <div style={styles.extremeItem}>
                    <div style={styles.extremeIcon}>🔼</div>
                    <div style={styles.extremeValue}>{weekExtremes.maxTemp.temp}°C</div>
                    <div style={styles.extremeLabel}>Warmest</div>
                    <div style={styles.extremeWhen}>{weekExtremes.maxTemp.label}</div>
                  </div>
                </div>
                </div>
              </div>
            )}

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>7-Day Forecast</h2>
              <div style={styles.weekList}>
                {weekTemps.map((d, i) => (
                  <div key={i}>
                    <div
                      style={{
                        ...styles.dayRow,
                        background: expandedDay === i ? "rgba(255,255,255,0.06)" : "transparent",
                      }}
                      onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                    >
                      <div style={styles.dayLeft}>
                        <span style={{ fontSize: 20 }}>{d.weather.icon}</span>
                        <div>
                          <span style={styles.dayName}>
                            {i === 0 ? "Today" : d.day}
                          </span>
                          <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                            <span style={styles.dayMeta}>💧 {d.rainChance}%</span>
                            <span
                              style={{
                                ...styles.dayMeta,
                                color:
                                  d.windMax >= WIND_THRESHOLD
                                    ? "#f55b5b"
                                    : "rgba(255,255,255,0.4)",
                              }}
                            >
                              💨 {d.windMax} km/h
                            </span>
                          </div>
                        </div>
                      </div>
                      <TempRange min={d.min} max={d.max} absMin={absMin} absMax={absMax} />
                    </div>

                    {/* Hourly Breakdown */}
                    {expandedDay === i && hourly.length > 0 && (
                      <div style={styles.hourlyWrap}>
                        {hourly
                          .filter((_, hi) => hi % 2 === 0)
                          .map((h, hi) => (
                            <div key={hi} style={styles.hourRow}>
                              <span style={styles.hourTime}>{h.time}</span>
                              <span style={{ fontSize: 16 }}>{h.weather.icon}</span>
                              <span style={styles.hourTemp}>{h.temp}°</span>
                              <RainBar pct={h.rain} />
                              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", minWidth: 32 }}>
                                {h.rainMm > 0 ? `${h.rainMm}mm` : ""}
                              </span>
                              <span
                                style={{
                                  ...styles.hourWind,
                                  color:
                                    h.wind >= WIND_THRESHOLD
                                      ? "#f55b5b"
                                      : "rgba(255,255,255,0.5)",
                                }}
                              >
                                {h.wind} km/h
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        </div>

        {/* Dot Indicators */}
      </div>

      {/* Dot Indicators */}
      <div className="dotsFixed">
        {Array.from({ length: PAGES }).map((_, i) => (
          <div
            key={i}
            onClick={() => setPage(i)}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: i === page ? "#5b9cf5" : "rgba(255,255,255,0.25)",
              cursor: "pointer",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>

      {/* Location Picker Sheet */}
      {showPicker && !showManage && (
        <>
          <div style={styles.overlay} onClick={() => setShowPicker(false)} />
          <div style={styles.sheet}>
            <div style={styles.sheetHandle} />
            <div style={{ padding: "0 20px 20px" }}>
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => { setActiveLocationId(loc.id); setShowPicker(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: loc.id === activeLocationId ? 600 : 400 }}>
                    {loc.name}
                  </span>
                  {loc.id === activeLocationId && (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#5b9cf5" }} />
                  )}
                </div>
              ))}
              <button
                onClick={(e) => { e.stopPropagation(); setShowManage(true); }}
                style={styles.manageBtn}
              >
                Manage locations
              </button>
            </div>
          </div>
        </>
      )}

      {/* Manage Locations Screen */}
      {showManage && (
        <div style={styles.manageScreen}>
          <div style={styles.manageHeader}>
            <span style={{ fontSize: 17, fontWeight: 600 }}>Manage Locations</span>
            <button
              onClick={() => { setShowManage(false); setShowPicker(false); setSearchQuery(""); }}
              style={styles.doneBtn}
            >
              Done
            </button>
          </div>

          {/* Search */}
          <div style={{ padding: "0 20px" }}>
            <input
              type="text"
              placeholder="Search for a city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />

            {/* Search Results */}
            {fakeSearchResults.length > 0 && (
              <div style={styles.searchResults}>
                {fakeSearchResults.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      if (!locations.find(l => l.id === r.id)) {
                        setLocations([...locations, { id: r.id, name: `${r.name}, ${r.admin1}`, latitude: r.latitude, longitude: r.longitude }]);
                      }
                      setSearchQuery("");
                    }}
                    style={styles.searchRow}
                  >
                    <span style={{ fontSize: 14 }}>{r.name}, {r.admin1}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>+</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Locations */}
          <div style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, margin: "0 0 8px" }}>
              Saved · drag to reorder · top = default
            </p>
            {locations.map((loc, i) => (
              <div
                key={loc.id}
                draggable
                onDragStart={() => setDragIdx(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIdx === null || dragIdx === i) return;
                  const newLocs = [...locations];
                  const [moved] = newLocs.splice(dragIdx, 1);
                  newLocs.splice(i, 0, moved);
                  setLocations(newLocs);
                  setDragIdx(null);
                }}
                style={{
                  ...styles.manageRow,
                  background: i === 0 ? "rgba(91,156,245,0.12)" : "transparent",
                  borderColor: i === 0 ? "rgba(91,156,245,0.2)" : "rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 16, color: "rgba(255,255,255,0.25)", cursor: "grab", userSelect: "none" }}>≡</span>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{loc.name}</span>
                    {i === 0 && (
                      <span style={{ fontSize: 10, color: "#5b9cf5", marginLeft: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Default</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (locations.length <= 1) return;
                    const newLocs = locations.filter(l => l.id !== loc.id);
                    setLocations(newLocs);
                    if (activeLocationId === loc.id) setActiveLocationId(newLocs[0].id);
                  }}
                  style={{
                    ...styles.deleteBtn,
                    opacity: locations.length <= 1 ? 0.2 : 1,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .todayScroll::-webkit-scrollbar { display: none; }
        .dotsFixed {
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          justify-content: center;
          gap: 8px;
          padding: 6px 12px;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          z-index: 100;
        }
      `}</style>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    fontFamily: "'DM Sans', sans-serif",
    color: "#fff",
    WebkitFontSmoothing: "antialiased",
  },
  container: {
    maxWidth: 420,
    margin: "0 auto",
    padding: "16px 16px 32px",
  },
  loader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  spinner: {
    width: 28,
    height: 28,
    border: "2px solid rgba(255,255,255,0.15)",
    borderTopColor: "#5b9cf5",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  retryBtn: {
    marginTop: 16,
    padding: "8px 20px",
    background: "rgba(91,156,245,0.2)",
    color: "#5b9cf5",
    border: "1px solid rgba(91,156,245,0.3)",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    margin: 0,
    fontWeight: 500,
  },
  refreshBtn: {
    background: "rgba(255,255,255,0.08)",
    border: "none",
    color: "rgba(255,255,255,0.6)",
    fontSize: 20,
    width: 36,
    height: 36,
    borderRadius: 10,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  walkCard: {
    background: "linear-gradient(135deg, rgba(91,156,245,0.22) 0%, rgba(91,156,245,0.1) 100%)",
    border: "1px solid rgba(91,156,245,0.25)",
    borderRadius: 14,
    padding: "14px 16px",
    marginBottom: 12,
    backdropFilter: "blur(8px)",
  },
  todayCard: {
    background: "linear-gradient(135deg, rgba(91,156,245,0.22) 0%, rgba(91,156,245,0.1) 100%)",
    border: "1px solid rgba(91,156,245,0.25)",
    borderRadius: 14,
    padding: "12px 0",
    backdropFilter: "blur(8px)",
    overflow: "hidden",
  },
  todayScroll: {
    display: "flex",
    overflowX: "auto",
    gap: 0,
    padding: "0 6px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    WebkitOverflowScrolling: "touch",
  },
  todayCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    minWidth: 56,
    padding: "4px 6px",
    flexShrink: 0,
  },
  todayTime: {
    fontSize: 11,
    letterSpacing: "0.02em",
  },
  todayTemp: {
    fontSize: 15,
    fontWeight: 700,
  },
  todayDivider: {
    width: 20,
    height: 1,
    background: "rgba(255,255,255,0.08)",
  },
  todayMeta: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    fontWeight: 500,
  },
  extremesCard: {
    background: "linear-gradient(135deg, rgba(91,156,245,0.22) 0%, rgba(91,156,245,0.1) 100%)",
    border: "1px solid rgba(91,156,245,0.25)",
    borderRadius: 14,
    padding: "14px 16px",
    marginBottom: 24,
    backdropFilter: "blur(8px)",
  },
  extremeItem: {
    flex: 1,
    textAlign: "center",
  },
  extremeIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  extremeValue: {
    fontSize: 15,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  extremeLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginTop: 2,
  },
  extremeWhen: {
    fontSize: 11,
    color: "rgba(255,255,255,0.35)",
    marginTop: 1,
  },
  extremeDivider: {
    width: 1,
    alignSelf: "stretch",
    background: "rgba(255,255,255,0.08)",
    margin: "0 4px",
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    margin: "0 0 10px",
    letterSpacing: "0.02em",
  },
  weekList: {
    background: "linear-gradient(135deg, rgba(91,156,245,0.22) 0%, rgba(91,156,245,0.1) 100%)",
    borderRadius: 14,
    overflow: "hidden",
    border: "1px solid rgba(91,156,245,0.25)",
    backdropFilter: "blur(8px)",
  },
  dayRow: {
    display: "flex",
    alignItems: "center",
    padding: "12px 14px",
    gap: 12,
    cursor: "pointer",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    transition: "background 0.15s",
  },
  dayLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 110,
  },
  dayName: {
    fontSize: 14,
    fontWeight: 600,
    display: "block",
  },
  dayMeta: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
  },
  hourlyWrap: {
    background: "rgba(0,0,0,0.15)",
    padding: "8px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  hourRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 0",
    fontSize: 13,
  },
  hourTime: {
    minWidth: 36,
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: 500,
  },
  hourTemp: {
    minWidth: 28,
    fontWeight: 600,
    fontSize: 14,
  },
  hourWind: {
    minWidth: 24,
    fontSize: 12,
    textAlign: "right",
  },
  footer: {
    textAlign: "center",
    fontSize: 11,
    color: "rgba(255,255,255,0.25)",
    marginTop: 8,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 200,
  },
  sheet: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(180deg, #1a2540 0%, #0f1724 100%)",
    borderRadius: "20px 20px 0 0",
    border: "1px solid rgba(91,156,245,0.2)",
    borderBottom: "none",
    zIndex: 201,
    maxHeight: "55vh",
    overflow: "auto",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    background: "rgba(255,255,255,0.2)",
    margin: "10px auto 16px",
  },
  manageBtn: {
    width: "100%",
    padding: "14px",
    marginTop: 12,
    background: "rgba(91,156,245,0.15)",
    border: "1px solid rgba(91,156,245,0.25)",
    borderRadius: 12,
    color: "#5b9cf5",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  manageScreen: {
    position: "fixed",
    inset: 0,
    background: "#0f1724",
    zIndex: 300,
    overflow: "auto",
    fontFamily: "'DM Sans', sans-serif",
    color: "#fff",
  },
  manageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  doneBtn: {
    background: "none",
    border: "none",
    color: "#5b9cf5",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  searchInput: {
    width: "100%",
    padding: "12px 14px",
    marginTop: 16,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    color: "#fff",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  },
  searchResults: {
    marginTop: 8,
    background: "rgba(91,156,245,0.08)",
    border: "1px solid rgba(91,156,245,0.15)",
    borderRadius: 12,
    overflow: "hidden",
  },
  searchRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    cursor: "pointer",
  },
  manageRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid",
    marginBottom: 6,
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#f55b5b",
    fontSize: 16,
    cursor: "pointer",
    padding: "4px 8px",
    fontFamily: "inherit",
  },
};