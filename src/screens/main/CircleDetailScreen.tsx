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
  Dimensions,
  FlatList,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useAppStore } from '../../store/useAppStore';
import { Circle, User, Meetup } from '../../types';
import { getImageUri, formatDate } from '../../utils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

interface CircleDetailScreenProps {
  circleId: string;
  onBack: () => void;
}

const CircleDetailScreen: React.FC<CircleDetailScreenProps> = ({ circleId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'members' | 'meetups'>('about');
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [circleMeetups, setCircleMeetups] = useState<Meetup[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  
  const { user, joinCircle, loadMeetups, userMemberships } = useAppStore();
  const scrollY = useSharedValue(0);

  useEffect(() => {
    // Load circle data
    loadCircleData();
    loadMembersData();
    loadCircleMeetups();
    checkMembership();
  }, [circleId]);

  const loadCircleData = async () => {
    // TODO: Load circle data from Firebase
    // For now, using mock data
    const mockCircle: Circle = {
      $id: circleId,
      name: 'Tech Enthusiasts',
      description: 'A community for technology lovers to share ideas, learn new skills, and network with like-minded individuals. We organize regular meetups, workshops, and hackathons.',
      bannerImage: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800',
      category: 'Technology',
      memberCount: 156,
      createdBy: 'user123',
      location: {
        city: 'San Francisco',
        country: 'USA',
      },
      privacy: 'public',
      createdAt: '2024-01-15T10:00:00Z',
    };
    setCircle(mockCircle);
  };

  const loadMembersData = async () => {
    // TODO: Load members from Firebase
    const mockMembers: User[] = [
      {
        $id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        bio: 'Software Engineer',
        interests: ['Tech', 'AI'],
        joinedAt: '2024-01-20T10:00:00Z',
      },
      {
        $id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
        bio: 'Product Manager',
        interests: ['Tech', 'Design'],
        joinedAt: '2024-01-25T10:00:00Z',
      },
    ];
    setMembers(mockMembers);
  };

  const loadCircleMeetups = async () => {
    // TODO: Load meetups for this circle
    const mockMeetups: Meetup[] = [
      {
        $id: '1',
        circleId,
        title: 'AI Workshop',
        description: 'Learn about the latest AI technologies',
        date: '2024-02-15T18:00:00Z',
        location: {
          name: 'Tech Hub',
          address: '123 Tech St, SF',
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
        },
        maxAttendees: 50,
        currentAttendees: 23,
        images: ['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400'],
        createdBy: 'user123',
        createdAt: '2024-01-20T10:00:00Z',
        isOnline: false,
      },
    ];
    setCircleMeetups(mockMeetups);
  };

  const checkMembership = () => {
    const membership = userMemberships.find(m => m.circleId === circleId);
    setIsJoined(!!membership);
  };

  const handleJoinCircle = async () => {
    if (!user) return;
    
    const success = await joinCircle(circleId);
    if (success) {
      setIsJoined(true);
      setCircle(prev => prev ? { ...prev, memberCount: prev.memberCount + 1 } : null);
    }
  };

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT - 100],
      [0, 1],
      Extrapolate.CLAMP
    );

    return { opacity };
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-100, 0],
      [1.2, 1],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, -HEADER_HEIGHT * 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return renderAboutTab();
      case 'members':
        return renderMembersTab();
      case 'meetups':
        return renderMeetupsTab();
      default:
        return null;
    }
  };

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.description}>{circle?.description}</Text>
      
      <View style={styles.categoryContainer}>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryText}>{circle?.category}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{circle?.memberCount}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{circleMeetups.length}</Text>
          <Text style={styles.statLabel}>Meetups</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>4.8</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Created</Text>
        <Text style={styles.infoText}>
          {circle ? formatDate(circle.createdAt) : ''}
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Location</Text>
        <Text style={styles.infoText}>
          {circle?.location.city}, {circle?.location.country}
        </Text>
      </View>
    </View>
  );

  const renderMembersTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={members}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <View style={styles.memberItem}>
            <Image source={{ uri: getImageUri(item.avatar) }} style={styles.memberAvatar} />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{item.name}</Text>
              <Text style={styles.memberBio}>{item.bio}</Text>
            </View>
            <View style={styles.memberRole}>
              <Text style={styles.roleText}>Member</Text>
            </View>
          </View>
        )}
        scrollEnabled={false}
      />
    </View>
  );

  const renderMeetupsTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={circleMeetups}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <View style={styles.meetupItem}>
            <View style={styles.meetupDate}>
              <Text style={styles.meetupDay}>15</Text>
              <Text style={styles.meetupMonth}>Feb</Text>
            </View>
            <View style={styles.meetupInfo}>
              <Text style={styles.meetupTitle}>{item.title}</Text>
              <Text style={styles.meetupDescription}>{item.description}</Text>
              <Text style={styles.meetupLocation}>{item.location.name}</Text>
            </View>
          </View>
        )}
        scrollEnabled={false}
      />
    </View>
  );

  if (!circle) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header Image */}
      <Animated.View style={[styles.headerImage, imageAnimatedStyle]}>
        <Image 
          source={{ uri: getImageUri(circle.bannerImage) }} 
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay} />
      </Animated.View>

      {/* Navigation Header */}
      <Animated.View style={[styles.navHeader, headerAnimatedStyle]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{circle.name}</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareIcon}>⤴</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Back Button Overlay */}
      <TouchableOpacity onPress={onBack} style={styles.backButtonOverlay}>
        <Text style={styles.backIconOverlay}>←</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        {/* Header Content */}
        <View style={styles.headerContent}>
          <Text style={styles.circleName}>{circle.name}</Text>
          <Text style={styles.circleLocation}>
            📍 {circle.location.city}, {circle.location.country}
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          {(['about', 'members', 'meetups'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>

      {/* Join Button */}
      {!isJoined && (
        <View style={styles.joinButtonContainer}>
          <TouchableOpacity style={styles.joinButton} onPress={handleJoinCircle}>
            <Text style={styles.joinButtonText}>Join Circle</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 1,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  navHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'white',
    zIndex: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#111827',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 18,
    color: '#111827',
  },
  backButtonOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  backIconOverlay: {
    fontSize: 20,
    color: 'white',
  },
  scrollView: {
    flex: 1,
    marginTop: HEADER_HEIGHT - 50,
  },
  headerContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  circleName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  circleLocation: {
    fontSize: 16,
    color: '#6B7280',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#4361EE',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#4361EE',
    fontWeight: '600',
  },
  tabContent: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 24,
    minHeight: 400,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 20,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4361EE',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingVertical: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#6B7280',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  memberBio: {
    fontSize: 14,
    color: '#6B7280',
  },
  memberRole: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  meetupItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  meetupDate: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4361EE',
    borderRadius: 8,
    marginRight: 16,
    paddingVertical: 8,
  },
  meetupDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  meetupMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  meetupInfo: {
    flex: 1,
  },
  meetupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  meetupDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  meetupLocation: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  joinButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  joinButton: {
    backgroundColor: '#4361EE',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default CircleDetailScreen;
