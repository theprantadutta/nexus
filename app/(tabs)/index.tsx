import React, { useEffect } from 'react';
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
import { useAppStore } from '../../src/store/useAppStore';
import CircleCard from '../../src/components/cards/CircleCard';
import MeetupCard from '../../src/components/cards/MeetupCard';

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

  useEffect(() => {
    loadCircles();
    loadMeetups();
  }, []);

  const handleRefresh = async () => {
    await Promise.all([loadCircles(), loadMeetups()]);
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

  const renderCircleCard = ({ item }: { item: any }) => (
    <CircleCard
      circle={item}
      onPress={() => handleCirclePress(item.$id)}
    />
  );

  const renderMeetupCard = ({ item }: { item: any }) => (
    <MeetupCard
      meetup={item}
      onPress={() => handleMeetupPress(item.$id)}
      onJoin={() => handleJoinMeetup(item.$id)}
      isJoined={false} // TODO: Check if user is joined
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
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

          <FlatList
            data={circles.slice(0, 5)}
            renderItem={renderCircleCard}
            keyExtractor={(item) => item.$id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
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
            {meetups.slice(0, 3).map((meetup) => (
              <MeetupCard
                key={meetup.$id}
                meetup={meetup}
                onPress={() => handleMeetupPress(meetup.$id)}
                onJoin={() => handleJoinMeetup(meetup.$id)}
                isJoined={false}
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
            renderItem={renderCircleCard}
            keyExtractor={(item) => item.$id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
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
    backgroundColor: '#F9FAFB',
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
