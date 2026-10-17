import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import { useLocalPlayback } from '@/components/LocalPlaybackProvider';
import { theme } from '@/constants/theme';

export function MiniPlayer() {
  const pathname = usePathname();
  const { activeVideo, isPlaying, togglePlayback, stop } = useLocalPlayback();
  const isFullPlayer = pathname === '/player';

  if (!activeVideo || isFullPlayer) return null;

  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" onPress={() => router.push('/player')} style={styles.open}>
        <View style={styles.art}>
          <Icon name="play" color={theme.aqua} size={18} />
        </View>
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.title}>{activeVideo.title}</Text>
          <Text style={styles.subtitle}>Wave Player · Now playing</Text>
        </View>
      </Pressable>
      <Pressable accessibilityLabel={isPlaying ? 'Pause video' : 'Play video'} onPress={togglePlayback} style={styles.control}>
        <Icon name={isPlaying ? 'pause' : 'play'} color={theme.text} size={19} />
      </Pressable>
      <Pressable accessibilityLabel="Dismiss mini player" onPress={stop} style={styles.control}>
        <Icon name="close" color={theme.secondary} size={17} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 74,
    left: 14,
    right: 14,
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1D1D',
    borderWidth: 1,
    borderColor: '#373440',
    borderRadius: 18,
    paddingHorizontal: 9,
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  open: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 5 },
  art: { height: 42, width: 42, borderRadius: 13, backgroundColor: theme.surfaceTint, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 4 },
  title: { color: theme.text, fontSize: 12, fontWeight: '700' },
  subtitle: { color: theme.muted, fontSize: 10 },
  control: { width: 40, height: 46, alignItems: 'center', justifyContent: 'center' },
});
