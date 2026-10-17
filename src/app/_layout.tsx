import { DarkTheme, ThemeProvider, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { MiniPlayer } from '@/components/MiniPlayer';
import { LocalPlaybackProvider } from '@/components/LocalPlaybackProvider';
import { theme } from '@/constants/theme';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: theme.background, card: theme.surface, text: theme.text, border: theme.border, primary: theme.aqua } }}>
        <LocalPlaybackProvider>
          <View style={styles.root}>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, contentStyle: styles.content }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="player" options={{ presentation: 'fullScreenModal' }} />
              <Stack.Screen name="youtube-player" options={{ presentation: 'fullScreenModal' }} />
            </Stack>
            <MiniPlayer />
          </View>
        </LocalPlaybackProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.background },
  content: { backgroundColor: theme.background },
});
