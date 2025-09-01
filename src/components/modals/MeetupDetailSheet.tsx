import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Linking,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Meetup, User } from '../../types';
import { formatDate, formatTime, getImageUri } from '../../utils';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;

interface MeetupDetailSheetProps {
  meetup: Meetup;
  isVisible: boolean;
  onClose: () => void;
  onRegister: () => void;
  isRegistered: boolean;
  attendees: User[];
}

const MeetupDetailSheet: React.FC<MeetupDetailSheetProps> = ({
  meetup,
  isVisible,
  onClose,
  onRegister,
  isRegistered,
  attendees,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const translateY = useSharedValue(SHEET_HEIGHT);
  const scrollViewRef = useRef<ScrollView>(null);

  React.useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    } else {
      translateY.value = withSpring(SHEET_HEIGHT, { damping: 15, stiffness: 150 });
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleClose = () => {
    translateY.value = withSpring(SHEET_HEIGHT, { damping: 15, stiffness: 150 }, () => {
      runOnJS(onClose)();
    });
  };

  const openMaps = () => {
    const { coordinates } = meetup.location;
    const url = `https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}`;
    Linking.openURL(url);
  };

  const renderImageCarousel = () => (
    <View style={styles.imageContainer}>
      <FlatList
        data={meetup.images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / Dimensions.get('window').width);
          setCurrentImageIndex(index);
        }}
        renderItem={({ item }) => (
          <Image source={{ uri: getImageUri(item) }} style={styles.heroImage} resizeMode="cover" />
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      
      {meetup.images.length > 1 && (
        <View style={styles.imageIndicators}>
          {meetup.images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentImageIndex === index && styles.activeIndicator
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );

  const renderAttendeesList = () => (
    <View style={styles.attendeesSection}>
      <Text style={styles.sectionTitle}>
        Attendees ({meetup.currentAttendees}{meetup.maxAttendees ? `/${meetup.maxAttendees}` : ''})
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attendeesScroll}>
        {attendees.slice(0, 10).map((attendee) => (
          <View key={attendee.$id} style={styles.attendeeItem}>
            <Image source={{ uri: getImageUri(attendee.avatar) }} style={styles.attendeeAvatar} />
            <Text style={styles.attendeeName} numberOfLines={1}>
              {attendee.name.split(' ')[0]}
            </Text>
          </View>
        ))}
        {meetup.currentAttendees > 10 && (
          <View style={styles.moreAttendeesItem}>
            <View style={styles.moreAttendeesCircle}>
              <Text style={styles.moreAttendeesText}>+{meetup.currentAttendees - 10}</Text>
            </View>
            <Text style={styles.attendeeName}>More</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  if (!isVisible) return null;

  return (
    <GestureHandlerRootView style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={handleClose} activeOpacity={1} />
      
      <Animated.View style={[styles.sheet, animatedStyle]}>
        <PanGestureHandler
          onGestureEvent={(event) => {
            const translationY = event.nativeEvent.translationY as number;
            if (translationY > 0) {
              translateY.value = translationY;
            }
          }}
          onEnded={(event) => {
            const translationY = event.nativeEvent.translationY as number;
            if (translationY > 100) {
              handleClose();
            } else {
              translateY.value = withSpring(0);
            }
          }}
        >
          <Animated.View>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />
            
            <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Hero Image Carousel */}
              {renderImageCarousel()}
              
              {/* Content */}
              <View style={styles.contentPadding}>
                {/* Title and Date */}
                <View style={styles.header}>
                  <Text style={styles.title}>{meetup.title}</Text>
                  <View style={styles.dateTimeContainer}>
                    <View style={styles.dateChip}>
                      <Text style={styles.dateText}>{formatDate(meetup.date)}</Text>
                    </View>
                    <View style={styles.timeChip}>
                      <Text style={styles.timeText}>{formatTime(meetup.date)}</Text>
                    </View>
                  </View>
                </View>

                {/* Host Info */}
                <View style={styles.hostSection}>
                  <Text style={styles.sectionTitle}>Hosted by</Text>
                  <View style={styles.hostInfo}>
                    <Image 
                      source={{ uri: getImageUri('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100') }} 
                      style={styles.hostAvatar} 
                    />
                    <View style={styles.hostDetails}>
                      <Text style={styles.hostName}>John Doe</Text>
                      <Text style={styles.hostTitle}>Community Organizer</Text>
                    </View>
                    <TouchableOpacity style={styles.messageButton}>
                      <Text style={styles.messageButtonText}>Message</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.descriptionSection}>
                  <Text style={styles.sectionTitle}>About this event</Text>
                  <Text style={styles.description}>{meetup.description}</Text>
                </View>

                {/* Location */}
                <View style={styles.locationSection}>
                  <Text style={styles.sectionTitle}>Location</Text>
                  <TouchableOpacity style={styles.locationCard} onPress={openMaps}>
                    <View style={styles.locationIcon}>
                      <Text style={styles.locationEmoji}>
                        {meetup.isOnline ? '💻' : '📍'}
                      </Text>
                    </View>
                    <View style={styles.locationDetails}>
                      <Text style={styles.locationName}>
                        {meetup.isOnline ? 'Online Event' : meetup.location.name}
                      </Text>
                      <Text style={styles.locationAddress}>
                        {meetup.isOnline ? 'Link will be shared before event' : meetup.location.address}
                      </Text>
                    </View>
                    {!meetup.isOnline && (
                      <Text style={styles.viewMapText}>View Map</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Attendees */}
                {renderAttendeesList()}

                {/* Price */}
                {meetup.price && meetup.price > 0 && (
                  <View style={styles.priceSection}>
                    <Text style={styles.sectionTitle}>Price</Text>
                    <Text style={styles.priceText}>${meetup.price} per person</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </Animated.View>
        </PanGestureHandler>

        {/* Sticky Bottom Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.priceContainer}>
            {meetup.price && meetup.price > 0 ? (
              <Text style={styles.bottomPrice}>${meetup.price}</Text>
            ) : (
              <Text style={styles.freeText}>Free</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.registerButton, isRegistered && styles.registeredButton]}
            onPress={onRegister}
          >
            <Text style={[styles.registerButtonText, isRegistered && styles.registeredButtonText]}>
              {isRegistered ? 'Registered ✓' : 'Register'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  heroImage: {
    width: Dimensions.get('window').width,
    height: 250,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  contentPadding: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for bottom bar
  },
  header: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dateChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4361EE',
  },
  timeChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  hostSection: {
    marginBottom: 24,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  hostDetails: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  hostTitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  messageButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  locationSection: {
    marginBottom: 24,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationEmoji: {
    fontSize: 20,
  },
  locationDetails: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  viewMapText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4361EE',
  },
  attendeesSection: {
    marginBottom: 24,
  },
  attendeesScroll: {
    marginTop: 8,
  },
  attendeeItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  attendeeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 4,
  },
  attendeeName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  moreAttendeesItem: {
    alignItems: 'center',
    width: 60,
  },
  moreAttendeesCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  moreAttendeesText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  priceSection: {
    marginBottom: 24,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  priceContainer: {
    flex: 1,
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  freeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  registerButton: {
    backgroundColor: '#4361EE',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  registeredButton: {
    backgroundColor: '#10B981',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  registeredButtonText: {
    color: 'white',
  },
});

export default MeetupDetailSheet;
