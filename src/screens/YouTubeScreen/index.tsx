import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ActionButton } from '@/components/common/ActionButton';
import { EmptyState } from '@/components/common/EmptyState';
import { Icon } from '@/components/common/Icon';
import { Screen } from '@/components/common/Screen';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { theme } from '@/constants/theme';
import { getYouTubeApiKey, searchYouTube } from '@/services/youtube';
import { readStored, storageKeys, writeStored } from '@/services/storage';
import type { YouTubeVideo } from '@/types/media';

export function YouTubeScreen() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [searches, setSearches] = useState<string[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = Boolean(getYouTubeApiKey());

  useEffect(() => {
    readStored<string[]>(storageKeys.searches, [])
      .then(setSearches)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not load recent searches.'));
  }, []);

  const runSearch = async (searchText = query, pageToken?: string) => {
    const value = searchText.trim();
    if (!value || !configured) return;

    setLoading(true);
    setError(null);
    if (!pageToken) {
      setVideos([]);
      setNextPageToken(undefined);
      setHasSearched(false);
    }
    setQuery(value);
    try {
      const page = await searchYouTube(value, pageToken);
      setVideos((current) => pageToken ? [...current, ...page.videos] : page.videos);
      setNextPageToken(page.nextPageToken);
      setHasSearched(true);
      if (!pageToken) {
        const nextSearches = [value, ...searches.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 8);
        setSearches(nextSearches);
        await writeStored(storageKeys.searches, nextSearches);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'YouTube search could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const clearSearches = async () => {
    setSearches([]);
    try {
      await writeStored(storageKeys.searches, []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not clear recent searches.');
    }
  };

  return (
    <Screen>
      <ScreenHeader eyebrow="Discover" title="YouTube" subtitle="Find videos and watch with YouTube's official embedded player." />

      <View style={styles.searchRow}>
        <View style={styles.inputWrap}>
          <Icon name="search" color={theme.muted} size={18} />
          <TextInput
            accessibilityLabel="Search YouTube"
            editable={configured}
            onChangeText={setQuery}
            onSubmitEditing={() => void runSearch()}
            placeholder="Search videos"
            placeholderTextColor={theme.muted}
            returnKeyType="search"
            style={styles.input}
            value={query} />
        </View>
        <Pressable
          accessibilityLabel="Search YouTube"
          accessibilityRole="button"
          disabled={!configured || !query.trim() || loading}
          onPress={() => void runSearch()}
          style={({ pressed }) => [styles.searchButton, pressed ? styles.pressed : null, (!configured || !query.trim() || loading) ? styles.disabled : null]}>
          <Icon name="search" color={theme.background} size={19} />
        </Pressable>
      </View>

      {!configured ? (
        <View style={styles.setupCard}>
          <View style={styles.setupIcon}><Icon name="info" color={theme.purple} size={19} /></View>
          <Text style={styles.setupTitle}>Search needs your API key</Text>
          <Text style={styles.setupCopy}>Add EXPO_PUBLIC_YOUTUBE_API_KEY to your .env file. See the setup steps in the README. The rest of Wave Player works without it.</Text>
        </View>
      ) : null}

      <Text style={styles.policyNote}>Playback stays inside the official YouTube player. Ads, restrictions, and YouTube policies are respected.</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.loading}><Text style={styles.loadingText}>Looking for videos…</Text></View>
      ) : videos.length ? (
        <View style={styles.results}>
          <Text style={styles.sectionTitle}>Search results</Text>
          {videos.map((video) => (
            <Pressable
              accessibilityRole="button"
              key={video.id}
              onPress={() => router.push({ pathname: '/youtube-player', params: { id: video.id, title: video.title } })}
              style={styles.result}>
              {video.thumbnailUrl ? <Image source={{ uri: video.thumbnailUrl }} style={styles.thumbnail} /> : <View style={styles.thumbnailFallback}><Icon name="youtube" color={theme.aqua} size={24} /></View>}
              <View style={styles.resultCopy}>
                <Text numberOfLines={2} style={styles.resultTitle}>{video.title}</Text>
                <Text numberOfLines={1} style={styles.channel}>{video.channelTitle}</Text>
              </View>
              <View style={styles.playIcon}><Icon name="play" color={theme.background} size={15} /></View>
            </Pressable>
          ))}
        </View>
      ) : hasSearched ? (
        <EmptyState icon="youtube" title="No videos found" description="Try a broader search or different keywords." />
      ) : searches.length ? (
        <View style={styles.history}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Recent searches</Text>
            <Pressable accessibilityRole="button" onPress={() => void clearSearches()}><Text style={styles.clear}>Clear</Text></Pressable>
          </View>
          {searches.map((item) => (
            <Pressable key={item} onPress={() => void runSearch(item)} style={styles.historyItem}>
              <Icon name="clock" color={theme.muted} size={16} />
              <Text numberOfLines={1} style={styles.historyText}>{item}</Text>
              <Icon name="forward" color={theme.muted} size={15} />
            </Pressable>
          ))}
        </View>
      ) : configured ? (
        <EmptyState icon="youtube" title="Search to get started" description="Try an artist, a topic, or a specific video title." />
      ) : (
        <EmptyState icon="youtube" title="Your next watch is out there" description="Configure YouTube search when you're ready. Local videos are available now." />
      )}
      {nextPageToken && !loading ? <ActionButton secondary onPress={() => void runSearch(query, nextPageToken)}>Load more results</ActionButton> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', gap: 9 },
  inputWrap: { flex: 1, minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface },
  input: { flex: 1, color: theme.text, fontSize: 14, paddingVertical: 12 },
  searchButton: { width: 50, borderRadius: 16, backgroundColor: theme.aqua, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.4 },
  setupCard: { padding: 17, borderRadius: 18, backgroundColor: theme.surfaceTint, borderWidth: 1, borderColor: '#484158', gap: 8 },
  setupIcon: { width: 33, height: 33, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#B890FF18' },
  setupTitle: { color: theme.text, fontWeight: '700', fontSize: 14 },
  setupCopy: { color: theme.secondary, fontSize: 12, lineHeight: 18 },
  policyNote: { color: theme.muted, fontSize: 11, lineHeight: 17 },
  error: { color: theme.danger, fontSize: 13, lineHeight: 19 },
  loading: { padding: 28, alignItems: 'center', backgroundColor: theme.surface, borderRadius: 18 },
  loadingText: { color: theme.secondary, fontSize: 13 },
  results: { gap: 12 },
  sectionTitle: { color: theme.text, fontSize: 16, fontWeight: '700' },
  result: { minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 9, borderRadius: 16, backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 },
  thumbnail: { width: 112, height: 66, borderRadius: 11, backgroundColor: theme.surfaceRaised },
  thumbnailFallback: { width: 112, height: 66, borderRadius: 11, backgroundColor: theme.surfaceTint, alignItems: 'center', justifyContent: 'center' },
  resultCopy: { flex: 1, gap: 6 },
  resultTitle: { color: theme.text, fontSize: 12, lineHeight: 17, fontWeight: '600' },
  channel: { color: theme.muted, fontSize: 10 },
  playIcon: { width: 31, height: 31, borderRadius: 16, backgroundColor: theme.aqua, alignItems: 'center', justifyContent: 'center', paddingLeft: 1 },
  history: { gap: 12 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clear: { color: theme.aqua, fontSize: 12, fontWeight: '700' },
  historyItem: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
  historyText: { color: theme.secondary, fontSize: 13, flex: 1 },
});
