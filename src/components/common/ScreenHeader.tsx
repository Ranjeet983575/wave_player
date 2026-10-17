import { Image, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

const logo = require('../../../assets/images/icon.png');

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  showBrand?: boolean;
};

export function ScreenHeader({ eyebrow, title, subtitle, showBrand = true }: ScreenHeaderProps) {
  return (
    <View style={styles.wrapper}>
      {showBrand ? (
        <View style={styles.brandRow}>
          <Image source={logo} style={styles.logo} />
          <View>
            <Text style={styles.brand}>Wave Player</Text>
            <Text style={styles.brandTagline}>Your videos. Your experience.</Text>
          </View>
        </View>
      ) : null}
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 7 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  logo: { width: 40, height: 40, borderRadius: 12 },
  brand: { color: theme.text, fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  brandTagline: { color: theme.muted, fontSize: 11, marginTop: 2 },
  eyebrow: { color: theme.aqua, fontSize: 11, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase' },
  title: { color: theme.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.8 },
  subtitle: { color: theme.secondary, fontSize: 14, lineHeight: 21, maxWidth: 360 },
});
