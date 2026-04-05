export const WI = {
  0: { icon: '☀️', label: 'Clear' },
  1: { icon: '🌤', label: 'Mostly clear' },
  2: { icon: '⛅', label: 'Partly cloudy' },
  3: { icon: '☁️', label: 'Overcast' },
  45: { icon: '🌫', label: 'Fog' },
  48: { icon: '🌫', label: 'Rime fog' },
  51: { icon: '🌦', label: 'Light drizzle' },
  53: { icon: '🌦', label: 'Drizzle' },
  55: { icon: '🌧', label: 'Heavy drizzle' },
  56: { icon: '🌨', label: 'Freezing drizzle' },
  57: { icon: '🌨', label: 'Heavy freezing drizzle' },
  61: { icon: '🌧', label: 'Light rain' },
  63: { icon: '🌧', label: 'Rain' },
  65: { icon: '🌧', label: 'Heavy rain' },
  66: { icon: '🌨', label: 'Freezing rain' },
  67: { icon: '🌨', label: 'Heavy freezing rain' },
  71: { icon: '❄️', label: 'Light snow' },
  73: { icon: '❄️', label: 'Snow' },
  75: { icon: '❄️', label: 'Heavy snow' },
  77: { icon: '❄️', label: 'Snow grains' },
  80: { icon: '🌦', label: 'Light showers' },
  81: { icon: '🌧', label: 'Showers' },
  82: { icon: '🌧', label: 'Heavy showers' },
  85: { icon: '🌨', label: 'Snow showers' },
  86: { icon: '🌨', label: 'Heavy snow showers' },
  95: { icon: '⛈', label: 'Thunderstorm' },
  96: { icon: '⛈', label: 'Thunderstorm + hail' },
  99: { icon: '⛈', label: 'Thunderstorm + heavy hail' },
};

export const getWeather = (code) => WI[code] || { icon: '❓', label: 'Unknown' };

export function codeToType(code) {
  if (code == null) return 'overcast';
  if ([0, 1].includes(code)) return 'sunny';
  if ([2, 3, 45, 48].includes(code)) return 'overcast';
  if ([71, 73, 75, 77, 85, 86, 56, 57, 66, 67].includes(code)) return 'snowy';
  if ([95, 96, 99].includes(code)) return 'stormy';
  return 'rainy';
}

export const BG_GRADIENTS = {
  sunny: 'linear-gradient(180deg, #1a3a5c 0%, #2d6a9f 30%, #f4a942 90%, #e8792e 100%)',
  rainy: 'linear-gradient(180deg, #252b3b 0%, #3a4559 40%, #4d5a6c 80%, #5a6578 100%)',
  snowy: 'linear-gradient(180deg, #2a3040 0%, #4a5568 40%, #8b9bb5 80%, #c4cfe0 100%)',
  overcast: 'linear-gradient(180deg, #2a3040 0%, #435063 50%, #5b6577 100%)',
  stormy: 'linear-gradient(180deg, #191f27 0%, #262d3d 30%, #3d2f4d 70%, #4d3a5a 100%)',
};
