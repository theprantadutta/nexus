import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { isValidEmail } from '../../utils';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn } = useAppStore();
  
  // Animation values
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(30);
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    // Animate form entrance
    formOpacity.value = withTiming(1, { duration: 600 });
    formTranslateY.value = withSpring(0, { damping: 15 });
  }, [formOpacity, formTranslateY]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    buttonScale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );

    try {
      const success = await signIn(email.trim(), password);
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        <View className="flex-1 justify-center px-8 py-12">
          {/* Header */}
          <View className="items-center mb-12">
            <View className="w-16 h-16 bg-primary-500 rounded-2xl justify-center items-center mb-6">
              <Text className="text-white text-2xl font-bold">N</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</Text>
            <Text className="text-gray-600 text-center">
              Sign in to continue to Nexus
            </Text>
          </View>

          {/* Form */}
          <Animated.View style={formAnimatedStyle}>
            {/* Email Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">Email</Text>
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className={`border-2 rounded-xl px-4 py-4 text-base ${
                  errors.email ? 'border-red-500' : 'border-gray-200'
                } focus:border-primary-500`}
              />
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
              )}
            </View>

            {/* Password Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">Password</Text>
              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  className={`border-2 rounded-xl px-4 py-4 pr-12 text-base ${
                    errors.password ? 'border-red-500' : 'border-gray-200'
                  } focus:border-primary-500`}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                  <Text className="text-gray-500">
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
              )}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="self-end mb-8">
              <Text className="text-primary-500 font-medium">Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className={`py-4 rounded-xl ${
                  isLoading ? 'bg-gray-400' : 'bg-primary-500'
                }`}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500">or</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Social Login Buttons */}
            <View className="space-y-3">
              <TouchableOpacity className="flex-row items-center justify-center py-4 border-2 border-gray-200 rounded-xl">
                <Text className="mr-3">🔍</Text>
                <Text className="text-gray-700 font-medium">Continue with Google</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row items-center justify-center py-4 border-2 border-gray-200 rounded-xl">
                <Text className="mr-3">🍎</Text>
                <Text className="text-gray-700 font-medium">Continue with Apple</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center items-center mt-8">
            <Text className="text-gray-600">Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
              <Text className="text-primary-500 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
