# Nexus 🌟

**A premium social platform for hobby groups and local events**

Nexus is a comprehensive React Native/Expo application that connects people through shared interests and local activities. Built with modern UI patterns, real-time features, and a focus on community building.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Expo CLI
- Firebase project (for backend services)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd nexus
npm install
```

2. **Configure Firebase**
```bash
# Copy environment template
cp .env.example .env.local

# Add your Firebase configuration to .env.local
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

3. **Start the development server**
```bash
npx expo start
```

## ✨ Features Overview

### 🏠 **Core Platform Features**
- **User Authentication** - Secure Firebase Auth with email/password
- **Real-time Chat System** - Instant messaging with typing indicators and read receipts
- **Advanced Search & Discovery** - AI-powered recommendations and smart filtering
- **Comprehensive Profile Management** - Privacy controls, social links, and activity tracking
- **Circle Management** - Create and join hobby-based communities
- **Event System** - Organize and attend local meetups and activities

### 🎨 **Premium UI/UX**
- **Animated Gradient System** - Beautiful gradients throughout the app
- **Light/Dark Theme Support** - Seamless theme switching with system preference detection
- **60fps Animations** - Smooth, performant animations using Reanimated
- **Skeleton Loading States** - Professional loading experiences
- **Haptic Feedback** - Enhanced user interactions
- **Responsive Design** - Optimized for all screen sizes

### 🔧 **Technical Excellence**
- **TypeScript** - Full type safety across the entire codebase
- **Firebase Integration** - Real-time database, authentication, and storage
- **State Management** - Zustand for efficient global state
- **Performance Optimized** - Lazy loading, memoization, and efficient re-renders
- **Code Quality** - ESLint, Prettier, and comprehensive linting rules

## 📱 **Screen Overview**

### **Authentication Flow**
- **Onboarding** - Animated introduction with gradient CTAs
- **Login/Register** - Secure authentication with form validation
- **Interest Selection** - Personalized onboarding experience

### **Main Application**
- **Home** - Personalized feed with trending circles and upcoming events
- **Discover** - Advanced search with filters, map view, and recommendations
- **Circles** - Browse and manage hobby communities
- **Chat** - Real-time messaging with rich features
- **Profile** - Comprehensive user management and settings

### **Circle Management**
- **Circle Detail** - Parallax header with gradient overlay and sticky tabs
- **Create Circle** - Step-by-step circle creation flow
- **Member Management** - Admin tools for circle owners

### **Event System**
- **Event Detail** - Rich event information with RSVP functionality
- **Create Event** - Comprehensive event creation with location and media
- **Event Management** - Organizer tools and attendee tracking

## 🛠 **Technical Architecture**

### **Frontend Stack**
```
React Native (Expo) + TypeScript
├── State Management: Zustand
├── Navigation: Expo Router (file-based)
├── Styling: StyleSheet + Theme Tokens
├── Animations: Reanimated 3
├── UI Components: Custom + Expo
└── Development: ESLint + Prettier
```

### **Backend Services**
```
Firebase
├── Authentication: Firebase Auth
├── Database: Firestore
├── Storage: Firebase Storage
├── Real-time: Firestore Real-time
└── Security: Firestore Rules
```

### **Key Services & Hooks**

#### **Authentication**
- `src/services/auth/authService.ts` - Authentication logic
- `src/hooks/useAuth.ts` - Authentication state management
- `src/store/useAppStore.ts` - Global user state

#### **Chat System**
- `src/services/chat/chatService.ts` - Real-time messaging
- `src/hooks/useChat.ts` - Chat functionality
- `src/components/chat/` - Chat UI components

#### **Search & Discovery**
- `src/services/search/discoveryService.ts` - Advanced search engine
- `src/hooks/useDiscovery.ts` - Search state management
- Intelligent caching and recommendation algorithms

#### **Profile Management**
- `src/services/profile/profileService.ts` - Profile operations
- `src/hooks/useProfile.ts` - Profile state management
- Privacy controls and data export (GDPR compliant)

## 🎨 **Design System**

### **Theme Architecture**
```typescript
// Semantic token system
const tokens = {
  colors: { light: {...}, dark: {...} },
  gradients: { brandPrimary, brandSecondary, ... },
  spacing: { xs: 4, sm: 8, md: 16, ... },
  typography: { heading, body, caption, ... },
  radius: { sm: 8, md: 12, lg: 16, ... },
  shadows: { sm, md, lg, xl }
}
```

### **Component Library**
- **GradientButton** - Animated gradient buttons with haptics
- **Chip** - Interactive chips with press animations
- **SkeletonLoader** - Professional loading states
- **AnimatedGradientTabBar** - Custom tab bar with animations
- **SearchSuggestions** - Smart search history and suggestions

## 📊 **Data Models**

### **Core Entities**
```typescript
interface User {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  interests: string[];
  location?: Location;
  privacy?: PrivacySettings;
  socialLinks?: SocialLinks;
  notifications?: NotificationSettings;
}

interface Circle {
  $id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  location: Location;
  privacy: 'public' | 'private';
  bannerImage?: string;
}

interface Meetup {
  $id: string;
  circleId: string;
  title: string;
  description: string;
  date: string;
  location: EventLocation;
  maxAttendees?: number;
  currentAttendees: number;
  price?: number;
  isOnline: boolean;
}
```

## 🔒 **Security & Privacy**

### **Data Protection**
- **Firestore Security Rules** - Comprehensive access control
- **Privacy Controls** - Granular user privacy settings
- **Data Encryption** - All sensitive data encrypted in transit and at rest
- **GDPR Compliance** - Data export and deletion capabilities

### **Authentication Security**
- **Firebase Auth** - Industry-standard authentication
- **Session Management** - Secure token handling
- **Password Requirements** - Strong password enforcement
- **Account Recovery** - Secure password reset flow

## 🚀 **Performance Optimizations**

### **Frontend Performance**
- **Lazy Loading** - Components and screens loaded on demand
- **Memoization** - React.memo and useMemo for expensive operations
- **Image Optimization** - Efficient image loading and caching
- **List Virtualization** - Optimized rendering for large lists
- **Bundle Splitting** - Code splitting for faster initial load

### **Backend Performance**
- **Firestore Indexing** - Optimized database queries
- **Caching Strategy** - Intelligent caching with TTL
- **Real-time Optimization** - Efficient listener management
- **Batch Operations** - Grouped database operations

## 📱 **Platform Support**

### **Supported Platforms**
- **iOS** - iPhone and iPad (iOS 13+)
- **Android** - Phones and tablets (API 21+)
- **Web** - Modern browsers (Chrome, Safari, Firefox)

### **Device Features**
- **Camera Integration** - Photo capture and gallery access
- **Location Services** - GPS and location-based features
- **Push Notifications** - Real-time notifications
- **Haptic Feedback** - Enhanced user interactions
- **Biometric Authentication** - Face ID / Touch ID support

## 🧪 **Development & Testing**

### **Code Quality**
```bash
# Linting and type checking
npm run lint          # ESLint + TypeScript
npm run type-check    # TypeScript compilation
npm run format        # Prettier formatting

# Testing (when implemented)
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
```

### **Development Scripts**
```bash
# Development
npx expo start        # Start development server
npx expo start --web  # Start web development
npx expo start --ios  # Start iOS simulator
npx expo start --android # Start Android emulator

# Building
npx expo build        # Production build
npx expo export       # Export for deployment
```

## 📦 **Dependencies**

### **Core Dependencies**
- **expo** - React Native framework
- **react-native** - Mobile app framework
- **typescript** - Type safety
- **firebase** - Backend services
- **zustand** - State management
- **expo-router** - File-based navigation

### **UI & Animation**
- **expo-linear-gradient** - Gradient components
- **react-native-reanimated** - High-performance animations
- **expo-haptics** - Haptic feedback
- **expo-blur** - Blur effects

### **Development Tools**
- **eslint** - Code linting
- **prettier** - Code formatting
- **@typescript-eslint** - TypeScript linting rules

## 🗂 **Project Structure**

```
nexus/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Authentication screens
│   ├── (tabs)/                   # Main tab screens
│   └── (modals)/                 # Modal screens
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── common/               # Generic components
│   │   ├── chat/                 # Chat-specific components
│   │   ├── profile/              # Profile components
│   │   └── navigation/           # Navigation components
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # Business logic & API calls
│   │   ├── auth/                 # Authentication services
│   │   ├── chat/                 # Chat services
│   │   ├── search/               # Search & discovery
│   │   ├── profile/              # Profile management
│   │   └── firebase/             # Firebase configuration
│   ├── store/                    # Global state management
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   └── constants/                # App constants & theme
├── assets/                       # Static assets
└── docs/                         # Documentation
```

## 🎯 **Implementation Status**

### ✅ **Completed Features**
- **Authentication System** - Complete Firebase Auth integration
- **Real-time Chat** - Full messaging system with typing indicators
- **Search & Discovery** - Advanced filtering and recommendations
- **Profile Management** - Comprehensive user profile features
- **UI/UX Foundation** - Theme system, animations, and components
- **Code Quality** - TypeScript, linting, and best practices

### 🚧 **In Progress**
- **Push Notifications** - Real-time notification system
- **Advanced Testing** - Unit and integration test coverage
- **Performance Monitoring** - Analytics and error tracking

### 📋 **Future Roadmap**
- **Video Calling** - Integration for virtual events
- **Payment System** - Paid events and premium features
- **Admin Dashboard** - Platform management tools
- **Multi-language** - Internationalization support

## 🤝 **Contributing**

### **Development Guidelines**
1. **Follow TypeScript** - Maintain type safety
2. **Use Theme Tokens** - Avoid hardcoded values
3. **Write Tests** - Cover new functionality
4. **Follow Conventions** - Use established patterns
5. **Performance First** - Optimize for mobile

### **Commit Convention**
```bash
feat: add new feature
fix: bug fix
docs: documentation update
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Expo Team** - For the amazing React Native framework
- **Firebase Team** - For robust backend services
- **React Native Community** - For excellent libraries and tools
- **Design Inspiration** - Modern social platform UX patterns

---

**Built with ❤️ using React Native, Expo, and Firebase**

For questions or support, please open an issue or contact the development team.
