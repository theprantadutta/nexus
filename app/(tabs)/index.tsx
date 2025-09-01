import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTokens } from '@/constants/theme/tokens';
import { useAppStore } from '../../src/store/useAppStore';
import CircleCard from '../../src/components/cards/CircleCard';
import MeetupCard from '../../src/components/cards/MeetupCard';
import { CircleCardSkeleton, MeetupCardSkeleton } from '../../src/components/common/SkeletonLoader';

// Animated Card Components
const AnimatedCircleCard = ({ circle, onPress, index }: { circle: any; onPress: () => void; index: number }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 100;
    scale.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 150 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const pressScale = useSharedValue(1);
  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, { marginRight: 16 }]}>
      <Animated.View style={pressAnimatedStyle}>
        <TouchableOpacity
          onPressIn={() => { pressScale.value = withSpring(0.95); }}
          onPressOut={() => { pressScale.value = withSpring(1); }}
          onPress={onPress}
          activeOpacity={1}
        >
          <CircleCard circle={circle} onPress={onPress} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const AnimatedMeetupCard = ({ meetup, onPress, onJoin, isJoined, index }: { meetup: any; onPress: () => void; onJoin: () => void; isJoined: boolean; index: number }) => {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 150;
    translateY.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 100 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const pressScale = useSharedValue(1);
  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, { marginBottom: 12 }]}>
      <Animated.View style={pressAnimatedStyle}>
        <TouchableOpacity
          onPressIn={() => { pressScale.value = withSpring(0.98); }}
          onPressOut={() => { pressScale.value = withSpring(1); }}
          onPress={onPress}
          activeOpacity={1}
        >
          <MeetupCard meetup={meetup} onPress={onPress} onJoin={onJoin} isJoined={isJoined} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const {
    user,
    circles,
    meetups,
    loadCircles,
    loadMeetups,
    joinCircle,
    isLoading
  } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCircles();
    loadMeetups();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadCircles(), loadMeetups()]);
    setRefreshing(false);
  };

  const handleCirclePress = (circleId: string) => {
    // Navigate to circle detail
    console.log('Navigate to circle:', circleId);
  };

  const handleMeetupPress = (meetupId: string) => {
    // Navigate to meetup detail
    console.log('Navigate to meetup:', meetupId);
  };

  const handleJoinMeetup = (meetupId: string) => {
    // Join meetup logic
    console.log('Join meetup:', meetupId);
  };

  const renderCircleCard = ({ item, index }: { item: any; index: number }) => (
    <AnimatedCircleCard
      circle={item}
      onPress={() => handleCirclePress(item.$id)}
      index={index}
    />
  );

  const renderMeetupCard = ({ item, index }: { item: any; index: number }) => (
    <AnimatedMeetupCard
      meetup={item}
      onPress={() => handleMeetupPress(item.$id)}
      onJoin={() => handleJoinMeetup(item.$id)}
      isJoined={false} // TODO: Check if user is joined
      index={index}
    />
  );

  const tokens = useTokens();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tokens.colors.surfaceAlt }]}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={handleRefresh}
            tintColor={tokens.colors.primary}
            colors={[tokens.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: tokens.colors.surface }]}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{user?.name || 'Welcome!'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Circles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Circles</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={[styles.horizontalList, { flexDirection: 'row' }]}>
              {Array.from({ length: 5 }).map((_, i) => (
                <View key={i} style={{ marginRight: 16 }}>
                  <CircleCardSkeleton />
                </View>
              ))}
            </View>
          ) : (
            <FlatList
              data={circles.slice(0, 5)}
              renderItem={({ item, index }) => renderCircleCard({ item, index })}
              keyExtractor={(item) => item.$id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              removeClippedSubviews={true}
              maxToRenderPerBatch={3}
              windowSize={5}
              initialNumToRender={3}
              getItemLayout={(data, index) => ({
                length: 296, // CircleCard width + margin
                offset: 296 * index,
                index,
              })}
            />
          )}
        </View>

        {/* Upcoming Meetups Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Meetups</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.meetupsList}>
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <MeetupCardSkeleton key={i} />
                ))
              : meetups.slice(0, 3).map((meetup, index) => (
                  <AnimatedMeetupCard
                    key={meetup.$id}
                    meetup={meetup}
                    onPress={() => handleMeetupPress(meetup.$id)}
                    onJoin={() => handleJoinMeetup(meetup.$id)}
                    isJoined={false}
                    index={index}
                  />
                ))}
          </View>
        </View>

        {/* Recommended Circles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={circles.slice(5, 10)}
            renderItem={({ item, index }) => renderCircleCard({ item, index: index + 5 })}
            keyExtractor={(item) => item.$id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            removeClippedSubviews={true}
            maxToRenderPerBatch={3}
            windowSize={5}
            initialNumToRender={3}
            getItemLayout={(data, index) => ({
              length: 296, // CircleCard width + margin
              offset: 296 * index,
              index,
            })}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 20 }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>➕</Text>
              <Text style={styles.quickActionText}>Create Circle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>📅</Text>
              <Text style={styles.quickActionText}>Host Event</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>🔍</Text>
              <Text style={styles.quickActionText}>Discover</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // TODO: replace with ThemedView and tokens in later pass
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 18,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4361EE',
    fontWeight: '500',
  },
  horizontalList: {
    paddingLeft: 20,
  },
  meetupsList: {
    paddingHorizontal: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
});
