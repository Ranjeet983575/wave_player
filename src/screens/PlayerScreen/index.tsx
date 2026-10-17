import { router } from 'expo-router';
import { useEvent } from 'expo';
import { VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLocalPlayback } from '@/components/LocalPlaybackProvider';
import { ActionButton } from '@/components/common/ActionButton';
import { EmptyState } from '@/components/common/EmptyState';
import { Icon } from '@/components/common/Icon';
import { Screen } from '@/components/common/Screen';
import { theme } from '@/constants/theme';
import { readStored, storageKeys } from '@/services/storage';
import type { PlayerPreferences } from '@/types/media';

const speeds: PlayerPreferences['defaultSpeed'][] = [0.5, 0.75, 1, 1.25, 1.5, 2];
const defaultPreferences: PlayerPreferences = { skipInterval: 15, defaultSpeed: 1, autoResume: true };

export function PlayerScreen() {
  const viewRef = useRef<VideoView>(null);
  const { activeVideo, currentTime, duration, error, isPlaying, player, togglePlayback } = useLocalPlayback();
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [seekWidth, setSeekWidth] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenBusy, setFullscreenBusy] = useState(false);
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  useEffect(() => {
    readStored<PlayerPreferences>(storageKeys.preferences, defaultPreferences)
      .then((value) => {
        const merged = { ...defaultPreferences, ...value };
        setPreferences(merged);
        player.playbackRate = merged.defaultSpeed;
      })
      .catch((reason: unknown) => setScreenError(reason instanceof Error ? reason.message : 'Could not load playback settings.'));
  }, [player]);

  const skip = (seconds: number) => player.seekBy(seconds);
  const toggleFullscreen = async () => {
    setFullscreenBusy(true);
    try {
      if (isFullscreen) {
        await viewRef.current?.exitFullscreen();
      } else {
        await viewRef.current?.enterFullscreen();
      }
    } catch (reason) {
      setScreenError(reason instanceof Error ? reason.message : 'Fullscreen mode could not be opened.');
    } finally {
      setFullscreenBusy(false);
    }
  };

  if (!activeVideo) {
    return (
      <Screen>
        <EmptyState icon="videos" title="No video is open" description="Choose a local video from your library to start watching." />
        <ActionButton onPress={() => router.replace('/videos')}>Browse videos</ActionButton>
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="Close player and return home"
          accessibilityRole="button"
          onPress={() => router.replace('/')}
          hitSlop={12}
          style={styles.close}>
          <Icon name="close" color={theme.text} size={19} />
        </Pressable>
        <View style={styles.topCopy}>
          <Text numberOfLines={1} style={styles.videoTitle}>{activeVideo.title}</Text>
          <Text style={styles.brand}>Wave Player</Text>
        </View>
      </View>

      {error || screenError ? <Text accessibilityRole="alert" style={styles.error}>{error ?? screenError}</Text> : null}
      <View style={styles.videoFrame}>
        <VideoView
          allowsPictureInPicture
          contentFit="contain"
          fullscreenOptions={{ enable: true, orientation: 'landscape' }}
          nativeControls={false}
          onFullscreenEnter={() => setIsFullscreen(true)}
          onFullscreenExit={() => setIsFullscreen(false)}
          player={player}
          ref={viewRef}
          style={styles.video} />
        {status === 'loading' || status === 'idle' ? (
          <View pointerEvents="none" style={styles.loadingOverlay}><Text style={styles.loadingText}>Preparing video…</Text></View>
        ) : null}
      </View>
      <View style={styles.videoActions}>
        <Pressable
          accessibilityLabel={isFullscreen ? 'Exit fullscreen' : 'Play video in fullscreen'}
          accessibilityRole="button"
          hitSlop={12}
          disabled={fullscreenBusy}
          onPress={() => void toggleFullscreen()}
          style={({ pressed }) => [styles.fullscreen, pressed ? styles.pressed : null, fullscreenBusy ? styles.disabled : null]}>
          <Icon name={isFullscreen ? 'fullscreenExit' : 'fullscreen'} color={theme.aqua} size={19} />
          <Text style={styles.fullscreenLabel}>{isFullscreen ? 'Exit fullscreen' : 'Full screen'}</Text>
        </Pressable>
      </View>

      <View style={styles.playbackMeta}>
        <View style={styles.metaHead}>
          <Text style={styles.nowPlaying}>NOW PLAYING</Text>
          <Text style={styles.speed}>{player.playbackRate}×</Text>
        </View>
        <Text style={styles.currentTitle} numberOfLines={2}>{activeVideo.title}</Text>
        <Pressable
          accessibilityLabel="Seek through video"
          accessibilityRole="adjustable"
          onLayout={(event) => setSeekWidth(event.nativeEvent.layout.width)}
          onPress={(event) => {
            if (seekWidth > 0) player.currentTime = duration * Math.max(0, Math.min(event.nativeEvent.locationX / seekWidth, 1));
          }}
          style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          <View style={[styles.thumb, { left: `${progress * 100}%` }]} />
        </Pressable>
        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatTime(currentTime)}</Text>
          <Text style={styles.time}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable accessibilityLabel={`Back ${preferences.skipInterval} seconds`} onPress={() => skip(-preferences.skipInterval)} style={styles.skipButton}>
          <Icon name="back" color={theme.text} size={22} />
          <Text style={styles.skipText}>{preferences.skipInterval}s</Text>
        </Pressable>
        <Pressable accessibilityLabel={isPlaying ? 'Pause' : 'Play'} onPress={togglePlayback} style={styles.playButton}>
          <Icon name={isPlaying ? 'pause' : 'play'} color={theme.background} size={24} />
        </Pressable>
        <Pressable accessibilityLabel={`Forward ${preferences.skipInterval} seconds`} onPress={() => skip(preferences.skipInterval)} style={styles.skipButton}>
          <Icon name="forward" color={theme.text} size={22} />
          <Text style={styles.skipText}>{preferences.skipInterval}s</Text>
        </Pressable>
      </View>

      <View style={styles.speedRow}>
        <Text style={styles.speedLabel}>Speed</Text>
        {speeds.map((speed) => (
          <Pressable key={speed} accessibilityRole="button" onPress={() => { player.playbackRate = speed; }} style={[styles.speedOption, player.playbackRate === speed ? styles.speedSelected : null]}>
            <Text style={[styles.speedOptionText, player.playbackRate === speed ? styles.speedSelectedText : null]}>{speed}×</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.pipNote}>Picture-in-Picture is available where supported by your device.</Text>
    </Screen>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, zIndex: 2 },
  close: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  topCopy: { flex: 1, gap: 3 },
  videoTitle: { color: theme.text, fontSize: 13, fontWeight: '700' },
  brand: { color: theme.muted, fontSize: 10 },
  fullscreen: { minWidth: 136, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14, borderRadius: 15, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  fullscreenLabel: { color: theme.aqua, fontSize: 12, fontWeight: '700' },
  videoActions: { flexDirection: 'row', justifyContent: 'flex-end', zIndex: 2 },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.55 },
  error: { color: theme.danger, fontSize: 12, lineHeight: 18 },
  videoFrame: { width: '100%', aspectRatio: 16 / 10, maxHeight: 360, borderRadius: 20, overflow: 'hidden', backgroundColor: '#030404', borderWidth: 1, borderColor: theme.border },
  video: { flex: 1 },
  loadingOverlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: '#03040455' },
  loadingText: { color: theme.secondary, fontSize: 12 },
  playbackMeta: { gap: 9 },
  metaHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nowPlaying: { color: theme.aqua, fontSize: 9, fontWeight: '700', letterSpacing: 1.3 },
  speed: { color: theme.purple, fontSize: 11, fontWeight: '700' },
  currentTitle: { color: theme.text, fontSize: 18, lineHeight: 24, fontWeight: '700' },
  progressTrack: { height: 22, justifyContent: 'center', marginTop: 3 },
  progressFill: { height: 4, backgroundColor: theme.aqua, borderRadius: 4 },
  thumb: { position: 'absolute', marginLeft: -6, width: 12, height: 12, borderRadius: 6, backgroundColor: theme.text, top: 5 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { color: theme.muted, fontSize: 10, fontVariant: ['tabular-nums'] },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 29, paddingVertical: 5 },
  skipButton: { minWidth: 56, alignItems: 'center', gap: 2 },
  skipText: { color: theme.secondary, fontSize: 9 },
  playButton: { width: 66, height: 66, borderRadius: 33, backgroundColor: theme.aqua, alignItems: 'center', justifyContent: 'center', paddingLeft: 2 },
  speedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5 },
  speedLabel: { color: theme.muted, fontSize: 10, marginRight: 'auto' },
  speedOption: { minWidth: 36, height: 31, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: theme.surface },
  speedSelected: { backgroundColor: theme.surfaceTint, borderColor: '#625176', borderWidth: 1 },
  speedOptionText: { color: theme.secondary, fontSize: 10, fontWeight: '600' },
  speedSelectedText: { color: theme.purple },
  pipNote: { color: theme.muted, fontSize: 10, textAlign: 'center' },
});
