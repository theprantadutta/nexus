import React, { useEffect } from 'react';
import { View, Text, StatusBar, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

const SplashScreen = () => {
  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(20);

  useEffect(() => {
    // Start animations sequence
    logoScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    logoOpacity.value = withSpring(1, { damping: 15 });

    titleOpacity.value = withDelay(300, withSpring(1));
    titleTranslateY.value = withDelay(300, withSpring(0));

    taglineOpacity.value = withDelay(600, withSpring(1));
    taglineTranslateY.value = withDelay(600, withSpring(0));
  }, [logoOpacity, logoScale, titleOpacity, titleTranslateY, taglineOpacity, taglineTranslateY]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4361EE" />

      {/* Logo */}
      <Animated.View style={[logoAnimatedStyle, styles.logo]}>
        <Text style={styles.logoText}>N</Text>
      </Animated.View>

      {/* App Name */}
      <Animated.View style={titleAnimatedStyle}>
        <Text style={styles.title}>Nexus</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={taglineAnimatedStyle}>
        <Text style={styles.tagline}>Find Your People</Text>
      </Animated.View>

      {/* Loading indicator */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingSpinner} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4361EE',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 96,
    height: 96,
    backgroundColor: 'white',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    color: '#4361EE',
    fontSize: 36,
    fontWeight: 'bold',
  },
  title: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
  },
  loadingSpinner: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: 16,
  },
});

export default SplashScreen;
