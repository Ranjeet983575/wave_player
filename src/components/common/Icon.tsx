import { SymbolView } from 'expo-symbols';
import type { ColorValue } from 'react-native';

const symbols = {
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  videos: { ios: 'play.rectangle.on.rectangle.fill', android: 'video_library', web: 'video_library' },
  folders: { ios: 'folder.fill', android: 'folder', web: 'folder' },
  youtube: { ios: 'play.rectangle.fill', android: 'smart_display', web: 'smart_display' },
  settings: { ios: 'slider.horizontal.3', android: 'tune', web: 'tune' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  add: { ios: 'plus', android: 'add', web: 'add' },
  play: { ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' },
  pause: { ios: 'pause.fill', android: 'pause', web: 'pause' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  back: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  forward: { ios: 'chevron.right', android: 'arrow_forward', web: 'arrow_forward' },
  heart: { ios: 'heart', android: 'favorite_border', web: 'favorite_border' },
  heartFilled: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  more: { ios: 'ellipsis', android: 'more_horiz', web: 'more_horiz' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
  shield: { ios: 'lock.shield', android: 'shield', web: 'shield' },
  info: { ios: 'info.circle', android: 'info', web: 'info' },
  refresh: { ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' },
  fullscreen: { ios: 'arrow.up.left.and.arrow.down.right', android: 'fullscreen', web: 'fullscreen' },
  fullscreenExit: { ios: 'arrow.down.right.and.arrow.up.left', android: 'fullscreen_exit', web: 'fullscreen_exit' },
} as const;

export type IconName = keyof typeof symbols;

type IconProps = {
  name: IconName;
  color: ColorValue | null;
  size?: number;
};

export function Icon({ name, color, size = 20 }: IconProps) {
  return <SymbolView name={symbols[name]} tintColor={color ?? undefined} size={size} />;
}
