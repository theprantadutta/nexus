import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Meetup } from '../../types';
import { formatDate, formatTime, getImageUri } from '../../utils';

interface MeetupCardProps {
  meetup: Meetup;
  onPress: () => void;
  onJoin?: () => void;
  isJoined?: boolean;
}

const MeetupCard: React.FC<MeetupCardProps> = ({ meetup, onPress, onJoin, isJoined = false }) => {
  const meetupDate = new Date(meetup.date);
  const dayOfMonth = meetupDate.getDate();
  const month = meetupDate.toLocaleDateString('en-US', { month: 'short' });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.dateContainer}>
        <Text style={styles.month}>{month}</Text>
        <Text style={styles.day}>{dayOfMonth}</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {meetup.title}
            </Text>
            <Text style={styles.time}>
              {formatTime(meetup.date)}
            </Text>
          </View>
          
          {meetup.images && meetup.images.length > 0 && (
            <Image 
              source={{ uri: getImageUri(meetup.images[0]) }} 
              style={styles.meetupImage}
              resizeMode="cover"
            />
          )}
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {meetup.description}
        </Text>
        
        <View style={styles.details}>
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>
              {meetup.isOnline ? '💻' : '📍'}
            </Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {meetup.isOnline ? 'Online Event' : meetup.location.name}
            </Text>
          </View>
          
          <View style={styles.attendeesContainer}>
            <Text style={styles.attendeesIcon}>👥</Text>
            <Text style={styles.attendeesText}>
              {meetup.currentAttendees}
              {meetup.maxAttendees && ` / ${meetup.maxAttendees}`}
            </Text>
          </View>
        </View>
        
        {meetup.price && meetup.price > 0 && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>${meetup.price}</Text>
          </View>
        )}
        
        <View style={styles.footer}>
          {meetup.circle && (
            <View style={styles.circleInfo}>
              <Text style={styles.circleText}>by {meetup.circle.name}</Text>
            </View>
          )}
          
          {onJoin && (
            <TouchableOpacity 
              style={[styles.joinButton, isJoined ? styles.joinedButton : styles.joinButtonDefault]}
              onPress={onJoin}
              activeOpacity={0.8}
            >
              <Text style={[styles.joinButtonText, isJoined ? styles.joinedButtonText : styles.joinButtonTextDefault]}>
                {isJoined ? 'Joined' : 'Join'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4361EE',
    borderRadius: 8,
    width: 50,
    height: 50,
    marginRight: 16,
  },
  month: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  day: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: '#6B7280',
  },
  meetupImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeesIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  attendeesText: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleInfo: {
    flex: 1,
  },
  circleText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  joinButtonDefault: {
    backgroundColor: '#4361EE',
    borderColor: '#4361EE',
  },
  joinedButton: {
    backgroundColor: 'white',
    borderColor: '#10B981',
  },
  joinButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  joinButtonTextDefault: {
    color: 'white',
  },
  joinedButtonText: {
    color: '#10B981',
  },
});

export default MeetupCard;
