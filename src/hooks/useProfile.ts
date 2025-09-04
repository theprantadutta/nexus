import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { profileService, ProfileUpdateData, SocialCard } from '../services/profile/profileService';
import { useAppStore } from '../store/useAppStore';

export const useProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { user, updateUser } = useAppStore();

  // Update profile
  const updateProfile = useCallback(async (updateData: ProfileUpdateData) => {
    if (!user) return { success: false, error: 'User not found' };

    setIsLoading(true);
    try {
      const result = await profileService.updateProfile(user.$id, updateData);
      
      if (result.success && result.data) {
        // Update local state
        updateUser(result.data);
      }
      
      return result;
    } catch (error: any) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile',
      };
    } finally {
      setIsLoading(false);
    }
  }, [user, updateUser]);

  // Upload avatar
  const uploadAvatar = useCallback(async (imageUri: string) => {
    if (!user) return { success: false, error: 'User not found' };

    setIsUploading(true);
    try {
      // Delete old avatar if exists
      if (user.avatar) {
        await profileService.deleteAvatar(user.avatar);
      }

      // Upload new avatar
      const uploadResult = await profileService.uploadAvatar(user.$id, imageUri);
      
      if (uploadResult.success && uploadResult.data) {
        // Update profile with new avatar URL
        const updateResult = await updateProfile({ avatar: uploadResult.data });
        return updateResult;
      }
      
      return uploadResult;
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload avatar',
      };
    } finally {
      setIsUploading(false);
    }
  }, [user, updateProfile]);

  // Pick and upload avatar
  const pickAndUploadAvatar = useCallback(async (source: 'camera' | 'gallery') => {
    try {
      const imageUri = await profileService.pickImage(source);
      if (imageUri) {
        return await uploadAvatar(imageUri);
      }
      return { success: false, error: 'No image selected' };
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image');
      return { success: false, error: error.message };
    }
  }, [uploadAvatar]);

  // Generate social card
  const generateSocialCard = useCallback(async (): Promise<SocialCard | null> => {
    if (!user) return null;

    try {
      const result = await profileService.generateSocialCard(user);
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Generate social card error:', error);
      return null;
    }
  }, [user]);

  // Validate profile data
  const validateProfile = useCallback((data: Partial<ProfileUpdateData>) => {
    return profileService.validateProfileData(data);
  }, []);

  // Check username availability
  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (!user) return false;
    return await profileService.checkUsernameAvailability(username, user.$id);
  }, [user]);

  // Get activity stats
  const getActivityStats = useCallback(async () => {
    if (!user) return null;
    return await profileService.getUserActivityStats(user.$id);
  }, [user]);

  // Export user data
  const exportUserData = useCallback(async () => {
    if (!user) return { success: false, error: 'User not found' };
    return await profileService.exportUserData(user.$id);
  }, [user]);

  // Delete account
  const deleteAccount = useCallback(async () => {
    if (!user) return { success: false, error: 'User not found' };
    
    return new Promise((resolve) => {
      Alert.alert(
        'Delete Account',
        'Are you sure you want to delete your account? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve({ success: false, error: 'Cancelled' }) },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const result = await profileService.deleteUserAccount(user.$id);
              resolve(result);
            },
          },
        ]
      );
    });
  }, [user]);

  return {
    // State
    isLoading,
    isUploading,
    user,
    
    // Actions
    updateProfile,
    uploadAvatar,
    pickAndUploadAvatar,
    generateSocialCard,
    validateProfile,
    checkUsernameAvailability,
    getActivityStats,
    exportUserData,
    deleteAccount,
  };
};
