## Project: "Nexus" - A Social Event & Hobby Group Platform

### Concept
Nexus is a visually stunning app designed to help people discover and build local communities around shared interests and events. It moves beyond basic event listing to focus on genuine connection and group formation.

**Core Philosophy:** Instead of just finding an event to attend, you find a *group* to belong to. Users join or create "Circles" (hobby groups) which then host "Meetups" (events).

---

### Why It's a Great Expo Project

1.  **Rich UI Opportunities:** Cards for events, profiles, and groups; maps; chat interfaces; image uploading.
2.  **Complex Data Relationships:** Users > Circles > Meetups > Attendees.
3.  **Uses Multiple Device Features:**
    *   **Location:** For discovering local groups and events.
    *   **Camera/Media Library:** For uploading group and event photos.
    *   **Push Notifications:** For event reminders, new messages, and activity updates.
4.  **Full-Stack Challenge:** Implements real-time features, authentication, and complex queries.

---

### Tech Stack

*   **Frontend:** Expo (React Native) + TypeScript
*   **Styling:** **StyleSheet** + **React Native Reanimated** for complex, performant animations. (This is a chance to master the fundamentals and create buttery-smooth custom UI).
*   **State Management:** Zustand (simpler than Redux, great for this scale)
*   **Backend & Real-time:** **Firebase**.
    *   **Why?** Firebase provides a comprehensive solution with Authentication, Firestore database, Storage, and real-time capabilities. It's well-integrated with React Native and perfect for rapid development.
*   **Maps:** React Native Maps
*   **Notifications:** Expo Notifications

---

### Key Features & UI Concepts

1.  **Onboarding:** A beautiful, swipeable carousel that ends with asking for interests to personalize the feed.
2.  **Home Feed ("For You"):**
    *   A **horizontal scroll** of high-quality "Circle" cards you might like.
    *   A **vertical list** of upcoming "Meetups" from your circles and nearby, with a **parallax header image** effect.
3.  **Circle Screens:**
    *   Each has a **customizable banner image**.
    *   A segmented control to toggle between the group's *About*, *Members*, and *Upcoming Meetups*.
    *   A "Join Circle" button with a satisfying animation on press.
4.  **Meetup Creation & Discovery:**
    *   A multi-step form with a progress indicator.
    *   An interactive map picker for the location.
    *   A sleek, dismissible bottom sheet for viewing event details.
5.  **In-App Chat:**
    *   Each Circle has its own chat.
    *   Each Meetup has its own dedicated chat that becomes active 24 hours before the event.
    *   Features read receipts and real-time messaging.
6.  **Profile & "Social Card":**
    *   Users have a profile with their joined Circles and hosted Meetups.
    *   The design includes a "Social Card" that can be shared, showing their interests and membership stats.

---

### Code Snippet: Animated Circle Card Component

This component uses Reanimated to create a subtle scale animation on press.

```tsx
import { View, Text, Image, TouchableWithoutFeedback } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableWithoutFeedback);

const CircleCard = ({ circle, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: interpolate(scale.value, [1, 0.95], [1, 0.8]),
    };
  });

  const onPressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <AnimatedTouchable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
    >
      <Animated.View style={[animatedStyle]} className="w-64 mr-4 rounded-2xl overflow-hidden shadow-lg bg-white">
        {/* Banner Image */}
        <Image
          source={{ uri: circle.bannerImage }}
          className="w-full h-32"
          resizeMode="cover"
        />
        {/* Circle Info */}
        <View className="p-4">
          <Text className="text-xl font-bold text-gray-900" numberOfLines={1}>
            {circle.name}
          </Text>
          <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
            {circle.description}
          </Text>
          <View className="flex-row items-center mt-3">
            <View className="flex-row -space-x-2">
              {/* Render member avatars */}
              {circle.recentMembers?.map((member, index) => (
                <Image
                  key={index}
                  source={{ uri: member.avatar }}
                  className="w-6 h-6 rounded-full border-2 border-white"
                />
              ))}
            </View>
            <Text className="text-xs text-gray-600 ml-2">
              {circle.memberCount} members
            </Text>
          </View>
        </View>
      </Animated.View>
    </AnimatedTouchable>
  );
};

export default CircleCard;
```

---

### Visual Design Direction

*   **Aesthetic:** Modern, airy, and social. Think of the visual language of apps like Airbnb or Discord.
*   **Color Palette:**
    *   **Primary:** A vibrant but trustworthy blue (`#4361EE`).
    *   **Secondary:** Warm coral (`#FF6B6B`) for action buttons and highlights.
    *   **Neutrals:** A range of grays for text and backgrounds.
*   **Typography:** Clean and readable. Use `Inter` or `SF Pro Display`.
*   **Imagery:** Rounded corners on images, consistent use of shadows for depth, and a focus on authentic, community-oriented photos.

This project is complex enough to be impressive but modular enough to be built incrementally. It would make for an incredible portfolio piece that demonstrates skill in UI animation, state management, real-time data, and integrating a full backend-as-a-service.