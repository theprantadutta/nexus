import React from 'react';
import { Platform, Pressable, StyleSheet, View, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTokens } from '@/constants/theme/tokens';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AnimatedGradientTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const tokens = useTokens();
  const [width, setWidth] = React.useState(0);
  const tabWidth = width > 0 ? width / state.routes.length : 0;

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(tabWidth * state.index, { duration: 250 }) }],
  }), [tabWidth, state.index]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <LinearGradient
        colors={tokens.gradients.tabBar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientBg]}
      />
      <View onLayout={onLayout} style={styles.inner}>
        <Animated.View style={[styles.indicator, { width: tabWidth }, indicatorStyle]} />
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;
          const isCreate = route.name === 'create';

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
            Haptics.selectionAsync().catch(() => {});
          };

          const color = isFocused ? '#FFFFFF' : tokens.colors.textMuted;
          const icon = options.tabBarIcon as ((props: { color: string; size: number; focused: boolean }) => React.ReactNode) | undefined;

          if (isCreate) {
            return (
              <Pressable key={route.key} onPress={onPress} accessibilityRole="button" accessibilityLabel={typeof label === 'string' ? label : route.name} style={styles.fabWrap}>
                <LinearGradient colors={tokens.gradients.brandPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fab}>
                  {icon ? icon({ color: '#FFFFFF', size: 30, focused: isFocused }) : <IconSymbol name={'plus.circle.fill' as any} color={'#FFFFFF'} size={30} />}
                </LinearGradient>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={typeof label === 'string' ? label : route.name}
              onPress={onPress}
              style={styles.tab}
            >
              <View style={styles.iconWrap}>
                {icon ? icon({ color, size: 28, focused: isFocused }) : <IconSymbol name={'chevron.right' as any} color={color} size={24} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: Platform.select({ ios: 64, default: 60 }),
  },
  indicator: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});

