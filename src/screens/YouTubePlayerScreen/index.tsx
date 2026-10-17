import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';

import { Icon } from '@/components/common/Icon';
import { useLocalPlayback } from '@/components/LocalPlaybackProvider';
import { Screen } from '@/components/common/Screen';
import { theme } from '@/constants/theme';

export function YouTubePlayerScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
  const { stop } = useLocalPlayback();
  const [error, setError] = useState<string | null>(null);
  const safeId = typeof id === 'string' ? id : '';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(safeId)}?playsinline=1`;

  useEffect(() => {
    stop();
  }, [stop]);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Close YouTube player and return home" accessibilityRole="button" onPress={() => router.replace('/')} style={styles.close}>
          <Icon name="close" color={theme.text} size={18} />
        </Pressable>
        <View style={styles.titleWrap}>
          <Text style={styles.brand}>Wave Player · YouTube</Text>
          <Text numberOfLines={1} style={styles.title}>{title || 'YouTube video'}</Text>
        </View>
      </View>
      {safeId ? (
        <View style={styles.frame}>
          <WebView
            allowsFullscreenVideo
            domStorageEnabled
            javaScriptEnabled
            onError={() => setError('YouTube could not load this video. Check your connection and try again.')}
            originWhitelist={['https://*']}
            source={{ uri: embedUrl }}
            style={styles.webView} />
        </View>
      ) : (
        <Text accessibilityRole="alert" style={styles.error}>This YouTube video link is incomplete.</Text>
      )}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <View style={styles.notice}>
        <Icon name="info" color={theme.aqua} size={16} />
        <Text style={styles.noticeText}>YouTube playback is provided by the official embedded player. Its ads and playback rules remain in effect.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 },
  close: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: theme.surface },
  titleWrap: { flex: 1, gap: 4 },
  brand: { color: theme.aqua, fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  title: { color: theme.text, fontSize: 13, fontWeight: '600' },
  frame: { width: '100%', aspectRatio: 16 / 9, minHeight: 200, borderRadius: 19, overflow: 'hidden', backgroundColor: '#000', borderWidth: 1, borderColor: theme.border },
  webView: { flex: 1, backgroundColor: '#000' },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 14, borderRadius: 15, backgroundColor: theme.surface },
  noticeText: { color: theme.secondary, fontSize: 11, lineHeight: 17, flex: 1 },
  error: { color: theme.danger, fontSize: 13, lineHeight: 18 },
});
