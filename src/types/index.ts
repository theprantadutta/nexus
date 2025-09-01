// User Types
export interface User {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  interests: string[];
  joinedAt: string;
  location?: {
    city: string;
    country: string;
  };
}

// Circle Types
export interface Circle {
  $id: string;
  name: string;
  description: string;
  bannerImage?: string;
  category: string;
  memberCount: number;
  createdBy: string;
  location: {
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  privacy: 'public' | 'private';
  createdAt: string;
  recentMembers?: User[];
}

// Meetup Types
export interface Meetup {
  $id: string;
  circleId: string;
  title: string;
  description: string;
  date: string;
  location: {
    name: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  maxAttendees?: number;
  currentAttendees: number;
  images: string[];
  createdBy: string;
  createdAt: string;
  price?: number;
  isOnline: boolean;
  circle?: Circle;
}

// Membership Types
export interface Membership {
  $id: string;
  userId: string;
  circleId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
}

// Attendance Types
export interface Attendance {
  $id: string;
  userId: string;
  meetupId: string;
  status: 'registered' | 'attended' | 'cancelled';
  registeredAt: string;
}

// Message Types
export interface Message {
  $id: string;
  content: string;
  userId: string;
  circleId?: string;
  meetupId?: string;
  timestamp: string;
  user?: User;
}

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Discover: undefined;
  Create: undefined;
  Chats: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  CircleDetail: { circleId: string };
  MeetupDetail: { meetupId: string };
};

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreateCircleForm {
  name: string;
  description: string;
  category: string;
  bannerImage?: string;
  themeColor?: string;
  privacy: 'public' | 'private';
  location: {
    city: string;
    country: string;
  };
}

export interface CreateMeetupForm {
  title: string;
  description: string;
  date: string;
  location: {
    name: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  maxAttendees?: number;
  images: string[];
  price?: number;
  isOnline: boolean;
}
