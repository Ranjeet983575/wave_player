import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/common/Icon';
import { theme } from '@/constants/theme';

type EmptyStateProps = {
  icon: IconName;
  title: string;
  description: string;
};

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon name={icon} color={theme.purple} size={26} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    gap: 10,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: theme.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  title: { color: theme.text, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  description: { color: theme.secondary, fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 290 },
});
