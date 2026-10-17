import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const result: ExpoConfig = {
    ...config,
    name: config.name ?? 'Wave Player',
    slug: config.slug ?? 'wave-player',
    extra: {
      ...config.extra,
      tagline: 'Your videos. Your experience.',
      youtubeApiKey: process.env.EXPO_PUBLIC_YOUTUBE_API_KEY ?? '',
    },
  };
  return result;
};
