// Theme tokens for light and dark modes with semantic colors and scales
import { useColorScheme } from '@/hooks/useColorScheme';
import type { ColorValue } from 'react-native';

type GradientStops = readonly [ColorValue, ColorValue, ...ColorValue[]];

export type ColorTokens = {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryAlt: string;
  success: string;
  danger: string;
  warning: string;
  border: string;
  tabBar: { bg: string; tint: string; inactive: string };
};

export type TypographyTokens = {
  sizes: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number };
  weights: { regular: '400' | '500' | '600' | '700'; medium: '500'; semibold: '600'; bold: '700' };
};

export type RadiusTokens = { xs: number; sm: number; md: number; lg: number; xl: number };
export type SpacingTokens = { xxs: number; xs: number; sm: number; md: number; lg: number; xl: number };

export type ShadowTokens = {
  card: { shadowColor: string; shadowOffset: { width: number; height: number }; shadowOpacity: number; shadowRadius: number; elevation: number };
};

export type GradientTokens = {
  brandPrimary: GradientStops;
  brandSecondary: GradientStops;
  surface: GradientStops;
  tabBar: GradientStops;
};

export type ThemeTokens = {
  mode: 'light' | 'dark';
  colors: ColorTokens;
  typography: TypographyTokens;
  radius: RadiusTokens;
  spacing: SpacingTokens;
  shadows: ShadowTokens;
  gradients: GradientTokens;
};

const light: ThemeTokens = {
  mode: 'light',
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#F9FAFB',
    text: '#111827',
    textMuted: '#6B7280',
    primary: '#4361EE',
    primaryAlt: '#4CC9F0',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    border: '#E5E7EB',
    tabBar: { bg: '#FFFFFF', tint: '#4361EE', inactive: '#9CA3AF' },
  },
  typography: {
    sizes: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24 },
    weights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
  },
  radius: { xs: 6, sm: 8, md: 12, lg: 16, xl: 24 },
  spacing: { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24 },
  shadows: {
    card: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  },
  gradients: {
    brandPrimary: ['#4361EE', '#4CC9F0'],
    brandSecondary: ['#F72585', '#B5179E'],
    surface: ['#FFFFFF', '#F4F7FF'],
    tabBar: ['#FFFFFF', '#F5F7FB'],
  },
};

const dark: ThemeTokens = {
  mode: 'dark',
  colors: {
    background: '#0B0F17',
    surface: '#111827',
    surfaceAlt: '#0F172A',
    text: '#ECEDEE',
    textMuted: '#9BA1A6',
    primary: '#8AB4FF',
    primaryAlt: '#64D3FF',
    success: '#34D399',
    danger: '#F87171',
    warning: '#FBBF24',
    border: '#1F2937',
    tabBar: { bg: '#0F1420', tint: '#8AB4FF', inactive: '#7C8187' },
  },
  typography: {
    sizes: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24 },
    weights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
  },
  radius: { xs: 6, sm: 8, md: 12, lg: 16, xl: 24 },
  spacing: { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24 },
  shadows: {
    card: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 },
  },
  gradients: {
    brandPrimary: ['#1B2A4A', '#30416A'],
    brandSecondary: ['#532B4A', '#2D1F3A'],
    surface: ['#0F1420', '#0B0F17'],
    tabBar: ['#0F1420', '#0B0F17'],
  },
};

export function getTokens(mode: 'light' | 'dark'): ThemeTokens {
  return mode === 'dark' ? dark : light;
}

export function useTokens(): ThemeTokens {
  const scheme = useColorScheme() ?? 'light';
  return getTokens(scheme);
}

