import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import { Screen } from '@/components/common/Screen';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { theme } from '@/constants/theme';
import { readStored, storageKeys, writeStored } from '@/services/storage';
import type { PlayerPreferences } from '@/types/media';

const defaultPreferences: PlayerPreferences = { skipInterval: 15, defaultSpeed: 1, autoResume: true };
const skipOptions: PlayerPreferences['skipInterval'][] = [10, 15, 30];

export function SettingsScreen() {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  useEffect(() => {
    readStored<PlayerPreferences>(storageKeys.preferences, defaultPreferences)
      .then((value) => setPreferences({ ...defaultPreferences, ...value }))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not load settings.'));
  }, []);

  const updatePreference = async <K extends keyof PlayerPreferences>(key: K, value: PlayerPreferences[K]) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    setSaved(false);
    try {
      await writeStored(storageKeys.preferences, next);
      setSaved(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save this preference.');
    }
  };

  const clearLocalHistory = () => {
    Alert.alert('Clear playback history?', 'This only removes recent video and resume-position data stored on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear history',
        style: 'destructive',
        onPress: () => {
          void writeStored(storageKeys.history, [])
            .then(() => setSaved(true))
            .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not clear playback history.'));
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScreenHeader eyebrow="Personalize" title="Settings" subtitle="Make Wave Player feel right for the way you watch." />

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Playback</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingCopy}>
            <Text style={styles.label}>Skip interval</Text>
            <Text style={styles.detail}>Seconds to jump backward or forward</Text>
          </View>
          <View style={styles.picker}>
            {skipOptions.map((option) => (
              <Pressable key={option} accessibilityRole="button" onPress={() => void updatePreference('skipInterval', option)} style={[styles.pickerOption, preferences.skipInterval === option ? styles.selected : null]}>
                <Text style={[styles.pickerText, preferences.skipInterval === option ? styles.selectedText : null]}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingCopy}>
            <Text style={styles.label}>Default speed</Text>
            <Text style={styles.detail}>Starting playback rate for local videos</Text>
          </View>
          <View style={styles.picker}>
            {([1, 1.25, 1.5, 2] as const).map((speed) => (
              <Pressable key={speed} accessibilityRole="button" onPress={() => void updatePreference('defaultSpeed', speed)} style={[styles.pickerOption, preferences.defaultSpeed === speed ? styles.selected : null]}>
                <Text style={[styles.speedText, preferences.defaultSpeed === speed ? styles.selectedText : null]}>{speed}×</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingCopy}>
            <Text style={styles.label}>Resume playback</Text>
            <Text style={styles.detail}>Offer to continue from your last position</Text>
          </View>
          <Switch
            accessibilityLabel="Resume playback"
            onValueChange={(value) => void updatePreference('autoResume', value)}
            thumbColor={preferences.autoResume ? theme.aqua : theme.secondary}
            trackColor={{ false: theme.border, true: '#72E8DC55' }}
            value={preferences.autoResume} />
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Appearance</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}><Icon name="settings" color={theme.purple} size={17} /></View>
          <View style={styles.settingCopy}>
            <Text style={styles.label}>Dark</Text>
            <Text style={styles.detail}>The Wave Player visual identity</Text>
          </View>
          <Text style={styles.fixed}>DEFAULT</Text>
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Privacy & support</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}><Icon name="shield" color={theme.aqua} size={17} /></View>
          <View style={styles.settingCopy}>
            <Text style={styles.label}>Your videos stay on your device</Text>
            <Text style={styles.detail}>Local media is not uploaded. YouTube search sends your query to Google when configured.</Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" onPress={clearLocalHistory} style={styles.infoRow}>
          <View style={styles.infoIcon}><Icon name="clock" color={theme.purple} size={17} /></View>
          <View style={styles.settingCopy}>
            <Text style={styles.label}>Clear playback history</Text>
            <Text style={styles.detail}>Remove recent videos and saved positions</Text>
          </View>
          <Icon name="forward" color={theme.muted} size={16} />
        </Pressable>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}><Icon name="info" color={theme.secondary} size={17} /></View>
          <View style={styles.settingCopy}>
            <Text style={styles.label}>Privacy policy</Text>
            <Text style={styles.detail}>A public privacy policy URL must be added before release.</Text>
          </View>
          <Text style={styles.fixed}>SETUP</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.brand}>Wave Player</Text>
        <Text style={styles.version}>Version {version}</Text>
        {saved ? <Text style={styles.saved}>Settings saved on this device</Text> : null}
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: 11 },
  groupTitle: { color: theme.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase' },
  settingRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 14, borderRadius: 16, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  settingCopy: { flex: 1, gap: 5 },
  label: { color: theme.text, fontSize: 13, fontWeight: '600' },
  detail: { color: theme.muted, fontSize: 11, lineHeight: 16 },
  picker: { flexDirection: 'row', borderRadius: 12, backgroundColor: theme.background, padding: 3 },
  pickerOption: { minWidth: 33, minHeight: 33, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
  selected: { backgroundColor: theme.surfaceTint, borderWidth: 1, borderColor: '#625176' },
  pickerText: { color: theme.secondary, fontSize: 11, fontWeight: '700' },
  speedText: { color: theme.secondary, fontSize: 9, fontWeight: '700' },
  selectedText: { color: theme.aqua },
  infoRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 16, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  infoIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: theme.surfaceRaised },
  fixed: { color: theme.muted, fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  footer: { alignItems: 'center', gap: 5, paddingTop: 5 },
  brand: { color: theme.text, fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },
  version: { color: theme.muted, fontSize: 11 },
  saved: { color: theme.aqua, fontSize: 10, marginTop: 3 },
  error: { color: theme.danger, fontSize: 12, textAlign: 'center' },
});
