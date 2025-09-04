import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

import { storage, db, collections } from '../firebase/config';
import { User, ApiResponse } from '../../types';

export interface ProfileUpdateData {
  name?: string;
  bio?: string;
  avatar?: string;
  interests?: string[];
  location?: {
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  privacy?: {
    isPrivate: boolean;
    allowMessages: boolean;
    showLocation: boolean;
    showInterests: boolean;
    showMemberships: boolean;
  };
  socialLinks?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  notifications?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    meetupReminders: boolean;
    circleUpdates: boolean;
    messageNotifications: boolean;
  };
}

export interface SocialCard {
  userId: string;
  userName: string;
  userAvatar?: string;
  userBio?: string;
  qrCodeData: string;
  cardImageUrl: string;
  createdAt: string;
}

class ProfileService {
  // Update user profile
  async updateProfile(userId: string, updateData: ProfileUpdateData): Promise<ApiResponse<User>> {
    try {
      const userRef = doc(db, collections.users, userId);
      
      // Get current user data
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      const currentUser = userDoc.data() as User;
      
      // Merge update data with current user data
      const updatedUser: User = {
        ...currentUser,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      // Update in Firestore (convert to plain object)
      await updateDoc(userRef, { ...updatedUser });

      return {
        success: true,
        data: updatedUser,
      };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile',
      };
    }
  }

  // Upload profile avatar
  async uploadAvatar(userId: string, imageUri: string): Promise<ApiResponse<string>> {
    try {
      // Convert image to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create unique filename
      const timestamp = Date.now();
      const fileName = `avatar_${userId}_${timestamp}.jpg`;
      const avatarRef = ref(storage, `avatars/${fileName}`);
      
      // Upload to Firebase Storage
      await uploadBytes(avatarRef, blob);
      const downloadURL = await getDownloadURL(avatarRef);
      
      return {
        success: true,
        data: downloadURL,
      };
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload avatar',
      };
    }
  }

  // Delete old avatar
  async deleteAvatar(avatarUrl: string): Promise<void> {
    try {
      if (avatarUrl && avatarUrl.includes('firebase')) {
        const avatarRef = ref(storage, avatarUrl);
        await deleteObject(avatarRef);
      }
    } catch (error) {
      console.error('Delete avatar error:', error);
      // Don't throw error as this is cleanup
    }
  }

  // Pick image from camera or gallery
  async pickImage(source: 'camera' | 'gallery'): Promise<string | null> {
    try {
      let result;
      
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          throw new Error('Camera permission is required');
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          throw new Error('Gallery permission is required');
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Pick image error:', error);
      throw error;
    }
  }

  // Generate QR code data for user
  generateQRCodeData(userId: string, userName: string): string {
    const qrData = {
      type: 'nexus_user',
      userId,
      userName,
      timestamp: Date.now(),
    };
    return JSON.stringify(qrData);
  }

  // Generate social card
  async generateSocialCard(user: User): Promise<ApiResponse<SocialCard>> {
    try {
      const qrCodeData = this.generateQRCodeData(user.$id, user.name);
      
      // Create social card data
      const socialCard: SocialCard = {
        userId: user.$id,
        userName: user.name,
        userAvatar: user.avatar,
        userBio: user.bio,
        qrCodeData,
        cardImageUrl: '', // Will be generated by a card generation service
        createdAt: new Date().toISOString(),
      };

      // In a real implementation, you would generate the card image here
      // For now, we'll just return the data
      return {
        success: true,
        data: socialCard,
      };
    } catch (error: any) {
      console.error('Generate social card error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate social card',
      };
    }
  }

  // Validate profile data
  validateProfileData(data: Partial<ProfileUpdateData>): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        errors.name = 'Name is required';
      } else if (data.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
      } else if (data.name.trim().length > 50) {
        errors.name = 'Name must be less than 50 characters';
      }
    }

    if (data.bio !== undefined) {
      if (data.bio.length > 500) {
        errors.bio = 'Bio must be less than 500 characters';
      }
    }

    if (data.socialLinks?.website) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(data.socialLinks.website)) {
        errors.website = 'Please enter a valid URL';
      }
    }

    if (data.socialLinks?.twitter) {
      const twitterPattern = /^@?[A-Za-z0-9_]{1,15}$/;
      if (!twitterPattern.test(data.socialLinks.twitter)) {
        errors.twitter = 'Please enter a valid Twitter handle';
      }
    }

    if (data.socialLinks?.instagram) {
      const instagramPattern = /^@?[A-Za-z0-9_.]{1,30}$/;
      if (!instagramPattern.test(data.socialLinks.instagram)) {
        errors.instagram = 'Please enter a valid Instagram handle';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Check username availability
  async checkUsernameAvailability(username: string, currentUserId: string): Promise<boolean> {
    try {
      const usersQuery = query(
        collection(db, collections.users),
        where('username', '==', username.toLowerCase())
      );
      
      const querySnapshot = await getDocs(usersQuery);
      
      // Username is available if no documents found, or if the only document is the current user
      return querySnapshot.empty || 
        (querySnapshot.size === 1 && querySnapshot.docs[0].id === currentUserId);
    } catch (error) {
      console.error('Check username availability error:', error);
      return false;
    }
  }

  // Get user activity stats
  async getUserActivityStats(userId: string): Promise<{
    circlesJoined: number;
    meetupsAttended: number;
    eventsCreated: number;
    connectionsCount: number;
  }> {
    try {
      // Get user memberships
      const membershipsQuery = query(
        collection(db, collections.memberships),
        where('userId', '==', userId)
      );
      const membershipsSnapshot = await getDocs(membershipsQuery);
      
      // Get user's created events (simplified - would need proper event tracking)
      const eventsQuery = query(
        collection(db, collections.meetups),
        where('createdBy', '==', userId)
      );
      const eventsSnapshot = await getDocs(eventsQuery);

      return {
        circlesJoined: membershipsSnapshot.size,
        meetupsAttended: 0, // Would need attendance tracking
        eventsCreated: eventsSnapshot.size,
        connectionsCount: 0, // Would need connections/friends system
      };
    } catch (error) {
      console.error('Get user activity stats error:', error);
      return {
        circlesJoined: 0,
        meetupsAttended: 0,
        eventsCreated: 0,
        connectionsCount: 0,
      };
    }
  }

  // Export user data (GDPR compliance)
  async exportUserData(userId: string): Promise<ApiResponse<any>> {
    try {
      // Get user profile
      const userDoc = await getDoc(doc(db, collections.users, userId));
      if (!userDoc.exists()) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      const userData = userDoc.data();
      
      // Get user memberships
      const membershipsQuery = query(
        collection(db, collections.memberships),
        where('userId', '==', userId)
      );
      const membershipsSnapshot = await getDocs(membershipsQuery);
      const memberships = membershipsSnapshot.docs.map(doc => doc.data());

      // Get user's created content
      const meetupsQuery = query(
        collection(db, collections.meetups),
        where('createdBy', '==', userId)
      );
      const meetupsSnapshot = await getDocs(meetupsQuery);
      const createdMeetups = meetupsSnapshot.docs.map(doc => doc.data());

      const exportData = {
        profile: userData,
        memberships,
        createdMeetups,
        exportedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: exportData,
      };
    } catch (error: any) {
      console.error('Export user data error:', error);
      return {
        success: false,
        error: error.message || 'Failed to export user data',
      };
    }
  }

  // Delete user account
  async deleteUserAccount(userId: string): Promise<ApiResponse<null>> {
    try {
      // This would need to be implemented carefully with proper data cleanup
      // For now, just mark as deleted
      const userRef = doc(db, collections.users, userId);
      await updateDoc(userRef, {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        // Clear sensitive data
        email: '[DELETED]',
        name: '[DELETED USER]',
        bio: '',
        avatar: '',
      });

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Delete user account error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete account',
      };
    }
  }
}

export const profileService = new ProfileService();
