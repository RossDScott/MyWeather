import { useState } from 'react';
import { WIND_THRESHOLD } from '../utils/constants';
import { getHourlyDetail } from '../utils/dataHelpers';
import TempRange from './TempRange';
import RainBar from './RainBar';
import styles from './WeekForecast.module.css';

export default function WeekForecast({ weekTemps, absMin, absMax, data, days, skipToday }) {
  const [expandedDay, setExpandedDay] = useState(null);
  const hourly = getHourlyDetail(data, expandedDay);
  const start = skipToday ? 1 : 0;
  const visibleTemps = days ? weekTemps.slice(start, start + days) : weekTemps.slice(start);

  if (!visibleTemps.length) return null;

  const title = days ? `${days}-Day Forecast` : '7-Day Forecast';

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.list}>
        {visibleTemps.map((d, i) => {
          const dayIdx = i + start;
          return (
          <div key={dayIdx}>
            <div
              className={styles.dayRow}
              style={{ background: expandedDay === dayIdx ? 'rgba(255,255,255,0.06)' : 'transparent' }}
              onClick={() => setExpandedDay(expandedDay === dayIdx ? null : dayIdx)}
            >
              <div className={styles.dayLeft}>
                <span className={styles.dayIcon}>{d.weather.icon}</span>
                <div>
                  <span className={styles.dayName}>
                    {dayIdx === 0 ? 'Today' : d.day}
                  </span>
                  <div className={styles.dayMetaRow}>
                    <span className={styles.dayMeta}>💧 {d.rainChance}%</span>
                    <span
                      className={styles.dayMeta}
                      style={{ color: d.windMax >= WIND_THRESHOLD ? '#f55b5b' : undefined }}
                    >
                      💨 {d.windMax} km/h
                    </span>
                  </div>
                </div>
              </div>
              <TempRange min={d.min} max={d.max} absMin={absMin} absMax={absMax} />
            </div>

            {expandedDay === dayIdx && hourly.length > 0 && (
              <div className={styles.hourlyWrap}>
                {hourly
                  .filter((_, hi) => hi % 2 === 0)
                  .map((h, hi) => (
                    <div key={hi} className={styles.hourRow}>
                      <span className={styles.hourTime}>{h.time}</span>
                      <span className={styles.hourIcon}>{h.weather.icon}</span>
                      <span className={styles.hourTemp}>{h.temp}°</span>
                      <RainBar pct={h.rain} />
                      <span className={styles.hourRainMm}>
                        {h.rainMm > 0 ? `${h.rainMm}mm` : ''}
                      </span>
                      <span
                        className={styles.hourWind}
                        style={{ color: h.wind >= WIND_THRESHOLD ? '#f55b5b' : undefined }}
                      >
                        {h.wind} km/h
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );
        })}
      </div>
    </div>
  );
}
