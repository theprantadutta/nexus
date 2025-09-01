import { withSpring, withTiming } from 'react-native-reanimated';

export const springs = {
  press: { damping: 15, stiffness: 180 },
  subtle: { damping: 18, stiffness: 120 },
};

export const timings = {
  fast: { duration: 150 },
  normal: { duration: 250 },
  slow: { duration: 400 },
};

export const withPress = (value: number) => withSpring(value, springs.press);
export const fadeIn = () => withTiming(1, timings.normal);
export const fadeOut = () => withTiming(0, timings.normal);

