import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/common/Icon';
import { theme } from '@/constants/theme';

type ActionButtonProps = PropsWithChildren<{
  onPress: () => void;
  icon?: IconName;
  secondary?: boolean;
  disabled?: boolean;
}>;

export function ActionButton({ children, onPress, icon, secondary = false, disabled = false }: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary ? styles.secondary : styles.primary,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}>
      {icon ? (
        <View style={styles.icon}>
          <Icon name={icon} color={secondary ? theme.aqua : theme.background} size={18} />
        </View>
      ) : null}
      <Text style={[styles.label, secondary ? styles.secondaryLabel : null]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  primary: { backgroundColor: theme.aqua },
  secondary: { backgroundColor: theme.surfaceRaised, borderWidth: 1, borderColor: theme.border },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
  icon: { alignItems: 'center', justifyContent: 'center' },
  label: { color: theme.background, fontSize: 14, fontWeight: '700' },
  secondaryLabel: { color: theme.text },
});
