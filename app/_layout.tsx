import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore } from '../src/store/useAppStore';
import SplashScreen from '../src/screens/SplashScreen';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { isAuthenticated, isLoading, isOnboarding, checkAuth } = useAppStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      await checkAuth();
      setIsInitialized(true);
    };

    initializeApp();
  }, [checkAuth]);

  // Handle navigation after initialization
  useEffect(() => {
    if (isInitialized && loaded) {
      // Add a small delay to ensure smooth transition
      setTimeout(() => {
        if (isAuthenticated) {
          // User is authenticated, go to main app
          router.replace('/(tabs)');
        } else if (isOnboarding) {
          // User needs onboarding
          router.replace('/onboarding');
        } else {
          // User needs to login
          router.replace('/auth/login');
        }
      }, 1500); // Show splash for 1.5 seconds
    }
  }, [isInitialized, loaded, isAuthenticated, isOnboarding, router]);

  if (!loaded || !isInitialized) {
    return <SplashScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
