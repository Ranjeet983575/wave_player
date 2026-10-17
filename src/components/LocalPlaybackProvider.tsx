import { useEvent } from 'expo';
import { useVideoPlayer } from 'expo-video';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { readStored, storageKeys, writeStored } from '@/services/storage';
import type { LocalVideo, PlaybackRecord, PlayerPreferences } from '@/types/media';

type PlaybackContextValue = {
  activeVideo: LocalVideo | null;
  currentTime: number;
  duration: number;
  error: string | null;
  isPlaying: boolean;
  player: ReturnType<typeof useVideoPlayer>;
  play: (video: LocalVideo) => Promise<void>;
  togglePlayback: () => void;
  stop: () => void;
};

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export function LocalPlaybackProvider({ children }: PropsWithChildren) {
  const player = useVideoPlayer(null, (instance) => {
    instance.timeUpdateEventInterval = 1;
  });
  const [activeVideo, setActiveVideo] = useState<LocalVideo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { currentTime } = useEvent(player, 'timeUpdate', {
    currentTime: player.currentTime,
    bufferedPosition: player.bufferedPosition,
    currentLiveTimestamp: player.currentLiveTimestamp,
    currentOffsetFromLive: player.currentOffsetFromLive,
  });
  const duration = player.duration;

  useEffect(() => {
    if (!activeVideo || duration <= 0 || currentTime <= 0 || (isPlaying && Math.floor(currentTime) % 15 !== 0)) return;
    const video = activeVideo;
    const record: PlaybackRecord = {
      id: video.id,
      title: video.title,
      uri: video.uri,
      position: currentTime,
      duration,
      updatedAt: Date.now(),
    };
    void readStored<PlaybackRecord[]>(storageKeys.history, [])
      .then((history) => writeStored(storageKeys.history, [record, ...history.filter((item) => item.id !== video.id)].slice(0, 50)))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not save playback progress.'));
  }, [activeVideo, currentTime, duration, isPlaying]);

  const play = useCallback(async (video: LocalVideo) => {
    setError(null);
    try {
      await player.replaceAsync({ uri: video.uri, metadata: { title: video.title } });
      const [history, preferences] = await Promise.all([
        readStored<PlaybackRecord[]>(storageKeys.history, []),
        readStored<PlayerPreferences>(storageKeys.preferences, { skipInterval: 15, defaultSpeed: 1, autoResume: true }),
      ]);
      const saved = history.find((record) => record.id === video.id);
      player.playbackRate = preferences.defaultSpeed;
      if (preferences.autoResume && saved && saved.position > 0 && saved.position < saved.duration - 5) {
        player.currentTime = saved.position;
      }
      setActiveVideo(video);
      player.play();
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'This video could not be opened.';
      setError(message);
      throw new Error(message);
    }
  }, [player]);

  const togglePlayback = useCallback(() => {
    if (player.playing) player.pause();
    else player.play();
  }, [player]);

  const stop = useCallback(() => {
    player.pause();
    setActiveVideo(null);
    setError(null);
  }, [player]);

  return (
    <PlaybackContext.Provider value={{ activeVideo, currentTime, duration, error, isPlaying, player, play, togglePlayback, stop }}>
      {children}
    </PlaybackContext.Provider>
  );
}

export function useLocalPlayback() {
  const context = useContext(PlaybackContext);
  if (!context) throw new Error('useLocalPlayback must be used inside LocalPlaybackProvider.');
  return context;
}
