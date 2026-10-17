import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/common/ActionButton';
import { EmptyState } from '@/components/common/EmptyState';
import { Icon } from '@/components/common/Icon';
import { Screen } from '@/components/common/Screen';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { theme } from '@/constants/theme';
import { getDeviceVideos, getVideoAlbums, requestVideoPermission } from '@/services/mediaLibrary';

type VideoFolder = { id: string; title: string; count: number };

export function FoldersScreen() {
  const [folders, setFolders] = useState<VideoFolder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadFolders = async () => {
    setLoading(true);
    setError(null);
    try {
      const permission = await requestVideoPermission();
      if (!permission.granted) {
        setError('Allow video access to browse device folders, or import a file from the Videos tab.');
        return;
      }
      const [albums, videos] = await Promise.all([getVideoAlbums(), getDeviceVideos()]);
      const counts = new Map<string, number>();
      videos.forEach((video) => {
        if (video.albumId) counts.set(video.albumId, (counts.get(video.albumId) ?? 0) + 1);
      });
      setFolders(albums.flatMap((album) => {
        const count = counts.get(album.id) ?? 0;
        return count > 0 ? [{ id: album.id, title: album.title, count }] : [];
      }));
      setHasLoaded(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load video folders.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader eyebrow="Organize" title="Folders" subtitle="Browse videos grouped by the albums on your device." />
      <ActionButton icon="refresh" onPress={loadFolders} disabled={loading}>{loading ? 'Loading folders…' : 'Load folders'}</ActionButton>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {folders.length ? (
        <View style={styles.list}>
          {folders.map((folder) => (
            <Pressable
              accessibilityRole="button"
              key={folder.id}
              onPress={() => router.push({ pathname: '/videos', params: { albumId: folder.id, albumTitle: folder.title } })}
              style={styles.row}>
              <View style={styles.folderIcon}><Icon name="folders" color={theme.purple} size={20} /></View>
              <View style={styles.copy}>
                <Text numberOfLines={1} style={styles.title}>{folder.title}</Text>
                <Text style={styles.meta}>{folder.count} {folder.count === 1 ? 'video' : 'videos'}</Text>
              </View>
              <Icon name="forward" color={theme.muted} size={17} />
            </Pressable>
          ))}
        </View>
      ) : (
        <EmptyState
          icon="folders"
          title={hasLoaded ? 'No video folders found' : 'Find your collections'}
          description={hasLoaded ? 'Your device does not currently have any albums containing videos.' : 'Load folders to see your device albums that contain videos.'} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 13, padding: 12, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 17 },
  folderIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.surfaceTint },
  copy: { flex: 1, gap: 4 },
  title: { color: theme.text, fontWeight: '700', fontSize: 14 },
  meta: { color: theme.secondary, fontSize: 11 },
  error: { color: theme.danger, fontSize: 13, lineHeight: 19 },
});
