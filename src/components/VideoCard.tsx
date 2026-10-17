import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import { theme } from '@/constants/theme';
import type { LocalVideo } from '@/types/media';

type VideoCardProps = {
  video: LocalVideo;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  compact?: boolean;
};

export function VideoCard({ video, onPress, onFavorite, isFavorite = false, compact = false }: VideoCardProps) {
  const duration = video.duration > 0 ? `${Math.floor(video.duration / 60)}:${String(Math.floor(video.duration % 60)).padStart(2, '0')}` : 'VIDEO';

  return (
    <View style={[styles.card, compact ? styles.compactCard : null]}>
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.main}>
        <View style={styles.artwork}>
          <View style={styles.artHalo} />
          <View style={styles.play}>
            <Icon name="play" color={theme.background} size={18} />
          </View>
          <Text style={styles.duration}>{duration}</Text>
        </View>
        <View style={styles.copy}>
          <Text numberOfLines={2} style={styles.title}>{video.title}</Text>
          <Text style={styles.meta}>
            {video.width && video.height ? `${video.width} × ${video.height}` : video.isImported ? 'Imported video' : 'On this device'}
          </Text>
        </View>
      </Pressable>
      {onFavorite ? (
        <Pressable
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onFavorite}
          style={styles.favorite}>
          <Icon name={isFavorite ? 'heartFilled' : 'heart'} color={isFavorite ? theme.purple : theme.secondary} size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    flex: 1,
    minWidth: 145,
    maxWidth: 240,
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  compactCard: { flexDirection: 'row', minWidth: '100%', maxWidth: '100%', minHeight: 84 },
  main: { flex: 1 },
  artwork: {
    height: 112,
    backgroundColor: theme.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  artHalo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#7D55C622',
    transform: [{ translateX: -28 }, { translateY: 28 }],
  },
  play: {
    height: 42,
    width: 42,
    borderRadius: 21,
    backgroundColor: theme.aqua,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
  duration: {
    position: 'absolute',
    bottom: 9,
    right: 9,
    color: theme.text,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.9,
    backgroundColor: '#090B0ACC',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
  },
  copy: { padding: 12, gap: 5 },
  title: { color: theme.text, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  meta: { color: theme.muted, fontSize: 11 },
  favorite: { position: 'absolute', top: 9, right: 9, padding: 6, backgroundColor: '#090B0A88', borderRadius: 14 },
});
