const SETTINGS_KEY = 'sauna_map_settings_v1';
const SAUNA_CACHE_KEY = 'sauna_data_cache_v1';
const STORAGE_KEY = 'sauna_visits_v1';

export const saveSaunas = (saunas) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saunas));
};

export const loadSaunas = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSaunasCache = (saunas) => {
  localStorage.setItem(SAUNA_CACHE_KEY, JSON.stringify({
    data: saunas,
    timestamp: Date.now()
  }));
};

export const loadSaunasCache = () => {
  const cached = localStorage.getItem(SAUNA_CACHE_KEY);
  if (!cached) return null;
  try {
    return JSON.parse(cached);
  } catch (e) {
    return null;
  }
};

export const saveSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const loadSettings = () => {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : {
    idealTemp: 90,
    idealWaterTemp: 16,
    needsAirBath: true,
    needsAutoLoyly: false,
    preferredSize: 'large'
  };
};

export const initialMockData = [
  // Tokyo
  { id: 1, name: "天空のサウナ", lat: 35.6895, lng: 139.6917, rating: 5, memo: "スカイツリーが見える最高の外気浴。", temp: 95, waterTemp: 15, hasAirBath: true, hasAutoLoyly: true, visited: true },
  { id: 2, name: "深海の湯", lat: 35.66, lng: 139.73, rating: 4, memo: "水風呂が深くて最高。", temp: 88, waterTemp: 12, hasAirBath: false, hasAutoLoyly: false, visited: false },
  // Osaka
  { id: 3, name: "なにわ健康ランド", lat: 34.67, lng: 135.50, rating: 5, memo: "湯座敷が最高。", temp: 92, waterTemp: 14, hasAirBath: true, hasAutoLoyly: true, visited: false },
  // Hokkaido
  { id: 4, name: "リフレッシュ札幌", lat: 43.06, lng: 141.35, rating: 4, memo: "ジンギスカン後のサウナ。", temp: 90, waterTemp: 10, hasAirBath: true, hasAutoLoyly: false, visited: false },
  // Fukuoka
  { id: 5, name: "ウェルビー福岡", lat: 33.59, lng: 130.41, rating: 5, memo: "アイスサウナの衝撃。", temp: 100, waterTemp: 0, hasAirBath: false, hasAutoLoyly: true, visited: false },
  // Shizuoka
  { id: 6, name: "サウナしきじ", lat: 34.97, lng: 138.38, rating: 5, memo: "聖地。水が飲める。", temp: 110, waterTemp: 18, hasAirBath: false, hasAutoLoyly: false, visited: false },
  // Nagano
  { id: 7, name: "The Sauna", lat: 36.65, lng: 138.18, rating: 5, memo: "森の中のフィンランド。", temp: 85, waterTemp: 8, hasAirBath: true, hasAutoLoyly: false, visited: false }
];
