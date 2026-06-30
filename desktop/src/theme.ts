/** Design tokens — mirrors the-watch theme package */

export const colors = {
  bg: '#050505',
  panel: '#0b0b0b',
  line: '#f5f5f5',
  text: '#f5f5f5',
  textMuted: '#8a8a8a',
  positive: '#5ee06c',
  warning: '#ffd24a',
  critical: '#ff5d5d',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  none: 0,
  sm: 2,
  md: 4,
} as const;

export const stateColors = {
  normal: colors.text,
  positive: colors.positive,
  warning: colors.warning,
  critical: colors.critical,
  stale: colors.textMuted,
  offline: colors.critical,
} as const;
