import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTokens } from '@/constants/theme/tokens';

export type GradientButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function GradientButton({ title, onPress, disabled, style, textStyle }: GradientButtonProps) {
  const tokens = useTokens();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.97); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      accessibilityHint={disabled ? 'Button is disabled' : 'Tap to activate'}
      style={({ pressed }) => [
        styles.base,
        { opacity: disabled ? 0.6 : 1, minHeight: 44, minWidth: 44 },
        pressed && { opacity: 0.95 },
        style,
      ]}
    >
      <Animated.View style={[styles.inner, animatedStyle]}>
        <LinearGradient colors={tokens.gradients.brandPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientBg}>
          <Text style={[styles.text, { color: 'white' }, textStyle]}>{title}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 12 },
  inner: { borderRadius: 12, overflow: 'hidden' },
  gradientBg: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 16, fontWeight: '600' },
});

