import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, collections } from './config';
import { User, LoginForm, SignupForm, ApiResponse } from '../../types';

class AuthService {
  // Sign up new user
  async signUp({ name, email, password }: SignupForm): Promise<ApiResponse<User>> {
    try {
      // Create account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (!firebaseUser) {
        throw new Error('Failed to create account');
      }

      // Update display name
      await updateProfile(firebaseUser, { displayName: name });

      // Create user document in Firestore
      const userData = {
        name,
        email: firebaseUser.email,
        avatar: '',
        bio: '',
        interests: [],
        joinedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, collections.users, firebaseUser.uid), userData);

      return {
        success: true,
        data: {
          $id: firebaseUser.uid,
          name,
          email: firebaseUser.email || '',
          avatar: '',
          bio: '',
          interests: [],
          joinedAt: userData.joinedAt,
        },
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign up',
      };
    }
  }

  // Sign in user
  async signIn({ email, password }: LoginForm): Promise<ApiResponse<User>> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (!firebaseUser) {
        throw new Error('Failed to sign in');
      }

      const user = await this.getCurrentUser();

      return {
        success: true,
        data: user || undefined,
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in',
      };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) return null;

      // Get user document from Firestore
      const userDoc = await getDoc(doc(db, collections.users, firebaseUser.uid));

      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();

      return {
        $id: firebaseUser.uid,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        bio: userData.bio,
        interests: userData.interests,
        joinedAt: userData.joinedAt,
        location: userData.location,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Sign out user
  async signOut(): Promise<ApiResponse<null>> {
    try {
      await signOut(auth);
      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign out',
      };
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      await updateDoc(doc(db, collections.users, userId), updates);

      // Get updated user data
      const updatedUserDoc = await getDoc(doc(db, collections.users, userId));
      const userData = updatedUserDoc.data();

      return {
        success: true,
        data: {
          $id: userId,
          name: userData?.name,
          email: userData?.email,
          avatar: userData?.avatar,
          bio: userData?.bio,
          interests: userData?.interests,
          joinedAt: userData?.joinedAt,
          location: userData?.location,
        },
      };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile',
      };
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    return auth.currentUser !== null;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
