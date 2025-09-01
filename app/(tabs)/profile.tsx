import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { useAppStore } from '../../src/store/useAppStore';
import { Circle, Meetup } from '../../src/types';
import { getImageUri, formatDate } from '../../src/utils';
import CircleCard from '../../src/components/cards/CircleCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
  const [userCircles, setUserCircles] = useState<Circle[]>([]);
  const [userMeetups, setUserMeetups] = useState<Meetup[]>([]);
  const [showPastMeetups, setShowPastMeetups] = useState(false);

  const { user, circles, meetups } = useAppStore();

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, circles, meetups]);

  const loadUserData = async () => {
    // For now, show all circles as user circles (simplified)
    setUserCircles(circles.slice(0, 3));

    // Filter user's meetups (registered ones)
    const userMeetupsList = await useAppStore.getState().getUserMeetups();
    setUserMeetups(userMeetupsList);
  };

  const handleEditProfile = () => {
    console.log('Navigate to edit profile');
  };

  const handleShareProfile = () => {
    console.log('Share profile');
  };

  const handleCirclePress = (circleId: string) => {
    console.log('Navigate to circle:', circleId);
  };

  const handleMeetupPress = (meetupId: string) => {
    console.log('Navigate to meetup:', meetupId);
  };

  const getUpcomingMeetups = () => {
    const now = new Date();
    return userMeetups.filter(meetup => new Date(meetup.date) > now);
  };

  const getPastMeetups = () => {
    const now = new Date();
    return userMeetups.filter(meetup => new Date(meetup.date) <= now);
  };

  const getMemberSinceDate = () => {
    if (!user?.joinedAt) return 'Recently';
    const joinDate = new Date(user.joinedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      {/* Cover Photo */}
      <View style={styles.coverPhoto}>
        <Image
          source={{ uri: getImageUri('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800') }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <View style={styles.coverOverlay} />
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: getImageUri(user?.avatar) }}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
          <Text style={styles.userBio}>{user?.bio || 'No bio available'}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userCircles.length}</Text>
            <Text style={styles.statLabel}>Circles</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userMeetups.length}</Text>
            <Text style={styles.statLabel}>Meetups</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{getMemberSinceDate()}</Text>
            <Text style={styles.statLabel}>Member since</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareProfile}>
            <Text style={styles.shareIcon}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderSocialCard = () => (
    <View style={styles.socialCard}>
      <Text style={styles.sectionTitle}>Social Card</Text>
      <View style={styles.cardPreview}>
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: getImageUri(user?.avatar) }}
            style={styles.cardAvatar}
          />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{user?.name}</Text>
            <Text style={styles.cardTitle}>Community Member</Text>
          </View>
          <View style={styles.qrCode}>
            <Text style={styles.qrText}>QR</Text>
          </View>
        </View>

        {/* Interests */}
        <View style={styles.cardInterests}>
          {user?.interests?.slice(0, 3).map((interest, index) => (
            <View key={index} style={styles.interestChip}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.shareCardButton} onPress={handleShareProfile}>
          <Text style={styles.shareCardText}>Share Card</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMyCircles = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>My Circles</Text>
      {userCircles.length > 0 ? (
        <FlatList
          data={userCircles}
          renderItem={({ item }) => (
            <CircleCard
              circle={item}
              onPress={() => handleCirclePress(item.$id)}
            />
          )}
          keyExtractor={(item) => item.$id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No circles joined yet</Text>
        </View>
      )}
    </View>
  );

  const renderUpcomingMeetups = () => {
    const upcomingMeetups = getUpcomingMeetups();

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Meetups</Text>
        {upcomingMeetups.length > 0 ? (
          <View style={styles.meetupsList}>
            {upcomingMeetups.slice(0, 3).map((meetup) => (
              <TouchableOpacity
                key={meetup.$id}
                style={styles.meetupItem}
                onPress={() => handleMeetupPress(meetup.$id)}
              >
                <View style={styles.meetupDate}>
                  <Text style={styles.meetupDay}>
                    {new Date(meetup.date).getDate()}
                  </Text>
                  <Text style={styles.meetupMonth}>
                    {new Date(meetup.date).toLocaleDateString('en', { month: 'short' })}
                  </Text>
                </View>
                <View style={styles.meetupInfo}>
                  <Text style={styles.meetupTitle}>{meetup.title}</Text>
                  <Text style={styles.meetupTime}>
                    {new Date(meetup.date).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                <Text style={styles.meetupArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No upcoming meetups</Text>
          </View>
        )}
      </View>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4361EE" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        {renderSocialCard()}
        {renderMyCircles()}
        {renderUpcomingMeetups()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  profileHeader: {
    backgroundColor: 'white',
    marginBottom: 16,
  },
  coverPhoto: {
    height: 120,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(67, 97, 238, 0.3)',
  },
  profileInfo: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'white',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  userBio: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#4361EE',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 18,
  },
  socialCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  cardPreview: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  qrCode: {
    width: 40,
    height: 40,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  cardInterests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  interestChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4361EE',
  },
  shareCardButton: {
    backgroundColor: '#4361EE',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  shareCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
  },
  horizontalList: {
    paddingRight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  meetupsList: {
    gap: 12,
  },
  meetupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  meetupDate: {
    width: 48,
    alignItems: 'center',
    marginRight: 16,
  },
  meetupDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4361EE',
  },
  meetupMonth: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  meetupInfo: {
    flex: 1,
  },
  meetupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  meetupTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  meetupArrow: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  pastMeetupItem: {
    opacity: 0.7,
  },
  pastMeetupDate: {
    opacity: 0.7,
  },
  pastMeetupText: {
    opacity: 0.7,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  expandIcon: {
    fontSize: 14,
    color: '#6B7280',
  },
});
