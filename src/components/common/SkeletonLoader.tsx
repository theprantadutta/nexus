import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';



interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#F3F4F6'],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

// Predefined skeleton components for common use cases
export const CircleCardSkeleton: React.FC = () => (
  <View style={styles.circleCardSkeleton}>
    <SkeletonLoader width={120} height={80} borderRadius={8} />
    <View style={styles.circleCardContent}>
      <SkeletonLoader width="80%" height={16} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="60%" height={12} style={{ marginBottom: 4 }} />
      <SkeletonLoader width="40%" height={12} />
    </View>
  </View>
);

export const MeetupCardSkeleton: React.FC = () => (
  <View style={styles.meetupCardSkeleton}>
    <SkeletonLoader width={60} height={60} borderRadius={8} />
    <View style={styles.meetupCardContent}>
      <SkeletonLoader width="70%" height={16} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="50%" height={12} style={{ marginBottom: 4 }} />
      <SkeletonLoader width="30%" height={12} />
    </View>
    <SkeletonLoader width={80} height={32} borderRadius={16} />
  </View>
);

export const ChatItemSkeleton: React.FC = () => (
  <View style={styles.chatItemSkeleton}>
    <SkeletonLoader width={48} height={48} borderRadius={24} />
    <View style={styles.chatItemContent}>
      <View style={styles.chatItemHeader}>
        <SkeletonLoader width="40%" height={16} />
        <SkeletonLoader width={60} height={12} />
      </View>
      <SkeletonLoader width="80%" height={14} style={{ marginTop: 4 }} />
    </View>
  </View>
);

export const ProfileHeaderSkeleton: React.FC = () => (
  <View style={styles.profileHeaderSkeleton}>
    <SkeletonLoader width="100%" height={120} />
    <View style={styles.profileInfoSkeleton}>
      <SkeletonLoader width={80} height={80} borderRadius={40} style={styles.avatarSkeleton} />
      <SkeletonLoader width="60%" height={20} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="80%" height={14} style={{ marginBottom: 16 }} />
      <View style={styles.statsRowSkeleton}>
        <View style={styles.statItemSkeleton}>
          <SkeletonLoader width={40} height={16} style={{ marginBottom: 4 }} />
          <SkeletonLoader width={60} height={12} />
        </View>
        <View style={styles.statItemSkeleton}>
          <SkeletonLoader width={40} height={16} style={{ marginBottom: 4 }} />
          <SkeletonLoader width={60} height={12} />
        </View>
        <View style={styles.statItemSkeleton}>
          <SkeletonLoader width={40} height={16} style={{ marginBottom: 4 }} />
          <SkeletonLoader width={60} height={12} />
        </View>
      </View>
    </View>
  </View>
);

export const NotificationItemSkeleton: React.FC = () => (
  <View style={styles.notificationItemSkeleton}>
    <SkeletonLoader width={40} height={40} borderRadius={20} />
    <View style={styles.notificationContentSkeleton}>
      <SkeletonLoader width="70%" height={16} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="90%" height={14} style={{ marginBottom: 4 }} />
      <SkeletonLoader width="30%" height={12} />
    </View>
  </View>
);

export const ListSkeleton: React.FC<{ count?: number; renderItem: () => React.ReactElement }> = ({
  count = 5,
  renderItem,
}) => (
  <View>
    {Array.from({ length: count }, (_, index) => (
      <View key={index} style={{ marginBottom: 16 }}>
        {renderItem()}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  circleCardSkeleton: {
    width: 120,
    marginRight: 16,
  },
  circleCardContent: {
    marginTop: 8,
  },
  meetupCardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    marginBottom: 1,
  },
  meetupCardContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
  },
  chatItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  chatItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  chatItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileHeaderSkeleton: {
    backgroundColor: 'white',
    marginBottom: 16,
  },
  profileInfoSkeleton: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  avatarSkeleton: {
    marginTop: -40,
    marginBottom: 16,
  },
  statsRowSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 16,
  },
  statItemSkeleton: {
    alignItems: 'center',
  },
  notificationItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  notificationContentSkeleton: {
    flex: 1,
    marginLeft: 12,
  },
});

export default SkeletonLoader;
