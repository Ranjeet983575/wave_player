export const theme = {
  background: '#090B0A',
  surface: '#141816',
  surfaceRaised: '#1A201D',
  surfaceTint: '#1B1924',
  border: '#282B31',
  purple: '#B890FF',
  purpleDeep: '#8D6BE8',
  aqua: '#72E8DC',
  text: '#F2F4F5',
  secondary: '#A3A9B2',
  muted: '#68717C',
  danger: '#F07E86',
  success: '#72E8DC',
} as const;

export type Theme = typeof theme;
