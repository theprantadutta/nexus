import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { getImageUri } from '../../utils';
import { useProfile } from '../../hooks/useProfile';
import { ProfileUpdateData } from '../../services/profile/profileService';

interface EditProfileScreenProps {
  onBack: () => void;
  onSave: () => void;
}

const INTERESTS = [
  'Technology', 'Sports', 'Arts', 'Gaming', 'Fitness', 'Food',
  'Music', 'Travel', 'Books', 'Photography', 'Dancing', 'Cooking',
  'Business', 'Health', 'Education', 'Volunteering', 'Movies', 'Fashion'
];

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onBack, onSave }) => {
  const { user } = useAppStore();
  const {
    isLoading,
    updateProfile,
    pickAndUploadAvatar,
    validateProfile,
    getActivityStats,
  } = useProfile();

  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: user?.name || '',
    bio: user?.bio || '',
    interests: user?.interests || [],
    privacy: {
      isPrivate: user?.privacy?.isPrivate || false,
      allowMessages: user?.privacy?.allowMessages || true,
      showLocation: user?.privacy?.showLocation || true,
      showInterests: user?.privacy?.showInterests || true,
      showMemberships: user?.privacy?.showMemberships || true,
    },
    socialLinks: {
      website: user?.socialLinks?.website || '',
      twitter: user?.socialLinks?.twitter || '',
      linkedin: user?.socialLinks?.linkedin || '',
      instagram: user?.socialLinks?.instagram || '',
    },
    notifications: {
      emailNotifications: user?.notifications?.emailNotifications || true,
      pushNotifications: user?.notifications?.pushNotifications || true,
      meetupReminders: user?.notifications?.meetupReminders || true,
      circleUpdates: user?.notifications?.circleUpdates || true,
      messageNotifications: user?.notifications?.messageNotifications || true,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'social' | 'notifications'>('profile');
  const [activityStats, setActivityStats] = useState<any>(null);

  // Load activity stats on mount
  useEffect(() => {
    const loadStats = async () => {
      const stats = await getActivityStats();
      setActivityStats(stats);
    };
    loadStats();
  }, [getActivityStats]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateNestedFormData = (section: keyof ProfileUpdateData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  const toggleInterest = (interest: string) => {
    const currentInterests = formData.interests || [];
    const updatedInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];

    updateFormData('interests', updatedInterests);
  };

  const handleAvatarChange = () => {
    Alert.alert(
      'Change Avatar',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const result = await pickAndUploadAvatar('camera');
            if (result.success) {
              Alert.alert('Success', 'Avatar updated successfully!');
            } else {
              Alert.alert('Error', result.error || 'Failed to update avatar');
            }
          }
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const result = await pickAndUploadAvatar('gallery');
            if (result.success) {
              Alert.alert('Success', 'Avatar updated successfully!');
            } else {
              Alert.alert('Error', result.error || 'Failed to update avatar');
            }
          }
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const validateForm = (): boolean => {
    const validation = validateProfile(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const result = await updateProfile(formData);

      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: onSave }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    }
  };

  const renderAvatarSection = () => (
    <View style={styles.avatarSection}>
      <Text style={styles.sectionTitle}>Profile Photo</Text>
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: getImageUri(formData.avatar) }}
          style={styles.avatar}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.changeAvatarButton} onPress={handleAvatarChange}>
          <Text style={styles.changeAvatarIcon}>📷</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Name *</Text>
        <TextInput
          style={[styles.textInput, errors.name && styles.inputError]}
          value={formData.name || ''}
          onChangeText={(text) => updateFormData('name', text)}
          placeholder="Enter your name"
          maxLength={50}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        <Text style={styles.characterCount}>{(formData.name || '').length}/50</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Bio</Text>
        <TextInput
          style={[styles.textArea, errors.bio && styles.inputError]}
          value={formData.bio || ''}
          onChangeText={(text) => updateFormData('bio', text)}
          placeholder="Tell us about yourself..."
          multiline
          numberOfLines={4}
          maxLength={500}
        />
        {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
        <Text style={styles.characterCount}>{(formData.bio || '').length}/500</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Location</Text>
        <TextInput
          style={styles.textInput}
          value={formData.location ? `${formData.location.city}, ${formData.location.country}` : ''}
          onChangeText={(text) => {
            const parts = text.split(',').map(p => p.trim());
            updateFormData('location', {
              city: parts[0] || '',
              country: parts[1] || parts[0] || '',
            });
          }}
          placeholder="City, Country"
          maxLength={100}
        />
      </View>
    </View>
  );

  const renderInterests = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Interests</Text>
      <Text style={styles.sectionSubtitle}>
        Select topics you&apos;re interested in (at least 1 required)
      </Text>
      {errors.interests && <Text style={styles.errorText}>{errors.interests}</Text>}
      
      <View style={styles.interestsGrid}>
        {INTERESTS.map((interest) => (
          <TouchableOpacity
            key={interest}
            style={[
              styles.interestChip,
              (formData.interests || []).includes(interest) && styles.selectedInterestChip
            ]}
            onPress={() => toggleInterest(interest)}
          >
            <Text style={[
              styles.interestText,
              (formData.interests || []).includes(interest) && styles.selectedInterestText
            ]}>
              {interest}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.selectedCount}>
        {(formData.interests || []).length} interest{(formData.interests || []).length !== 1 ? 's' : ''} selected
      </Text>
    </View>
  );

  const renderPrivacySettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Privacy Settings</Text>
      <Text style={styles.sectionSubtitle}>Control who can see your information</Text>

      <View style={styles.switchContainer}>
        <View style={styles.switchItem}>
          <View>
            <Text style={styles.switchLabel}>Private Profile</Text>
            <Text style={styles.switchDescription}>Only approved followers can see your profile</Text>
          </View>
          <Switch
            value={formData.privacy?.isPrivate || false}
            onValueChange={(value) => updateNestedFormData('privacy', 'isPrivate', value)}
          />
        </View>

        <View style={styles.switchItem}>
          <View>
            <Text style={styles.switchLabel}>Allow Messages</Text>
            <Text style={styles.switchDescription}>Let other members send you direct messages</Text>
          </View>
          <Switch
            value={formData.privacy?.allowMessages || false}
            onValueChange={(value) => updateNestedFormData('privacy', 'allowMessages', value)}
          />
        </View>

        <View style={styles.switchItem}>
          <View>
            <Text style={styles.switchLabel}>Show Location</Text>
            <Text style={styles.switchDescription}>Display your location on your profile</Text>
          </View>
          <Switch
            value={formData.privacy?.showLocation || false}
            onValueChange={(value) => updateNestedFormData('privacy', 'showLocation', value)}
          />
        </View>

        <View style={styles.switchItem}>
          <View>
            <Text style={styles.switchLabel}>Show Interests</Text>
            <Text style={styles.switchDescription}>Display your interests publicly</Text>
          </View>
          <Switch
            value={formData.privacy?.showInterests || false}
            onValueChange={(value) => updateNestedFormData('privacy', 'showInterests', value)}
          />
        </View>

        <View style={styles.switchItem}>
          <View>
            <Text style={styles.switchLabel}>Show Memberships</Text>
            <Text style={styles.switchDescription}>Display your circle memberships</Text>
          </View>
          <Switch
            value={formData.privacy?.showMemberships || false}
            onValueChange={(value) => updateNestedFormData('privacy', 'showMemberships', value)}
          />
        </View>
      </View>
    </View>
  );

  const renderActivityStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Activity Stats</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activityStats?.circlesJoined || 0}</Text>
          <Text style={styles.statLabel}>Circles Joined</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activityStats?.eventsCreated || 0}</Text>
          <Text style={styles.statLabel}>Events Created</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activityStats?.meetupsAttended || 0}</Text>
          <Text style={styles.statLabel}>Events Attended</Text>
        </View>
      </View>
    </View>
  );

  const renderSocialLinks = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Social Links</Text>
      <Text style={styles.sectionSubtitle}>Connect your social media accounts</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Website</Text>
        <TextInput
          style={[styles.textInput, errors.website && styles.inputError]}
          value={formData.socialLinks?.website || ''}
          onChangeText={(text) => updateNestedFormData('socialLinks', 'website', text)}
          placeholder="https://yourwebsite.com"
          keyboardType="url"
        />
        {errors.website && <Text style={styles.errorText}>{errors.website}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Twitter</Text>
        <TextInput
          style={[styles.textInput, errors.twitter && styles.inputError]}
          value={formData.socialLinks?.twitter || ''}
          onChangeText={(text) => updateNestedFormData('socialLinks', 'twitter', text)}
          placeholder="@username"
        />
        {errors.twitter && <Text style={styles.errorText}>{errors.twitter}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>LinkedIn</Text>
        <TextInput
          style={[styles.textInput, errors.linkedin && styles.inputError]}
          value={formData.socialLinks?.linkedin || ''}
          onChangeText={(text) => updateNestedFormData('socialLinks', 'linkedin', text)}
          placeholder="linkedin.com/in/username"
        />
        {errors.linkedin && <Text style={styles.errorText}>{errors.linkedin}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Instagram</Text>
        <TextInput
          style={[styles.textInput, errors.instagram && styles.inputError]}
          value={formData.socialLinks?.instagram || ''}
          onChangeText={(text) => updateNestedFormData('socialLinks', 'instagram', text)}
          placeholder="@username"
        />
        {errors.instagram && <Text style={styles.errorText}>{errors.instagram}</Text>}
      </View>
    </View>
  );

  const renderNotificationSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notification Preferences</Text>
      <Text style={styles.sectionSubtitle}>Choose what notifications you want to receive</Text>

      <View style={styles.switchContainer}>
        <View style={styles.switchItem}>
          <View>
            <Text style={styles.switchLabel}>Email Notifications</Text>
            <Text style={styles.switchDescription}>Receive updates via email</Text>
          </View>
          <Switch
            value={formData.notifications?.emailNotifications || false}
            onValueChange={(value) => updateNestedFormData('notifications', 'emailNotifications', value)}
          />
        </View>

        <View style={styles.switchItem}>
          <View>
            <Text style={styles.switchLabel}>Push Notifications</Text>
            <Text style={styles.switchDescription}>Receive push notifications on your device</Text>
          </View>
          <Switch
            value={formData.notifications?.pushNotifications || false}
            onValueChange={(value) => updateNestedFormData('notifications', 'pushNotifications', value)}
          />
        </View>

        <View style={styles.switchItem}>
          <View>
            <Text style={styles.switchLabel}>Meetup Reminders</Text>
            <Text style={styles.switchDescription}>Get reminded about upcoming events</Text>
          </View>
          <Switch
            value={formData.notifications?.meetupReminders || false}
            onValueChange={(value) => updateNestedFormData('notifications', 'meetupReminders', value)}
          />
        </View>

        <View style={styles.switchItem}>
          <View>
            <Text style={styles.switchLabel}>Circle Updates</Text>
            <Text style={styles.switchDescription}>Get notified about circle activities</Text>
          </View>
          <Switch
            value={formData.notifications?.circleUpdates || false}
            onValueChange={(value) => updateNestedFormData('notifications', 'circleUpdates', value)}
          />
        </View>

        <View style={styles.switchItem}>
          <View>
            <Text style={styles.switchLabel}>Message Notifications</Text>
            <Text style={styles.switchDescription}>Get notified about new messages</Text>
          </View>
          <Switch
            value={formData.notifications?.messageNotifications || false}
            onValueChange={(value) => updateNestedFormData('notifications', 'messageNotifications', value)}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.disabledButton]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {(['profile', 'privacy', 'social', 'notifications'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'profile' && (
          <>
            {renderAvatarSection()}
            {renderBasicInfo()}
            {renderInterests()}
            {activityStats && renderActivityStats()}
          </>
        )}
        {activeTab === 'privacy' && renderPrivacySettings()}
        {activeTab === 'social' && renderSocialLinks()}
        {activeTab === 'notifications' && renderNotificationSettings()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#111827',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#4361EE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4361EE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  changeAvatarIcon: {
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  interestChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedInterestChip: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4361EE',
  },
  interestText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedInterestText: {
    color: '#4361EE',
  },
  selectedCount: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#4361EE',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4361EE',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  switchContainer: {
    marginTop: 16,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default EditProfileScreen;
