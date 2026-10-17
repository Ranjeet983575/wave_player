import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/common/ActionButton';
import { EmptyState } from '@/components/common/EmptyState';
import { Screen } from '@/components/common/Screen';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Icon } from '@/components/common/Icon';
import { useLocalPlayback } from '@/components/LocalPlaybackProvider';
import { theme } from '@/constants/theme';
import { readStored, storageKeys } from '@/services/storage';
import type { PlaybackRecord } from '@/types/media';
import type { LocalVideo } from '@/types/media';

export function HomeScreen() {
  const { play } = useLocalPlayback();
  const [recent, setRecent] = useState<PlaybackRecord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    readStored<PlaybackRecord[]>(storageKeys.history, [])
      .then(setRecent)
      .catch((reason: unknown) => setLoadError(reason instanceof Error ? reason.message : 'Could not load your recent videos.'));
  }, []);

  return (
    <Screen>
      <ScreenHeader showBrand title="Good evening" subtitle="Pick up where you left off, or find something new to watch." />

      <LinearGradient colors={['#211A31', '#171922', '#121716']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} />
        <Text style={styles.heroEyebrow}>A calmer way to watch</Text>
        <Text style={styles.heroTitle}>Your videos.{'\n'}Your experience.</Text>
        <Text style={styles.heroBody}>One home for the videos you love, on your terms.</Text>
        <View style={styles.heroButton}>
          <ActionButton icon="videos" onPress={() => router.push('/videos')}>Browse videos</ActionButton>
        </View>
        <View style={styles.heroMark}>
          <Icon name="play" color={theme.aqua} size={28} />
        </View>
      </LinearGradient>

      <View style={styles.quickActions}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/videos')} style={styles.quickCard}>
          <View style={[styles.quickIcon, styles.aquaIcon]}><Icon name="videos" color={theme.aqua} size={19} /></View>
          <Text style={styles.quickTitle}>Local videos</Text>
          <Text style={styles.quickCopy}>Browse your library</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/youtube')} style={styles.quickCard}>
          <View style={[styles.quickIcon, styles.purpleIcon]}><Icon name="search" color={theme.purple} size={19} /></View>
          <Text style={styles.quickTitle}>Discover</Text>
          <Text style={styles.quickCopy}>Search YouTube</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>Continue watching</Text>
          <Text style={styles.sectionSubtitle}>Your recent playback, kept on this device</Text>
        </View>
        {recent.length > 0 ? (
          <Link href="/videos" asChild>
            <Pressable accessibilityRole="button"><Text style={styles.seeAll}>See all</Text></Pressable>
          </Link>
        ) : null}
      </View>
      {loadError ? (
        <Text accessibilityRole="alert" style={styles.error}>{loadError}</Text>
      ) : recent.length ? (
        recent.slice(0, 3).map((item) => (
          <Pressable key={item.id} onPress={() => {
            const video: LocalVideo = { id: item.id, uri: item.uri, title: item.title, duration: item.duration };
            void play(video)
              .then(() => router.push('/player'))
              .catch((reason: unknown) => setLoadError(reason instanceof Error ? reason.message : 'This video is no longer available.'));
          }} style={styles.recentRow}>
            <View style={styles.recentArt}><Icon name="play" color={theme.aqua} size={18} /></View>
            <View style={styles.recentCopy}>
              <Text numberOfLines={1} style={styles.recentTitle}>{item.title}</Text>
              <Text style={styles.recentMeta}>{Math.round((item.position / Math.max(item.duration, 1)) * 100)}% watched</Text>
            </View>
            <Icon name="forward" color={theme.muted} size={16} />
          </Pressable>
        ))
      ) : (
        <EmptyState icon="clock" title="Nothing in your queue yet" description="Play a local video and it will appear here when you come back." />
      )}

      <View style={styles.footerBrand}>
        <Text style={styles.footerTitle}>Wave Player</Text>
        <Text style={styles.footerCopy}>Made for the way you watch.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 284, borderRadius: 26, padding: 24, justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#484158' },
  heroGlow: { position: 'absolute', width: 210, height: 210, top: -85, right: -35, borderRadius: 110, backgroundColor: '#8D6BE822' },
  heroEyebrow: { color: theme.aqua, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 11 },
  heroTitle: { color: theme.text, fontSize: 32, lineHeight: 38, fontWeight: '700', letterSpacing: -0.8 },
  heroBody: { color: '#BAB9C5', fontSize: 13, lineHeight: 20, maxWidth: 235, marginTop: 10 },
  heroButton: { alignSelf: 'flex-start', marginTop: 20 },
  heroMark: { position: 'absolute', right: 25, bottom: 25, height: 62, width: 62, borderRadius: 21, backgroundColor: '#72E8DC18', borderWidth: 1, borderColor: '#72E8DC44', alignItems: 'center', justifyContent: 'center' },
  quickActions: { flexDirection: 'row', gap: 12 },
  quickCard: { flex: 1, minHeight: 134, borderRadius: 20, padding: 15, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, justifyContent: 'flex-end', gap: 5 },
  quickIcon: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 'auto' },
  aquaIcon: { backgroundColor: '#72E8DC18' },
  purpleIcon: { backgroundColor: '#B890FF1B' },
  quickTitle: { color: theme.text, fontSize: 14, fontWeight: '700' },
  quickCopy: { color: theme.secondary, fontSize: 11 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  sectionTitle: { color: theme.text, fontSize: 17, fontWeight: '700' },
  sectionSubtitle: { color: theme.muted, fontSize: 11, marginTop: 4 },
  seeAll: { color: theme.aqua, fontSize: 12, fontWeight: '700' },
  recentRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, backgroundColor: theme.surface, borderRadius: 17, borderWidth: 1, borderColor: theme.border },
  recentArt: { width: 44, height: 44, borderRadius: 14, backgroundColor: theme.surfaceTint, alignItems: 'center', justifyContent: 'center' },
  recentCopy: { flex: 1, gap: 4 },
  recentTitle: { color: theme.text, fontSize: 13, fontWeight: '600' },
  recentMeta: { color: theme.muted, fontSize: 11 },
  error: { color: theme.danger, fontSize: 13, lineHeight: 19 },
  footerBrand: { alignItems: 'center', paddingTop: 4, paddingBottom: 5, gap: 4 },
  footerTitle: { color: theme.muted, fontSize: 12, fontWeight: '700', letterSpacing: 0.6 },
  footerCopy: { color: '#51585F', fontSize: 10 },
});
