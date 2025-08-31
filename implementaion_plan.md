# Nexus App - Complete Implementation Guide

## Phase 1: Foundation & Setup (Week 1) ✅ COMPLETED

### 1.1 Project Initialization
```bash
npx create-expo-app nexus --template
cd nexus
npm install typescript @types/react @types/react-native
```

### 1.2 Core Dependencies Installation
```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# Animations & Styling
npm install react-native-reanimated react-native-gesture-handler
npm install nativewind tailwindcss

# State Management
npm install zustand

# Backend (Firebase)
npm install firebase

# Forms & Validation
npm install react-hook-form yup

# UI Components
npm install react-native-modal react-native-bottom-sheet
npx expo install expo-image-picker expo-location expo-notifications
```

### 1.3 Project Structure Setup
```
src/
├── screens/
│   ├── auth/
│   ├── main/
│   └── modals/
├── components/
│   ├── common/
│   ├── cards/
│   └── forms/
├── navigation/
├── services/
│   └── firebase/
├── store/
├── utils/
└── types/
```

### 1.4 Firebase Backend Setup
- Create Firebase project
- Set up Firestore database with collections:
  - **users**: name, email, avatar, bio, interests[], joinedAt
  - **circles**: name, description, bannerImage, category, memberCount, createdBy, location, createdAt
  - **meetups**: circleId, title, description, date, location, maxAttendees, images[], createdBy, createdAt
  - **memberships**: userId, circleId, role, joinedAt
  - **attendances**: userId, meetupId, status, registeredAt
  - **messages**: circleId/meetupId, userId, content, timestamp
- Configure Firebase Authentication
- Set up Firebase Storage for images

---

## Phase 2: Authentication Flow (Week 1-2) ✅ COMPLETED

### 2.1 Splash Screen
**Location**: `screens/SplashScreen.tsx`
**UI Elements**:
- Animated logo (scale and fade in using Reanimated)
- App name with tagline
- Loading indicator at bottom

### 2.2 Onboarding Carousel
**Location**: `screens/auth/OnboardingScreen.tsx`
**UI Components**:
- **Screen 1**: Welcome illustration + "Find Your People" headline
- **Screen 2**: Feature showcase card with icons (Discover Groups, Join Events, Make Friends)
- **Screen 3**: Interest selection grid (minimum 3 interests required)
  - Animated chips that scale on selection
  - Categories: Sports, Tech, Arts, Gaming, Fitness, Food, etc.
- Bottom: Progress dots + Skip/Next buttons
- Swipeable with gesture handler

### 2.3 Authentication Screens
**Location**: `screens/auth/LoginScreen.tsx` & `SignupScreen.tsx`
**UI Elements**:
- Logo at top (smaller than splash)
- Input fields with floating labels
- Social login buttons (Google, Apple)
- Animated form validation errors
- Loading states on buttons

---

## Phase 3: Main Navigation & Home Feed (Week 2) ✅ COMPLETED

### 3.1 Bottom Tab Navigation
**Location**: `navigation/TabNavigator.tsx`
**Tabs Structure**:
```
- Home (Feed icon)
- Discover (Compass icon) 
- Create (Plus icon - floating action button style)
- Chats (Message icon with badge)
- Profile (Avatar)
```

### 3.2 Home Feed Screen
**Location**: `screens/main/HomeScreen.tsx`
**UI Sections** (top to bottom):

#### Header Section:
- Location pill (current city) + notification bell icon
- Greeting text: "Good evening, [Name]"

#### Horizontal Circle Carousel:
- Section title: "Your Circles"
- `CircleCard` components in horizontal ScrollView
- Each card shows:
  - Banner image (16:9 ratio)
  - Circle name + member count
  - 3 member avatars overlapped
  - Press animation (scale down to 0.95)

#### Upcoming Meetups List:
- Section title: "This Week's Meetups" with "See All" link
- Vertical FlatList of `MeetupCard` components
- Each card contains:
  - Left: Date block (day + month)
  - Center: Event image thumbnail
  - Right side content:
    - Event title (bold, 16px)
    - Circle name (gray, 14px)
    - Location + attendee count
    - "Join" button (changes to "Joined" with animation)
- Pull-to-refresh functionality

#### Recommended Circles Section:
- Section title: "Discover New Circles"
- 2-column grid layout
- Smaller circle cards with join button

---

## Phase 4: Circle Features (Week 2-3) ✅ COMPLETED

### 4.1 Circle Detail Screen
**Location**: `screens/main/CircleDetailScreen.tsx`
**UI Layout**:

#### Parallax Header:
- Full-width banner image with parallax scroll effect
- Back button + share button overlay
- Circle name overlaid at bottom with gradient backdrop

#### Sticky Tab Navigation:
- Three tabs: About | Members | Meetups
- Animated underline indicator

#### About Tab Content:
- Description text (expandable)
- Category chips
- Created date + creator info
- Stats row (members, meetups hosted, activity level)
- Large "Join Circle" button (animated gradient)

#### Members Tab:
- Search bar at top
- Member list with roles (Admin, Moderator, Member)
- Each member row: avatar, name, join date, role badge

#### Meetups Tab:
- Upcoming meetups list
- Past meetups (grayed out)
- "Create Meetup" floating action button (only for members)

### 4.2 Create Circle Screen
**Location**: `screens/main/CreateCircleScreen.tsx`
**Multi-step Form**:

#### Step 1: Basic Info
- Circle name input
- Category dropdown
- Description textarea
- Progress bar (33%)

#### Step 2: Visuals
- Banner image upload (with crop tool)
- Avatar/icon selection
- Color theme picker
- Progress bar (66%)

#### Step 3: Settings
- Privacy (Public/Private)
- Location/Region setting
- Member limit
- Rules/guidelines textarea
- Progress bar (100%)
- "Create Circle" submit button

---

## Phase 5: Meetup Features (Week 3) ✅ COMPLETED

### 5.1 Meetup Detail Bottom Sheet
**Location**: `components/modals/MeetupDetailSheet.tsx`
**UI Elements**:
- Draggable handle at top
- Hero image carousel
- Event title + date/time pills
- Host info card (avatar + name + "Message Host" button)
- Description section
- Location card with mini-map preview
- Attendees section (avatars + "+X more" indicator)
- Sticky bottom bar:
  - Price/Free badge
  - "Register" button (animates to "Registered ✓")

### 5.2 Create Meetup Screen
**Location**: `screens/main/CreateMeetupScreen.tsx`
**Form Sections**:

#### Basic Details:
- Title input with character counter
- Date/Time picker (modal)
- Duration selector
- Max attendees slider

#### Location:
- Search bar for venues
- Interactive map with pin placement
- "Online Event" toggle

#### Details:
- Description rich text editor
- Image upload (up to 5 images)
- Tags input

#### Preview:
- Shows how the meetup will appear as a card
- "Publish" button with loading state

---

## Phase 6: Discover & Search (Week 3-4) ✅ COMPLETED

### 6.1 Discover Screen
**Location**: `screens/main/DiscoverScreen.tsx`
**UI Layout**:

#### Search Header:
- Search bar with filter icon
- Category filter chips (horizontally scrollable)

#### Map/List Toggle:
- Segmented control to switch views

#### Map View:
- Full-screen map with cluster markers
- Meetup cards appear when marker tapped
- Current location button

#### List View:
- Mixed feed of Circles and Meetups
- Section headers ("Trending Circles", "This Weekend", "New in Your Area")
- Load more on scroll

### 6.2 Search & Filters Modal
**Location**: `components/modals/FilterModal.tsx`
**Filter Options**:
- Distance radius slider
- Date range picker
- Categories multi-select
- Size preference (small/medium/large groups)
- Sort by (relevance/date/distance)

---

## Phase 7: Chat System (Week 4) ✅ COMPLETED

### 7.1 Chats List Screen
**Location**: `screens/main/ChatsScreen.tsx`
**UI Sections**:

#### Tabs:
- Circles | Meetups | Direct
- Unread count badges

#### Chat List Items:
- Avatar (circle logo or user photo)
- Name + last message preview
- Timestamp + unread indicator dot
- Swipe to archive/delete

### 7.2 Chat Room Screen
**Location**: `screens/main/ChatRoomScreen.tsx`
**UI Components**:

#### Header:
- Back button + title + info icon
- Member count (for group chats)

#### Messages Area:
- Message bubbles (different colors for sent/received)
- Read receipts
- Date separators
- Typing indicators

#### Input Bar:
- Text input with emoji button
- Image attachment button
- Send button (animates on press)

---

## Phase 8: Profile & Settings (Week 4-5)

### 8.1 Profile Screen
**Location**: `screens/main/ProfileScreen.tsx`
**UI Sections**:

#### Profile Header Card:
- Cover photo with avatar overlay
- Name + bio
- Stats row (Circles joined, Meetups attended, Member since)
- Edit Profile button

#### Social Card:
- Shareable card design
- QR code for profile
- Interests badges
- "Share Card" button

#### Content Sections:
- My Circles (grid view)
- Upcoming Meetups
- Past Meetups (collapsed by default)

### 8.2 Edit Profile Screen
**Location**: `screens/main/EditProfileScreen.tsx`
**Form Fields**:
- Avatar upload
- Name, bio inputs
- Interests selector (chips)
- Location preferences
- Notification settings toggles

---

## Phase 9: Notifications & Real-time (Week 5)

### 9.1 Notifications Screen
**Location**: `screens/main/NotificationsScreen.tsx`
**Notification Types UI**:
- New member joined your circle (avatar + action text)
- Meetup reminder (calendar icon + time remaining)
- New message (message preview)
- Meetup cancelled/updated (alert style)
- Each item has timestamp + read/unread state

### 9.2 Push Notifications Setup
- Implement expo-notifications
- Register for push tokens
- Handle deep linking to specific screens

---

## Phase 10: Polish & Optimization (Week 5-6)

### 10.1 Animation Enhancements
- Page transitions with Reanimated
- Skeleton loaders for all lists
- Pull-to-refresh animations
- Success/error toast notifications

### 10.2 Performance Optimization
- Image caching with expo-image
- FlatList optimization (getItemLayout, keyExtractor)
- Lazy loading for tabs
- Memory leak prevention in useEffect cleanups

### 10.3 Error States & Empty States
**Every screen needs**:
- Loading skeleton
- Error state with retry button
- Empty state with illustration
- Offline mode banner

### 10.4 Accessibility
- Screen reader labels
- Proper contrast ratios
- Touch target sizes (minimum 44x44)
- Keyboard navigation support

---

## Development Order Priority

### MVP Phase 1 (Core Features):
1. Authentication flow
2. Home feed with static data
3. Circle detail view
4. Basic profile

### MVP Phase 2 (Interactive Features):
1. Create/join circles
2. Create/register for meetups
3. Real-time chat for circles
4. Search and discover

### MVP Phase 3 (Polish):
1. Push notifications
2. Advanced animations
3. Social card sharing
4. Map integration

---

## Key Implementation Notes

### State Management Structure:
```typescript
// stores/useAppStore.ts
interface AppStore {
  user: User | null;
  circles: Circle[];
  meetups: Meetup[];
  selectedCircle: Circle | null;
  // Actions
  joinCircle: (circleId: string) => Promise<void>;
  registerForMeetup: (meetupId: string) => Promise<void>;
}
```

### Navigation Flow:
```
SplashScreen
  ↓
OnboardingScreen → AuthStack (Login/Signup)
  ↓
MainTabNavigator
  ├── HomeStack
  ├── DiscoverStack  
  ├── CreateModal
  ├── ChatsStack
  └── ProfileStack
```

### Critical UI Patterns:
- **Cards**: Consistent shadow, border radius (12px), padding (16px)
- **Buttons**: Primary (blue gradient), Secondary (outlined), Disabled state
- **Typography**: Consistent scale (12, 14, 16, 20, 24px)
- **Spacing**: 4px grid system (4, 8, 12, 16, 20, 24px)
- **Colors**: Semantic naming (primary, secondary, danger, success)

This implementation plan provides a complete roadmap with specific UI details for each screen, ensuring both functionality and visual polish are addressed at every step.