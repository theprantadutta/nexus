import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: 1,
    title: 'Find Your People',
    subtitle: 'Discover local communities around your interests',
    icon: '👥',
    description: 'Connect with like-minded people in your area who share your passions and hobbies.',
  },
  {
    id: 2,
    title: 'Join Circles',
    subtitle: 'Become part of amazing communities',
    icon: '⭕',
    description: 'Join hobby groups, attend events, and build lasting friendships with people who get you.',
  },
  {
    id: 3,
    title: 'Choose Your Interests',
    subtitle: 'Tell us what you love',
    icon: '❤️',
    description: 'Select your interests so we can recommend the perfect circles and events for you.',
  },
];

const INTERESTS = [
  'Sports', 'Tech', 'Arts', 'Gaming', 'Fitness', 'Food',
  'Music', 'Travel', 'Books', 'Photography', 'Dancing', 'Cooking',
  'Hiking', 'Movies', 'Yoga', 'Cycling', 'Writing', 'Gardening',
];

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useSharedValue(0);
  const { setOnboarding } = useAppStore();

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = contentOffsetX;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const goToNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setOnboarding(false);
    router.replace('/auth/login');
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const renderOnboardingPage = (item: typeof ONBOARDING_DATA[0], index: number) => {

    return (
      <View key={item.id} style={[{ width: SCREEN_WIDTH }, styles.pageContainer]}>
        <View style={styles.contentContainer}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={styles.title}>
            {item.title}
          </Text>
          <Text style={styles.subtitle}>
            {item.subtitle}
          </Text>
          <Text style={styles.description}>
            {item.description}
          </Text>

          {/* Interest Selection for last page */}
          {index === 2 && (
            <View style={styles.interestContainer}>
              <Text style={styles.interestTitle}>
                Select at least 3 interests:
              </Text>
              <View style={styles.interestGrid}>
                {INTERESTS.map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    onPress={() => toggleInterest(interest)}
                    style={[
                      styles.interestChip,
                      selectedInterests.includes(interest)
                        ? styles.interestChipSelected
                        : styles.interestChipDefault
                    ]}
                  >
                    <Text
                      style={[
                        styles.interestChipText,
                        selectedInterests.includes(interest)
                          ? styles.interestChipTextSelected
                          : styles.interestChipTextDefault
                      ]}
                    >
                      {interest}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {ONBOARDING_DATA.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentIndex === index ? styles.paginationDotActive : styles.paginationDotInactive
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {ONBOARDING_DATA.map((item, index) => renderOnboardingPage(item, index))}
      </ScrollView>

      <View style={styles.bottomContainer}>
        {renderPaginationDots()}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => router.replace('/auth/login')}
            style={styles.skipButton}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToNext}
            disabled={currentIndex === 2 && selectedInterests.length < 3}
            style={[
              styles.nextButton,
              currentIndex === 2 && selectedInterests.length < 3
                ? styles.nextButtonDisabled
                : styles.nextButtonEnabled
            ]}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  contentContainer: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 72,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#4361EE',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  interestContainer: {
    marginTop: 32,
    width: '100%',
  },
  interestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  interestChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    margin: 4,
  },
  interestChipDefault: {
    backgroundColor: 'white',
    borderColor: '#D1D5DB',
  },
  interestChipSelected: {
    backgroundColor: '#4361EE',
    borderColor: '#4361EE',
  },
  interestChipText: {
    fontWeight: '500',
  },
  interestChipTextDefault: {
    color: '#374151',
  },
  interestChipTextSelected: {
    color: 'white',
  },
  bottomContainer: {
    paddingBottom: 48,
    paddingHorizontal: 32,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: '#4361EE',
  },
  paginationDotInactive: {
    width: 8,
    backgroundColor: '#D1D5DB',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  nextButtonEnabled: {
    backgroundColor: '#4361EE',
  },
  nextButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default OnboardingScreen;
