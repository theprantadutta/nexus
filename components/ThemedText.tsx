import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTokens } from '@/constants/theme/tokens';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption';
};

export function ThemedText({ style, lightColor, darkColor, type = 'default', ...rest }: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const tokens = useTokens();

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles(tokens).default : undefined,
        type === 'title' ? styles(tokens).title : undefined,
        type === 'defaultSemiBold' ? styles(tokens).defaultSemiBold : undefined,
        type === 'subtitle' ? styles(tokens).subtitle : undefined,
        type === 'link' ? styles(tokens).link : undefined,
        type === 'caption' ? styles(tokens).caption : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = (tokens: ReturnType<typeof useTokens>) =>
  StyleSheet.create({
    default: { fontSize: tokens.typography.sizes.md, lineHeight: 24 },
    defaultSemiBold: { fontSize: tokens.typography.sizes.md, lineHeight: 24, fontWeight: '600' },
    title: { fontSize: 32, fontWeight: 'bold', lineHeight: 32 },
    subtitle: { fontSize: 20, fontWeight: 'bold' },
    link: { lineHeight: 30, fontSize: 16, color: tokens.colors.primary },
    caption: { fontSize: tokens.typography.sizes.sm, color: tokens.colors.textMuted },
  });
