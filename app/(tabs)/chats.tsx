import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useAppStore } from '../../src/store/useAppStore';
import { getImageUri, formatTime } from '../../src/utils';
import { ChatItemSkeleton } from '../../src/components/common/SkeletonLoader';

interface Chat {
  $id: string;
  type: 'direct' | 'group';
  name: string;
  avatar?: string;
  lastMessage: {
    text: string;
    timestamp: string;
    senderId: string;
    senderName: string;
  };
  unreadCount: number;
  participants: string[];
  isOnline?: boolean;
}

export default function ChatsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAppStore();

  const filterChats = useCallback(() => {
    if (!searchQuery.trim()) {
      setFilteredChats(chats);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = chats.filter(chat =>
      chat.name.toLowerCase().includes(query) ||
      chat.lastMessage.text.toLowerCase().includes(query)
    );
    setFilteredChats(filtered);
  }, [searchQuery, chats]);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    filterChats();
  }, [filterChats]);

  const loadChats = async () => {
    setIsLoading(true);
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock chat data - in real app, this would come from Firebase
    const mockChats: Chat[] = [
      {
        $id: '1',
        type: 'group',
        name: 'Tech Enthusiasts',
        avatar: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=100',
        lastMessage: {
          text: 'Looking forward to the AI workshop next week!',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          senderId: 'user2',
          senderName: 'Sarah',
        },
        unreadCount: 3,
        participants: ['user1', 'user2', 'user3'],
      },
      {
        $id: '2',
        type: 'direct',
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        lastMessage: {
          text: 'Thanks for organizing the meetup!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          senderId: 'user2',
          senderName: 'John Doe',
        },
        unreadCount: 0,
        participants: ['user1', 'user2'],
        isOnline: true,
      },
      {
        $id: '3',
        type: 'group',
        name: 'Photography Circle',
        avatar: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=100',
        lastMessage: {
          text: 'Check out these amazing shots from yesterday!',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          senderId: 'user3',
          senderName: 'Mike',
        },
        unreadCount: 1,
        participants: ['user1', 'user3', 'user4'],
      },
    ];
    setChats(mockChats);
    setIsLoading(false);
  };

  const handleChatPress = (chatId: string) => {
    console.log('Navigate to chat:', chatId);
    // TODO: Navigate to chat room screen
  };

  const AnimatedChatItem = ({ item, index }: { item: Chat; index: number }) => {
    const translateX = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);

    useEffect(() => {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 });
    }, [index, opacity, scale]);

    const gestureHandler = useAnimatedGestureHandler({
      onStart: () => {
        scale.value = withSpring(0.98);
      },
      onActive: (event) => {
        translateX.value = event.translationX;
      },
      onEnd: (event) => {
        scale.value = withSpring(1);
        if (Math.abs(event.translationX) > 100) {
          // Swipe action threshold
          translateX.value = withSpring(event.translationX > 0 ? 300 : -300);
          opacity.value = withTiming(0, { duration: 200 });
        } else {
          translateX.value = withSpring(0);
        }
      },
    });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { scale: scale.value }
      ],
      opacity: opacity.value,
    }));

    return (
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={animatedStyle}>
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => handleChatPress(item.$id)}
            activeOpacity={0.7}
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: getImageUri(item.avatar) }}
                style={styles.avatar}
                resizeMode="cover"
              />
              {item.type === 'direct' && item.isOnline && (
                <View style={styles.onlineIndicator} />
              )}
              {item.type === 'group' && (
                <View style={styles.groupIndicator}>
                  <Text style={styles.groupIndicatorText}>
                    {item.participants.length}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.timestamp}>
                  {formatTime(item.lastMessage.timestamp)}
                </Text>
              </View>

              <View style={styles.messagePreview}>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.type === 'group' && item.lastMessage.senderId !== user?.$id
                    ? `${item.lastMessage.senderName}: ${item.lastMessage.text}`
                    : item.lastMessage.text
                  }
                </Text>
                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>
                      {item.unreadCount > 99 ? '99+' : item.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  const renderChatItem = ({ item, index }: { item: Chat; index: number }) => (
    <AnimatedChatItem item={item} index={index} />
  );

  const renderSkeletonList = () => (
    <View style={styles.chatList}>
      {Array.from({ length: 8 }).map((_, i) => (
        <ChatItemSkeleton key={i} />
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>💬</Text>
      <Text style={styles.emptyStateTitle}>No conversations yet</Text>
      <Text style={styles.emptyStateText}>
        Start chatting with members in your circles
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity style={styles.newChatButton}>
          <Text style={styles.newChatIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Chat List */}
      {isLoading ? (
        renderSkeletonList()
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={({ item, index }) => renderChatItem({ item, index })}
          keyExtractor={(item) => item.$id}
          style={styles.chatList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
}

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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4361EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newChatIcon: {
    fontSize: 18,
    color: 'white',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: 'white',
  },
  groupIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4361EE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  groupIndicatorText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#4361EE',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
