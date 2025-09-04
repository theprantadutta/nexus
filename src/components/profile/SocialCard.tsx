import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from 'react-native';
// import QRCode from 'react-native-qrcode-svg'; // TODO: Install react-native-qrcode-svg
import { User } from '../../types';
import { getImageUri } from '../../utils';

interface SocialCardProps {
  user: User;
  qrCodeData: string;
  onShare?: () => void;
}

const SocialCard: React.FC<SocialCardProps> = ({ user, qrCodeData, onShare }) => {

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Connect with ${user.name} on Nexus! Scan this QR code or visit: nexus://user/${user.$id}`,
        title: `Connect with ${user.name}`,
      });
      onShare?.();
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share profile');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: getImageUri(user.avatar) }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            {user.bio && <Text style={styles.userBio} numberOfLines={2}>{user.bio}</Text>}
            {user.location && (
              <Text style={styles.userLocation}>
                📍 {user.location.city}, {user.location.country}
              </Text>
            )}
          </View>
        </View>

        {/* QR Code Placeholder */}
        <View style={styles.qrContainer}>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrPlaceholderText}>QR Code</Text>
            <Text style={styles.qrPlaceholderSubtext}>Install react-native-qrcode-svg</Text>
          </View>
          <Text style={styles.qrLabel}>Scan to connect</Text>
        </View>

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <View style={styles.interestsContainer}>
            <Text style={styles.interestsTitle}>Interests</Text>
            <View style={styles.interestsList}>
              {user.interests.slice(0, 4).map((interest, index) => (
                <View key={index} style={styles.interestChip}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
              {user.interests.length > 4 && (
                <View style={styles.interestChip}>
                  <Text style={styles.interestText}>+{user.interests.length - 4}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.appName}>Nexus</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>Share Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4361EE',
    borderStyle: 'dashed',
  },
  qrPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4361EE',
    marginBottom: 4,
  },
  qrPlaceholderSubtext: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  qrLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  interestsContainer: {
    marginBottom: 24,
  },
  interestsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 12,
    color: '#4361EE',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4361EE',
  },
  shareButton: {
    backgroundColor: '#4361EE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SocialCard;
