import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Icon } from '@/components/common/Icon';
import { theme } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.aqua,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        sceneStyle: { backgroundColor: theme.background },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Icon name="home" color={color} size={19} /> }} />
      <Tabs.Screen name="videos" options={{ title: 'Videos', tabBarIcon: ({ color }) => <Icon name="videos" color={color} size={19} /> }} />
      <Tabs.Screen name="folders" options={{ title: 'Folders', tabBarIcon: ({ color }) => <Icon name="folders" color={color} size={19} /> }} />
      <Tabs.Screen name="youtube" options={{ title: 'YouTube', tabBarIcon: ({ color }) => <Icon name="youtube" color={color} size={19} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }) => <Icon name="settings" color={color} size={19} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 66,
    backgroundColor: '#101311',
    borderTopColor: theme.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingBottom: 8,
  },
  label: { fontSize: 10, fontWeight: '600' },
  item: { paddingTop: 1 },
});
