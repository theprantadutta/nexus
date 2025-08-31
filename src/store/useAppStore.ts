import { create } from 'zustand';
import { User, Circle, Meetup, Membership } from '../types';
import { authService } from '../services/firebase/auth';
import { databaseService } from '../services/firebase/database';

interface AppState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Data state
  circles: Circle[];
  meetups: Meetup[];
  userMemberships: Membership[];
  selectedCircle: Circle | null;
  
  // UI state
  isOnboarding: boolean;
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  
  // Data actions
  loadCircles: () => Promise<void>;
  loadMeetups: (circleId?: string) => Promise<void>;
  loadUserMemberships: () => Promise<void>;
  joinCircle: (circleId: string) => Promise<boolean>;
  createCircle: (circleData: any) => Promise<boolean>;
  createMeetup: (meetupData: any) => Promise<boolean>;
  setSelectedCircle: (circle: Circle | null) => void;
  leaveCircle: (circleId: string) => Promise<boolean>;
  getCircleMembers: (circleId: string) => Promise<User[]>;
  checkMembership: (circleId: string) => Promise<boolean>;
  
  // UI actions
  setOnboarding: (value: boolean) => void;
  setLoading: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: true,
  circles: [],
  meetups: [],
  userMemberships: [],
  selectedCircle: null,
  isOnboarding: true,

  // Auth actions
  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const result = await authService.signIn({ email, password });
      if (result.success && result.data) {
        set({ 
          user: result.data, 
          isAuthenticated: true,
          isOnboarding: false,
        });
        // Load user data
        await get().loadUserMemberships();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (name: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const result = await authService.signUp({ name, email, password, confirmPassword: password });
      if (result.success && result.data) {
        set({ 
          user: result.data, 
          isAuthenticated: true,
          isOnboarding: true, // New users need onboarding
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await authService.signOut();
      set({
        user: null,
        isAuthenticated: false,
        circles: [],
        meetups: [],
        userMemberships: [],
        selectedCircle: null,
        isOnboarding: true,
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        set({ 
          user, 
          isAuthenticated: true,
          isOnboarding: false,
        });
        // Load user data
        await get().loadUserMemberships();
      } else {
        set({ 
          user: null, 
          isAuthenticated: false,
          isOnboarding: true,
        });
      }
    } catch (error) {
      console.error('Check auth error:', error);
      set({ 
        user: null, 
        isAuthenticated: false,
        isOnboarding: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return false;

    try {
      const result = await authService.updateProfile(user.$id, updates);
      if (result.success && result.data) {
        set({ user: result.data });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  },

  // Data actions
  loadCircles: async () => {
    try {
      const result = await databaseService.getCircles();
      if (result.success && result.data) {
        set({ circles: result.data });
      }
    } catch (error) {
      console.error('Load circles error:', error);
    }
  },

  loadMeetups: async (circleId?: string) => {
    try {
      const result = await databaseService.getMeetups(circleId);
      if (result.success && result.data) {
        set({ meetups: result.data });
      }
    } catch (error) {
      console.error('Load meetups error:', error);
    }
  },

  loadUserMemberships: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const result = await databaseService.getUserMemberships(user.$id);
      if (result.success && result.data) {
        set({ userMemberships: result.data });
      }
    } catch (error) {
      console.error('Load user memberships error:', error);
    }
  },

  joinCircle: async (circleId: string) => {
    const { user } = get();
    if (!user) return false;

    try {
      const result = await databaseService.createMembership(user.$id, circleId);
      if (result.success) {
        // Reload memberships and circles
        await get().loadUserMemberships();
        await get().loadCircles();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Join circle error:', error);
      return false;
    }
  },

  createCircle: async (circleData: any) => {
    const { user } = get();
    if (!user) return false;

    try {
      const result = await databaseService.createCircle(user.$id, circleData);
      if (result.success) {
        // Reload circles and memberships
        await get().loadCircles();
        await get().loadUserMemberships();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Create circle error:', error);
      return false;
    }
  },

  createMeetup: async (meetupData: any) => {
    const { user } = get();
    if (!user) return false;

    try {
      const result = await databaseService.createMeetup(user.$id, meetupData);
      if (result.success) {
        // Reload meetups
        await get().loadMeetups();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Create meetup error:', error);
      return false;
    }
  },

  setSelectedCircle: (circle: Circle | null) => {
    set({ selectedCircle: circle });
  },

  leaveCircle: async (circleId: string) => {
    const { user } = get();
    if (!user) return false;

    try {
      const result = await databaseService.leaveMembership(user.$id, circleId);
      if (result.success) {
        // Reload memberships and circles
        await get().loadUserMemberships();
        await get().loadCircles();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Leave circle error:', error);
      return false;
    }
  },

  getCircleMembers: async (circleId: string) => {
    try {
      const result = await databaseService.getCircleMembers(circleId);
      if (result.success && result.data) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Get circle members error:', error);
      return [];
    }
  },

  checkMembership: async (circleId: string) => {
    const { user } = get();
    if (!user) return false;

    try {
      const result = await databaseService.checkMembership(user.$id, circleId);
      if (result.success && result.data) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Check membership error:', error);
      return false;
    }
  },

  // UI actions
  setOnboarding: (value: boolean) => {
    set({ isOnboarding: value });
  },

  setLoading: (value: boolean) => {
    set({ isLoading: value });
  },
}));
