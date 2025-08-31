import React, { useState } from 'react';
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
  const { user, updateUser } = useAppStore();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    locationString: user?.location ? `${user.location.city}, ${user.location.country}` : '',
    interests: user?.interests || [],
    avatar: user?.avatar || '',
    isPrivate: false,
    allowMessages: true,
    showLocation: true,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleInterest = (interest: string) => {
    const currentInterests = formData.interests;
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
        { text: 'Camera', onPress: () => console.log('Open camera') },
        { text: 'Gallery', onPress: () => console.log('Open gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    if (formData.interests.length === 0) {
      newErrors.interests = 'Please select at least one interest';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Parse location string into city and country
      const locationParts = formData.locationString.split(',').map(part => part.trim());
      const location = {
        city: locationParts[0] || '',
        country: locationParts[1] || locationParts[0] || '',
      };

      const success = await updateUser({
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        location: location,
        interests: formData.interests,
        avatar: formData.avatar,
      });

      if (success) {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: onSave }
        ]);
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
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
          value={formData.name}
          onChangeText={(text) => updateFormData('name', text)}
          placeholder="Enter your name"
          maxLength={50}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        <Text style={styles.characterCount}>{formData.name.length}/50</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Bio</Text>
        <TextInput
          style={[styles.textArea, errors.bio && styles.inputError]}
          value={formData.bio}
          onChangeText={(text) => updateFormData('bio', text)}
          placeholder="Tell us about yourself..."
          multiline
          numberOfLines={4}
          maxLength={500}
        />
        {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
        <Text style={styles.characterCount}>{formData.bio.length}/500</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Location</Text>
        <TextInput
          style={styles.textInput}
          value={formData.locationString}
          onChangeText={(text) => updateFormData('locationString', text)}
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
              formData.interests.includes(interest) && styles.selectedInterestChip
            ]}
            onPress={() => toggleInterest(interest)}
          >
            <Text style={[
              styles.interestText,
              formData.interests.includes(interest) && styles.selectedInterestText
            ]}>
              {interest}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.selectedCount}>
        {formData.interests.length} interest{formData.interests.length !== 1 ? 's' : ''} selected
      </Text>
    </View>
  );

  const renderPrivacySettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Privacy Settings</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={styles.settingLabel}>Private Profile</Text>
          <Text style={styles.settingDescription}>
            Only approved followers can see your profile
          </Text>
        </View>
        <Switch
          value={formData.isPrivate}
          onValueChange={(value) => updateFormData('isPrivate', value)}
          trackColor={{ false: '#D1D5DB', true: '#4361EE' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={styles.settingLabel}>Allow Messages</Text>
          <Text style={styles.settingDescription}>
            Let other members send you direct messages
          </Text>
        </View>
        <Switch
          value={formData.allowMessages}
          onValueChange={(value) => updateFormData('allowMessages', value)}
          trackColor={{ false: '#D1D5DB', true: '#4361EE' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={styles.settingLabel}>Show Location</Text>
          <Text style={styles.settingDescription}>
            Display your location on your profile
          </Text>
        </View>
        <Switch
          value={formData.showLocation}
          onValueChange={(value) => updateFormData('showLocation', value)}
          trackColor={{ false: '#D1D5DB', true: '#4361EE' }}
          thumbColor="#FFFFFF"
        />
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

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderAvatarSection()}
        {renderBasicInfo()}
        {renderInterests()}
        {renderPrivacySettings()}
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
});

export default EditProfileScreen;
