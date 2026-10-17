import Constants from 'expo-constants';

import type { YouTubeVideo } from '@/types/media';

type SearchResponse = {
  nextPageToken?: string;
  items?: Array<{
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      description?: string;
      channelTitle?: string;
      thumbnails?: { medium?: { url?: string }; default?: { url?: string } };
    };
  }>;
  error?: { message?: string };
};

export type YouTubeSearchPage = {
  videos: YouTubeVideo[];
  nextPageToken?: string;
};

export function getYouTubeApiKey() {
  return String(Constants.expoConfig?.extra?.youtubeApiKey ?? '').trim();
}

export async function searchYouTube(query: string, pageToken?: string): Promise<YouTubeSearchPage> {
  const apiKey = getYouTubeApiKey();
  if (!apiKey) throw new Error('Add EXPO_PUBLIC_YOUTUBE_API_KEY to your .env file to enable YouTube search.');

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', '20');
  url.searchParams.set('q', query);
  url.searchParams.set('key', apiKey);
  if (pageToken) url.searchParams.set('pageToken', pageToken);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  let response: Response;
  try {
    response = await fetch(url.toString(), { signal: controller.signal });
  } catch (reason) {
    if (reason instanceof Error && reason.name === 'AbortError') {
      throw new Error('YouTube search timed out. Check your connection and try again.');
    }
    throw reason;
  } finally {
    clearTimeout(timeout);
  }
  const payload = (await response.json()) as SearchResponse;
  if (!response.ok) throw new Error(payload.error?.message ?? `YouTube search failed (${response.status}).`);

  const videos = (payload.items ?? []).flatMap((item) => {
    const id = item.id?.videoId;
    const snippet = item.snippet;
    if (!id || !snippet) return [];
    return [{
      id,
      title: snippet.title ?? 'Untitled video',
      description: snippet.description ?? '',
      channelTitle: snippet.channelTitle ?? '',
      thumbnailUrl: snippet.thumbnails?.medium?.url ?? snippet.thumbnails?.default?.url ?? '',
    }];
  });
  return { videos, nextPageToken: payload.nextPageToken };
}
