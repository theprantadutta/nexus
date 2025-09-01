import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  surface?: boolean;
};

export function ThemedView({ style, lightColor, darkColor, surface = false, ...otherProps }: ThemedViewProps) {
  const bgKey = surface ? 'surface' : 'background';
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, bgKey as any);
  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
