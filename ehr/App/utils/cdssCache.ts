import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'cdss_cache_';

export interface CachedAlert {
  alerts: Record<string, string | null>;
  severity: string | null;
  timestamp: number;
}

export const getCdssCacheKey = (feature: string, patientId: string | number, inputData: any) => {
  const sortedInput = Object.keys(inputData)
    .sort()
    .reduce((acc: any, key) => {
      acc[key] = inputData[key];
      return acc;
    }, {});
  
  return `${CACHE_PREFIX}${feature}_${patientId}_${JSON.stringify(sortedInput)}`;
};

export const saveAlertToCache = async (
  feature: string,
  patientId: string | number,
  inputData: any,
  alerts: Record<string, string | null>,
  severity: string | null
) => {
  try {
    const key = getCdssCacheKey(feature, patientId, inputData);
    const cacheData: CachedAlert = {
      alerts,
      severity,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error(`[CDSS Cache] Error saving to cache for ${feature}:`, error);
  }
};

export const getAlertFromCache = async (
  feature: string,
  patientId: string | number,
  inputData: any
): Promise<CachedAlert | null> => {
  try {
    const key = getCdssCacheKey(feature, patientId, inputData);
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached) as CachedAlert;
    }
  } catch (error) {
    console.error(`[CDSS Cache] Error reading from cache for ${feature}:`, error);
  }
  return null;
};

export const getDataFromCache = async (
  feature: string,
  patientId: string | number
): Promise<any | null> => {
  try {
    const key = `${CACHE_PREFIX}data_${feature}_${patientId}`;
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error(`[Data Cache] Error reading from cache for ${feature}:`, error);
  }
  return null;
};

export const saveDataToCache = async (
  feature: string,
  patientId: string | number,
  data: any
) => {
  try {
    const key = `${CACHE_PREFIX}data_${feature}_${patientId}`;
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`[Data Cache] Error saving to cache for ${feature}:`, error);
  }
};
