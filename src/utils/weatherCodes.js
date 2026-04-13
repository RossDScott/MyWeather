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

const WI_NIGHT = {
  0: { icon: '🌙', label: 'Clear' },
  1: { icon: '🌙', label: 'Mostly clear' },
  2: { icon: '☁️', label: 'Partly cloudy' },
};

export const getWeather = (code, isNight = false) => {
  if (isNight && WI_NIGHT[code]) return WI_NIGHT[code];
  return WI[code] || { icon: '❓', label: 'Unknown' };
};

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
  'clear':              ['sunny'],
  'mostly-clear':       ['sunny', 'clouds-light'],
  'partly-cloudy':      ['sunny', 'clouds'],
  'overcast':           ['clouds'],
  'foggy':              ['fog'],
  'rainy':              ['rain'],
  'snowy':              ['snow'],
  'stormy':             ['rain', 'lightning'],
  'clear-night':        ['clouds-light'],
  'mostly-clear-night': ['clouds-light'],
  'partly-cloudy-night':['clouds'],
};

export const BG_GRADIENTS = {
  'clear':              'linear-gradient(180deg, #2d5079 0%, #4488bd 30%, #ffc168 90%, #ff9448 100%)',
  'mostly-clear':       'linear-gradient(180deg, #315580 0%, #4d8fc2 35%, #f0bc65 85%, #e4924f 100%)',
  'partly-cloudy':      'linear-gradient(180deg, #38506b 0%, #568bb0 35%, #a6bccf 75%, #cfbf92 100%)',
  'overcast':           'linear-gradient(180deg, #3f4656 0%, #5c697d 50%, #788294 100%)',
  'foggy':              'linear-gradient(180deg, #454d5d 0%, #65718a 40%, #8996a9 70%, #a8b3c2 100%)',
  'rainy':              'linear-gradient(180deg, #3a4155 0%, #525e75 40%, #68758a 80%, #768298 100%)',
  'snowy':              'linear-gradient(180deg, #3f4658 0%, #65718a 40%, #a8b8d0 80%, #dce5f2 100%)',
  'stormy':             'linear-gradient(180deg, #2a3140 0%, #3a4258 30%, #554564 70%, #66527a 100%)',
  'clear-night':        'linear-gradient(180deg, #1a2038 0%, #252e4e 40%, #304068 80%, #36476e 100%)',
  'mostly-clear-night': 'linear-gradient(180deg, #1c2238 0%, #2a3354 40%, #344268 80%, #3c4a72 100%)',
  'partly-cloudy-night':'linear-gradient(180deg, #1f2640 0%, #2e3958 40%, #3d4c6e 80%, #425074 100%)',
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
