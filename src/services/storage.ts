import AsyncStorage from '@react-native-async-storage/async-storage';

const keys = {
  history: 'wave-player:history:v1',
  imports: 'wave-player:imports:v1',
  favorites: 'wave-player:favorites:v1',
  searches: 'wave-player:searches:v1',
  preferences: 'wave-player:preferences:v1',
};

export async function readStored<T>(key: string, fallback: T): Promise<T> {
  const value = await AsyncStorage.getItem(key);
  if (value === null) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    await AsyncStorage.removeItem(key);
    return fallback;
  }
}

export function writeStored<T>(key: string, value: T): Promise<void> {
  return AsyncStorage.setItem(key, JSON.stringify(value));
}

export const storageKeys = keys;
