import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useLocalPlayback } from '@/components/LocalPlaybackProvider';
import { ActionButton } from '@/components/common/ActionButton';
import { EmptyState } from '@/components/common/EmptyState';
import { Icon } from '@/components/common/Icon';
import { Screen } from '@/components/common/Screen';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { VideoCard } from '@/components/VideoCard';
import { theme } from '@/constants/theme';
import { getDeviceVideos, getImportedVideos, importVideoFile, requestVideoPermission } from '@/services/mediaLibrary';
import { readStored, storageKeys, writeStored } from '@/services/storage';
import type { LocalVideo } from '@/types/media';

export function VideosScreen() {
  const params = useLocalSearchParams<{ albumId?: string; albumTitle?: string }>();
  const { play } = useLocalPlayback();
  const [deviceVideos, setDeviceVideos] = useState<LocalVideo[]>([]);
  const [imports, setImports] = useState<LocalVideo[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    Promise.all([
      getImportedVideos(),
      readStored<string[]>(storageKeys.favorites, []),
    ])
      .then(([savedImports, savedFavorites]) => {
        setImports(savedImports);
        setFavorites(savedFavorites);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not load your saved videos.'));
  }, []);

  const videos = useMemo(() => {
    const combined = [...deviceVideos, ...imports];
    const normalized = query.trim().toLowerCase();
    return normalized ? combined.filter((video) => video.title.toLowerCase().includes(normalized)) : combined;
  }, [deviceVideos, imports, query]);

  const scanDevice = async () => {
    setLoading(true);
    setError(null);
    try {
      const permission = await requestVideoPermission();
      if (!permission.granted) {
        setError('Video access is off. Allow access in system settings, or import a video file instead.');
        return;
      }
      setDeviceVideos(await getDeviceVideos(params.albumId));
      setHasScanned(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not scan videos on this device.');
    } finally {
      setLoading(false);
    }
  };

  const importFile = async () => {
    setError(null);
    try {
      const video = await importVideoFile();
      if (!video) return;
      const nextImports = [video, ...imports.filter((item) => item.uri !== video.uri)];
      await writeStored(storageKeys.imports, nextImports);
      setImports(nextImports);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The selected video could not be imported.');
    }
  };

  const toggleFavorite = async (video: LocalVideo) => {
    const next = favorites.includes(video.id) ? favorites.filter((id) => id !== video.id) : [video.id, ...favorites];
    setFavorites(next);
    try {
      await writeStored(storageKeys.favorites, next);
    } catch (reason) {
      setFavorites(favorites);
      setError(reason instanceof Error ? reason.message : 'Could not save favorites.');
    }
  };

  const openVideo = async (video: LocalVideo) => {
    setError(null);
    try {
      await play(video);
      router.push('/player');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'This video could not be opened.');
    }
  };

  return (
    <Screen>
      <ScreenHeader
        eyebrow={params.albumTitle ? 'Folder' : 'Your library'}
        title={params.albumTitle ?? 'Local videos'}
        subtitle="Browse videos on this device or bring one in from Files." />

      <View style={styles.actions}>
        <View style={styles.actionFlex}><ActionButton icon="refresh" onPress={scanDevice} disabled={loading}>{loading ? 'Scanning…' : 'Scan library'}</ActionButton></View>
        <View style={styles.actionFlex}><ActionButton icon="add" onPress={importFile} secondary>Import file</ActionButton></View>
      </View>

      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

      <View style={styles.searchWrap}>
        <Icon name="search" color={theme.muted} size={17} />
        <TextInput
          accessibilityLabel="Search local videos"
          onChangeText={setQuery}
          placeholder="Search your videos"
          placeholderTextColor={theme.muted}
          returnKeyType="search"
          style={styles.searchInput}
          value={query} />
        {query ? (
          <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')}><Icon name="close" color={theme.secondary} size={17} /></Pressable>
        ) : null}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All videos</Text>
        <Text style={styles.count}>{videos.length}</Text>
      </View>
      {videos.length > 0 ? (
        <View style={styles.grid}>
          {videos.map((video) => (
            <View key={video.id} style={styles.gridItem}>
              <VideoCard
                isFavorite={favorites.includes(video.id)}
                onFavorite={() => void toggleFavorite(video)}
                onPress={() => void openVideo(video)}
                video={video} />
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          icon="videos"
          title={hasScanned || imports.length ? 'No matching videos' : 'Your library starts here'}
          description={hasScanned || imports.length ? 'Try a different search, or import another video.' : 'Scan your device library or import a video file. Wave Player only reads videos you choose to access.'} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 10 },
  actionFlex: { flex: 1 },
  error: { color: theme.danger, fontSize: 13, lineHeight: 19 },
  searchWrap: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 15, borderColor: theme.border, borderWidth: 1, backgroundColor: theme.surface },
  searchInput: { flex: 1, color: theme.text, fontSize: 14, paddingVertical: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  sectionTitle: { color: theme.text, fontSize: 17, fontWeight: '700' },
  count: { color: theme.muted, fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'stretch' },
  gridItem: { width: '48%' },
});
