import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Circle } from '../../types';
import { getImageUri } from '../../utils';

interface CircleCardProps {
  circle: Circle;
  onPress: () => void;
}

const CircleCard: React.FC<CircleCardProps> = ({ circle, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: getImageUri(circle.bannerImage) }} 
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{circle.category}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {circle.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {circle.description}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {circle.location.city}, {circle.location.country}
            </Text>
          </View>
          
          <View style={styles.membersContainer}>
            <Text style={styles.membersIcon}>👥</Text>
            <Text style={styles.membersText}>
              {circle.memberCount} {circle.memberCount === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>
        
        {circle.recentMembers && circle.recentMembers.length > 0 && (
          <View style={styles.recentMembers}>
            {circle.recentMembers.slice(0, 3).map((member, index) => (
              <View 
                key={member.$id} 
                style={[styles.memberAvatar, { marginLeft: index > 0 ? -8 : 0 }]}
              >
                <Image 
                  source={{ uri: getImageUri(member.avatar) }} 
                  style={styles.avatarImage}
                />
              </View>
            ))}
            {circle.recentMembers.length > 3 && (
              <View style={[styles.memberAvatar, styles.moreMembers, { marginLeft: -8 }]}>
                <Text style={styles.moreMembersText}>+{circle.recentMembers.length - 3}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: 'white',
    borderRadius: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4361EE',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membersIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  membersText: {
    fontSize: 12,
    color: '#6B7280',
  },
  recentMembers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  moreMembers: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreMembersText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default CircleCard;
