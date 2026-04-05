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
  if (code === 0) return 'clear';
  if (code === 1) return 'mostly-clear';
  if (code === 2) return 'partly-cloudy';
  if (code === 3) return 'overcast';
  if ([45, 48].includes(code)) return 'foggy';
  if ([71, 73, 75, 77, 85, 86, 56, 57, 66, 67].includes(code)) return 'snowy';
  if ([95, 96, 99].includes(code)) return 'stormy';
  return 'rainy';
}

export const EFFECT_LAYERS = {
  'clear':         ['sunny'],
  'mostly-clear':  ['sunny', 'clouds-light'],
  'partly-cloudy': ['sunny', 'clouds'],
  'overcast':      ['clouds'],
  'foggy':         ['fog'],
  'rainy':         ['rain'],
  'snowy':         ['snow'],
  'stormy':        ['rain', 'lightning'],
};

export const BG_GRADIENTS = {
  'clear':         'linear-gradient(180deg, #1a3a5c 0%, #2d6a9f 30%, #f4a942 90%, #e8792e 100%)',
  'mostly-clear':  'linear-gradient(180deg, #1e3f62 0%, #3572a5 35%, #d4a050 85%, #c8763a 100%)',
  'partly-cloudy': 'linear-gradient(180deg, #253a52 0%, #3d6d94 35%, #8aa0b5 75%, #b5a57a 100%)',
  'overcast':      'linear-gradient(180deg, #2a3040 0%, #435063 50%, #5b6577 100%)',
  'foggy':         'linear-gradient(180deg, #303845 0%, #4a5568 40%, #6b7a8d 70%, #8a95a5 100%)',
  'rainy':         'linear-gradient(180deg, #252b3b 0%, #3a4559 40%, #4d5a6c 80%, #5a6578 100%)',
  'snowy':         'linear-gradient(180deg, #2a3040 0%, #4a5568 40%, #8b9bb5 80%, #c4cfe0 100%)',
  'stormy':        'linear-gradient(180deg, #191f27 0%, #262d3d 30%, #3d2f4d 70%, #4d3a5a 100%)',
};

const CARD_TINTS = {
  'clear': [
    { '--card-bg': 'linear-gradient(135deg, rgba(30,60,120,0.42) 0%, rgba(30,60,120,0.28) 100%)', '--card-border': 'rgba(50,100,180,0.35)', '--card-blur': '12px' },
    { '--card-bg': 'linear-gradient(135deg, rgba(25,52,110,0.49) 0%, rgba(25,52,110,0.33) 100%)', '--card-border': 'rgba(45,92,170,0.38)', '--card-blur': '13px' },
    { '--card-bg': 'linear-gradient(135deg, rgba(20,45,100,0.55) 0%, rgba(20,45,100,0.38) 100%)', '--card-border': 'rgba(40,85,160,0.40)', '--card-blur': '14px' },
  ],
  'mostly-clear': [
    { '--card-bg': 'linear-gradient(135deg, rgba(30,60,120,0.38) 0%, rgba(30,60,120,0.24) 100%)', '--card-border': 'rgba(50,100,180,0.32)', '--card-blur': '12px' },
    { '--card-bg': 'linear-gradient(135deg, rgba(25,52,110,0.43) 0%, rgba(25,52,110,0.28) 100%)', '--card-border': 'rgba(45,92,170,0.34)', '--card-blur': '13px' },
    { '--card-bg': 'linear-gradient(135deg, rgba(20,45,100,0.48) 0%, rgba(20,45,100,0.32) 100%)', '--card-border': 'rgba(40,85,160,0.36)', '--card-blur': '14px' },
  ],
  'partly-cloudy': [
    { '--card-bg': 'linear-gradient(135deg, rgba(40,80,140,0.30) 0%, rgba(40,80,140,0.16) 100%)', '--card-border': 'rgba(60,120,200,0.30)', '--card-blur': '10px' },
  ],
  'snowy': [
    { '--card-bg': 'linear-gradient(135deg, rgba(30,60,120,0.34) 0%, rgba(30,60,120,0.20) 100%)', '--card-border': 'rgba(50,100,180,0.32)', '--card-blur': '10px' },
  ],
};

export function getCardTint(weatherType, index) {
  const tints = CARD_TINTS[weatherType];
  if (!tints) return null;
  if (tints.length === 1) return tints[0];
  return tints[Math.min(index, tints.length - 1)];
}
